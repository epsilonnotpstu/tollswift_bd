"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTollGate = void 0;
exports.decodeAndVerifyQrPayload = decodeAndVerifyQrPayload;
const admin = __importStar(require("firebase-admin"));
const crypto_1 = require("crypto");
const functions = __importStar(require("firebase-functions"));
function normalizePayload(rawData) {
    const wrapper = rawData;
    return wrapper?.data ?? rawData;
}
function base64UrlDecode(input) {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return Buffer.from(padded, "base64").toString("utf8");
}
function safeEquals(a, b) {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length)
        return false;
    return (0, crypto_1.timingSafeEqual)(aBuf, bBuf);
}
function decodeAndVerifyQrPayload(qrPayload) {
    const secret = functions.config().toll?.qr_secret || "tollbd-dev-qr-secret";
    const now = Date.now();
    // JWT format: header.payload.signature (HMAC SHA256)
    const jwtParts = qrPayload.split(".");
    if (jwtParts.length === 3) {
        const [headerPart, payloadPart, signaturePart] = jwtParts;
        const signedPart = `${headerPart}.${payloadPart}`;
        const expected = (0, crypto_1.createHmac)("sha256", secret).update(signedPart).digest("base64url");
        if (!safeEquals(expected, signaturePart)) {
            throw new functions.https.HttpsError("permission-denied", "Invalid QR signature");
        }
        const payload = JSON.parse(base64UrlDecode(payloadPart));
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
    const parsed = JSON.parse(qrPayload);
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
    const expected = (0, crypto_1.createHmac)("sha256", secret).update(message).digest("hex");
    if (!safeEquals(expected, parsed.signature)) {
        throw new functions.https.HttpsError("permission-denied", "Invalid QR signature");
    }
    return {
        gate_id: gateId,
        timestamp,
        rawPayload: qrPayload,
    };
}
exports.verifyTollGate = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const data = normalizePayload(rawData);
    if (!data.qrPayload && !data.manualCode) {
        throw new functions.https.HttpsError("invalid-argument", "Either qrPayload or manualCode is required");
    }
    let gateDoc;
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
    }
    else if (data.qrPayload) {
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
            if (!byCode.empty)
                gateDoc = byCode.docs[0];
        }
        payloadEcho = decoded.rawPayload;
    }
    if (!gateDoc?.exists) {
        throw new functions.https.HttpsError("not-found", "Toll gate not found");
    }
    const gate = gateDoc.data();
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
//# sourceMappingURL=verifyTollGate.js.map