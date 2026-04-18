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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSSLPayment = exports.createSSLCommerzSession = void 0;
const axios_1 = __importDefault(require("axios"));
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
exports.createSSLCommerzSession = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const data = rawData;
    const amount = Number(data.amount);
    const paymentMethod = data.paymentMethod;
    const userId = context.auth.uid;
    if (!Number.isFinite(amount) || amount < 5000 || amount > 5000000) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid amount");
    }
    if (!paymentMethod) {
        throw new functions.https.HttpsError("invalid-argument", "Payment method required");
    }
    const transactionRef = admin.firestore().collection("transactions").doc();
    const transactionId = transactionRef.id;
    await transactionRef.set({
        id: transactionId,
        user_id: userId,
        type: "deposit",
        status: "pending",
        amount,
        payment_method: paymentMethod,
        description: `Wallet top-up via ${paymentMethod}`,
        description_bn: "ওয়ালেটে টাকা যোগ",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    const config = functions.config();
    const storeId = config.sslcommerz?.store_id;
    const storePassword = config.sslcommerz?.store_password;
    if (!storeId || !storePassword) {
        throw new functions.https.HttpsError("failed-precondition", "SSLCommerz credentials not configured");
    }
    const region = process.env.FUNCTION_REGION || "us-central1";
    const projectId = process.env.GCLOUD_PROJECT;
    const sslData = {
        store_id: storeId,
        store_passwd: storePassword,
        total_amount: amount / 100,
        currency: data.currency ?? "BDT",
        tran_id: transactionId,
        success_url: "https://tollbd.app/payment/success",
        fail_url: "https://tollbd.app/payment/fail",
        cancel_url: "https://tollbd.app/payment/cancel",
        ipn_url: `https://${region}-${projectId}.cloudfunctions.net/sslcommerzIPN`,
        cus_name: "TollBD User",
        cus_phone: context.auth.token.phone_number ?? "",
        product_name: "Wallet Top-up",
        product_category: "Digital Payment",
        shipping_method: "NO",
        num_of_item: 1,
        product_profile: "general",
    };
    const response = await axios_1.default.post("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", sslData);
    if (!response.data?.GatewayPageURL) {
        throw new functions.https.HttpsError("internal", "Unable to create payment session");
    }
    return {
        paymentUrl: response.data.GatewayPageURL,
        transactionId,
    };
});
exports.validateSSLPayment = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const transactionId = rawData.transactionId;
    if (!transactionId) {
        throw new functions.https.HttpsError("invalid-argument", "transactionId required");
    }
    const txDoc = await admin.firestore().collection("transactions").doc(transactionId).get();
    if (!txDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Transaction not found");
    }
    const data = txDoc.data();
    if (data?.user_id !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "Forbidden");
    }
    return { valid: data?.status === "success", status: data?.status ?? "pending" };
});
//# sourceMappingURL=depositMoney.js.map