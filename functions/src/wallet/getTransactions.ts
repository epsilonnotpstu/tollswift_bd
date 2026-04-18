import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const getTransactions = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const uid = context.auth.uid;
  const snapshot = await admin
    .firestore()
    .collection("transactions")
    .where("user_id", "==", uid)
    .orderBy("created_at", "desc")
    .limit(100)
    .get();

  return snapshot.docs.map((doc) => doc.data());
});
