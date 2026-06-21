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
exports.processDisputeRefund = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const notificationHelper_1 = require("../notifications/notificationHelper");
function normalizePayload(rawData) {
    const wrapper = rawData;
    return (wrapper.data ?? rawData);
}
function assertAdmin(context) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    if (context.auth.token.admin !== true) {
        throw new functions.https.HttpsError("permission-denied", "Admin access required");
    }
}
exports.processDisputeRefund = functions.https.onCall(async (rawData, context) => {
    assertAdmin(context);
    const data = normalizePayload(rawData);
    const refundAmount = Number(data.refundAmount ?? 0);
    if (!data.disputeId || !Number.isFinite(refundAmount) || refundAmount < 0) {
        throw new functions.https.HttpsError("invalid-argument", "disputeId and a valid refundAmount are required");
    }
    const disputeRef = admin.firestore().collection("disputes").doc(data.disputeId);
    const disputeDoc = await disputeRef.get();
    if (!disputeDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Dispute not found");
    }
    const dispute = disputeDoc.data();
    const userId = dispute.user_id;
    const tollPaymentId = dispute.toll_payment_id;
    if (!userId || !tollPaymentId) {
        throw new functions.https.HttpsError("failed-precondition", "Dispute data is incomplete");
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
            throw new functions.https.HttpsError("failed-precondition", "Refund amount cannot exceed charged amount");
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
    await (0, notificationHelper_1.sendPushAndLog)({
        userId,
        type: "dispute_update",
        title: "Dispute updated",
        titleBn: "বিরোধ আপডেট হয়েছে",
        body: refundAmount > 0
            ? `A refund of ৳${(refundAmount / 100).toFixed(2)} has been issued.`
            : "Your dispute was reviewed with no monetary refund.",
        bodyBn: refundAmount > 0
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
//# sourceMappingURL=processDisputeRefund.js.map