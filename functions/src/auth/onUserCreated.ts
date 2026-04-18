import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const now = admin.firestore.FieldValue.serverTimestamp();
  await admin.firestore().collection("users").doc(uid).set(
    {
      uid,
      phone: user.phoneNumber ?? "",
      name: "",
      name_bn: "",
      email: user.email ?? null,
      avatar_url: "",
      preferred_language: "bn",
      nid_number: null,
      nid_verified: false,
      wallet_balance: 0,
      biometric_enabled: false,
      fcm_token: "",
      created_at: now,
      updated_at: now,
      account_status: "pending",
    },
    { merge: true }
  );
});
