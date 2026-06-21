import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { sendPushAndLog } from "../notifications/notificationHelper";

type RefundPayload = {
  disputeId: string;
  refundAmount: number;
  adminNote?: string;
};

function normalizePayload(rawData: unknown): RefundPayload {
  const wrapper = rawData as { data?: RefundPayload };
  return (wrapper.data ?? rawData) as RefundPayload;
}

function assertAdmin(context: functions.https.CallableContext): void {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }
  if (context.auth.token.admin !== true) {
    throw new functions.https.HttpsError("permission-denied", "Admin access required");
  }
}

export const processDisputeRefund = functions.https.onCall(async (rawData, context) => {
  assertAdmin(context);

  const data = normalizePayload(rawData);
  const refundAmount = Number(data.refundAmount ?? 0);

  if (!data.disputeId || !Number.isFinite(refundAmount) || refundAmount < 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "disputeId and a valid refundAmount are required"
    );
  }

  const disputeRef = admin.firestore().collection("disputes").doc(data.disputeId);
  const disputeDoc = await disputeRef.get();

  if (!disputeDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Dispute not found");
  }

  const dispute = disputeDoc.data() as {
    user_id?: string;
    toll_payment_id?: string;
    status?: string;
  };

  const userId = dispute.user_id;
  const tollPaymentId = dispute.toll_payment_id;
  if (!userId || !tollPaymentId) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Dispute data is incomplete"
    );
  }

  const userRef = admin.firestore().collection("users").doc(userId);
  const paymentRef = admin.firestore().collection("toll_payments").doc(tollPaymentId);
  const txRef = admin.firestore().collection("transactions").doc();

  await admin.firestore().runTransaction(async (tx) => {
    const paymentDoc = await tx.get(paymentRef);
    if (!paymentDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Original payment not found");
    }

    const paymentAmount = Number(paymentDoc.data()?.amount ?? 0);
    if (refundAmount > paymentAmount) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Refund amount cannot exceed charged amount"
      );
    }

    const userDoc = await tx.get(userRef);
    const balanceBefore = Number(userDoc.data()?.wallet_balance ?? 0);
    const balanceAfter = balanceBefore + refundAmount;

    if (refundAmount > 0) {
      tx.update(userRef, {
        wallet_balance: balanceAfter,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      tx.set(txRef, {
        id: txRef.id,
        user_id: userId,
        type: "refund",
        status: "success",
        amount: refundAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: "Dispute refund",
        description_bn: "বিরোধ রিফান্ড",
        payment_method: "wallet",
        reference_id: data.disputeId,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    tx.update(disputeRef, {
      status: "resolved",
      refund_amount: refundAmount,
      admin_notes: data.adminNote ?? "",
      resolved_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      reviewed_by: context.auth?.uid ?? "",
    });

    tx.update(paymentRef, {
      status: refundAmount > 0 ? "refunded" : "resolved_no_refund",
      dispute_status: "resolved",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await sendPushAndLog({
    userId,
    type: "dispute_update",
    title: "Dispute updated",
    titleBn: "বিরোধ আপডেট হয়েছে",
    body:
      refundAmount > 0
        ? `A refund of ৳${(refundAmount / 100).toFixed(2)} has been issued.`
        : "Your dispute was reviewed with no monetary refund.",
    bodyBn:
      refundAmount > 0
        ? `৳${(refundAmount / 100).toFixed(2)} রিফান্ড প্রদান করা হয়েছে।`
        : "আপনার বিরোধ পর্যালোচনা করা হয়েছে, আর্থিক রিফান্ড দেয়া হয়নি।",
    data: {
      disputeId: data.disputeId,
      refundAmount,
      transactionId: refundAmount > 0 ? txRef.id : "",
    },
  });

  return {
    success: true,
    disputeId: data.disputeId,
    refundAmount,
    transactionId: refundAmount > 0 ? txRef.id : null,
  };
});
