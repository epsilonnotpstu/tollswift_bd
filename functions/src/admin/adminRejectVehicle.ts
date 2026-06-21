import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { sendPushAndLog } from "../notifications/notificationHelper";

type RejectPayload = {
  vehicleId: string;
  reason: string;
};

function normalizePayload(rawData: unknown): RejectPayload {
  const wrapper = rawData as { data?: RejectPayload };
  return (wrapper.data ?? rawData) as RejectPayload;
}

function assertAdmin(context: functions.https.CallableContext): void {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError("permission-denied", "Admin access required");
  }
}

export const adminRejectVehicle = functions.https.onCall(async (rawData, context) => {
  assertAdmin(context);

  const data = normalizePayload(rawData);
  if (!data.vehicleId || !data.reason || !data.reason.trim()) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "vehicleId and rejection reason are required"
    );
  }

  const vehicleRef = admin.firestore().collection("vehicles").doc(data.vehicleId);
  const vehicleDoc = await vehicleRef.get();
  if (!vehicleDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Vehicle not found");
  }

  const vehicle = vehicleDoc.data() as { owner_uid?: string; plate_number?: string };
  const ownerUid = vehicle.owner_uid;
  if (!ownerUid) {
    throw new functions.https.HttpsError("failed-precondition", "Vehicle owner is missing");
  }

  await vehicleRef.update({
    brtc_status: "rejected",
    rejection_reason: data.reason.trim(),
    rejected_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await sendPushAndLog({
    userId: ownerUid,
    type: "system",
    title: "Vehicle verification rejected",
    titleBn: "গাড়ি যাচাই প্রত্যাখ্যান করা হয়েছে",
    body: data.reason.trim(),
    bodyBn: `কারণ: ${data.reason.trim()}`,
    data: {
      vehicleId: data.vehicleId,
      status: "rejected",
    },
  });

  return {
    success: true,
    vehicleId: data.vehicleId,
    status: "rejected",
  };
});
