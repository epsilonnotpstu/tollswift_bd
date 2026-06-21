import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { sendPushAndLog } from "../notifications/notificationHelper";

type ApprovePayload = {
  vehicleId: string;
};

function normalizePayload(rawData: unknown): ApprovePayload {
  const wrapper = rawData as { data?: ApprovePayload };
  return (wrapper.data ?? rawData) as ApprovePayload;
}

function assertAdmin(context: functions.https.CallableContext): void {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError("permission-denied", "Admin access required");
  }
}

export const adminApproveVehicle = functions.https.onCall(async (rawData, context) => {
  assertAdmin(context);

  const data = normalizePayload(rawData);
  if (!data.vehicleId) {
    throw new functions.https.HttpsError("invalid-argument", "vehicleId is required");
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
    brtc_status: "verified",
    verification_method: "manual_admin",
    verified_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await sendPushAndLog({
    userId: ownerUid,
    type: "system",
    title: "Vehicle verification approved",
    titleBn: "আপনার গাড়ি যাচাই হয়েছে ✓",
    body: `${vehicle.plate_number ?? "Vehicle"} has been approved by admin.`,
    bodyBn: `${vehicle.plate_number ?? "আপনার গাড়ি"} অ্যাডমিন দ্বারা অনুমোদিত হয়েছে।`,
    data: {
      vehicleId: data.vehicleId,
      status: "verified",
    },
  });

  return {
    success: true,
    vehicleId: data.vehicleId,
    status: "verified",
  };
});
