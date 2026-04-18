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
exports.createDispute = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
function normalizePayload(rawData) {
    const wrapper = rawData;
    return wrapper?.data ?? rawData;
}
exports.createDispute = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const userId = context.auth.uid;
    const data = normalizePayload(rawData);
    if (!data.tollPaymentId || !data.reason) {
        throw new functions.https.HttpsError("invalid-argument", "tollPaymentId and reason are required");
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
//# sourceMappingURL=createDispute.js.map