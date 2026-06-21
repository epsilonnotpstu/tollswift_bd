import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { sendPushAndLog } from "../notifications/notificationHelper";

type NIDPayload = {
  nidNumber: string;
  nidFrontUrl: string;
  nidBackUrl: string;
  selfieUrl: string;
  dateOfBirth?: string;
};

function normalizePayload(rawData: unknown): NIDPayload {
  const wrapper = rawData as { data?: NIDPayload };
  return (wrapper.data ?? rawData) as NIDPayload;
}

export const submitNIDVerification = functions.https.onCall(async (rawData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const data = normalizePayload(rawData);
  const userId = context.auth.uid;

  const nidNumber = (data.nidNumber ?? "").trim();
  if (!/^\d{10}$|^\d{17}$/.test(nidNumber)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "NID number must be 10 or 17 digits"
    );
  }

  if (!data.nidFrontUrl || !data.nidBackUrl || !data.selfieUrl) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "NID front, back and selfie URLs are required"
    );
  }

  const ref = admin.firestore().collection("nid_verifications").doc(userId);
  await ref.set(
    {
      user_id: userId,
      nid_number: nidNumber,
      nid_front_url: data.nidFrontUrl,
      nid_back_url: data.nidBackUrl,
      selfie_url: data.selfieUrl,
      date_of_birth: data.dateOfBirth ?? "",
      status: "pending",
      rejection_reason: "",
      submitted_at: admin.firestore.FieldValue.serverTimestamp(),
      reviewed_at: null,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await admin.firestore().collection("users").doc(userId).set(
    {
      nid_number: nidNumber,
      nid_verified: false,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await sendPushAndLog({
    userId,
    type: "system",
    title: "NID verification submitted",
    titleBn: "NID যাচাই অনুরোধ জমা হয়েছে",
    body: "Your NID documents were received and are under review.",
    bodyBn: "আপনার NID নথি গ্রহণ করা হয়েছে এবং যাচাই চলছে।",
    data: {
      status: "pending",
    },
  });

  return {
    success: true,
    status: "pending",
  };
});
