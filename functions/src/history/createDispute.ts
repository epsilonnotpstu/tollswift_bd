import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

type CreateDisputePayload = {
  tollPaymentId: string;
  reason: "wrong_amount" | "not_my_vehicle" | "gate_error" | "double_charge" | "other";
  description?: string;
  evidenceUrls?: string[];
};

function normalizePayload(rawData: unknown): CreateDisputePayload {
  const wrapper = rawData as { data?: CreateDisputePayload };
  return wrapper?.data ?? (rawData as CreateDisputePayload);
}

export const createDispute = functions.https.onCall(async (rawData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const userId = context.auth.uid;
  const data = normalizePayload(rawData);

  if (!data.tollPaymentId || !data.reason) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "tollPaymentId and reason are required"
    );
  }

  const paymentRef = admin.firestore().collection("toll_payments").doc(data.tollPaymentId);
  const paymentDoc = await paymentRef.get();
  if (!paymentDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Payment not found");
  }
  if (paymentDoc.data()?.user_id !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Forbidden");
  }

  const disputeRef = admin.firestore().collection("disputes").doc();
  const now = admin.firestore.FieldValue.serverTimestamp();

  await admin.firestore().runTransaction(async (tx) => {
    tx.set(disputeRef, {
      id: disputeRef.id,
      user_id: userId,
      toll_payment_id: data.tollPaymentId,
      reason: data.reason,
      description: data.description || "",
      status: "open",
      admin_notes: "",
      refund_amount: 0,
      evidence_urls: data.evidenceUrls || [],
      created_at: now,
      resolved_at: null,
    });

    tx.update(paymentRef, {
      dispute_id: disputeRef.id,
      status: "disputed",
      updated_at: now,
    });
  });

  return { success: true, disputeId: disputeRef.id };
});
