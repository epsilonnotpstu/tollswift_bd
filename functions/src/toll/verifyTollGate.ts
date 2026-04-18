import * as admin from "firebase-admin";
import { createHmac, timingSafeEqual } from "crypto";
import * as functions from "firebase-functions";

type VerifyPayload = {
  qrPayload?: string;
  manualCode?: string;
};

type DecodedGatePayload = {
  gate_id: string;
  timestamp: number;
  rawPayload: string;
};

function normalizePayload(rawData: unknown): VerifyPayload {
  const wrapper = rawData as { data?: VerifyPayload };
  return wrapper?.data ?? (rawData as VerifyPayload);
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function safeEquals(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function decodeAndVerifyQrPayload(qrPayload: string): DecodedGatePayload {
  const secret = functions.config().toll?.qr_secret || "tollbd-dev-qr-secret";
  const now = Date.now();

  // JWT format: header.payload.signature (HMAC SHA256)
  const jwtParts = qrPayload.split(".");
  if (jwtParts.length === 3) {
    const [headerPart, payloadPart, signaturePart] = jwtParts;
    const signedPart = `${headerPart}.${payloadPart}`;
    const expected = createHmac("sha256", secret).update(signedPart).digest("base64url");
    if (!safeEquals(expected, signaturePart)) {
      throw new functions.https.HttpsError("permission-denied", "Invalid QR signature");
    }
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as {
      gate_id?: string;
      timestamp?: number;
    };
    if (!payload.gate_id || !payload.timestamp) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid QR payload");
    }
    if (Math.abs(now - Number(payload.timestamp)) > 5 * 60 * 1000) {
      throw new functions.https.HttpsError("failed-precondition", "QR expired");
    }
    return {
      gate_id: payload.gate_id,
      timestamp: Number(payload.timestamp),
      rawPayload: qrPayload,
    };
  }

  // JSON payload fallback (must still be signed)
  const parsed = JSON.parse(qrPayload) as {
    gate_id?: string;
    gate_code?: string;
    timestamp?: number;
    signature?: string;
  };
  const gateId = parsed.gate_id || parsed.gate_code;
  if (!gateId) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid QR payload");
  }

  const timestamp = Number(parsed.timestamp || now);
  if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
    throw new functions.https.HttpsError("failed-precondition", "QR expired");
  }

  if (!parsed.signature) {
    throw new functions.https.HttpsError("permission-denied", "Unsigned QR payload");
  }
  const message = `${gateId}:${timestamp}`;
  const expected = createHmac("sha256", secret).update(message).digest("hex");
  if (!safeEquals(expected, parsed.signature)) {
    throw new functions.https.HttpsError("permission-denied", "Invalid QR signature");
  }

  return {
    gate_id: gateId,
    timestamp,
    rawPayload: qrPayload,
  };
}

export const verifyTollGate = functions.https.onCall(async (rawData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const data = normalizePayload(rawData);

  if (!data.qrPayload && !data.manualCode) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Either qrPayload or manualCode is required"
    );
  }

  let gateDoc: admin.firestore.DocumentSnapshot | undefined;
  let payloadEcho = "";

  if (data.manualCode) {
    const code = data.manualCode.trim();
    if (!/^\d{8}$/.test(code)) {
      throw new functions.https.HttpsError("invalid-argument", "manualCode must be 8 digits");
    }

    const byCode = await admin
      .firestore()
      .collection("toll_gates")
      .where("manual_code", "==", code)
      .limit(1)
      .get();

    if (!byCode.empty) {
      gateDoc = byCode.docs[0];
    }
    payloadEcho = JSON.stringify({ gate_code: code });
  } else if (data.qrPayload) {
    const decoded = decodeAndVerifyQrPayload(data.qrPayload);
    gateDoc = await admin
      .firestore()
      .collection("toll_gates")
      .doc(decoded.gate_id)
      .get();

    if (!gateDoc.exists) {
      const byCode = await admin
        .firestore()
        .collection("toll_gates")
        .where("manual_code", "==", decoded.gate_id)
        .limit(1)
        .get();
      if (!byCode.empty) gateDoc = byCode.docs[0];
    }

    payloadEcho = decoded.rawPayload;
  }

  if (!gateDoc?.exists) {
    throw new functions.https.HttpsError("not-found", "Toll gate not found");
  }

  const gate = gateDoc.data() as Record<string, unknown>;
  if (gate.status !== "active") {
    throw new functions.https.HttpsError("failed-precondition", "Gate is not active");
  }

  return {
    valid: true,
    qrPayload: payloadEcho,
    gate: {
      id: gate.id || gateDoc.id,
      name: gate.name || "",
      name_en: gate.name_en || "",
      road_name: gate.road_name || "",
      location: gate.location || null,
      address: gate.address || "",
      status: gate.status || "active",
      toll_rates: gate.toll_rates || {},
    },
  };
});
