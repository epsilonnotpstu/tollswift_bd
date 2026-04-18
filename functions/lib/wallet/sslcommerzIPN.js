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
exports.sslcommerzIPN = void 0;
const axios_1 = __importDefault(require("axios"));
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
exports.sslcommerzIPN = functions.https.onRequest(async (req, res) => {
    try {
        const body = req.body;
        const tranId = body.tran_id;
        const valId = body.val_id;
        if (!tranId || !valId) {
            res.status(400).send("Missing tran_id or val_id");
            return;
        }
        const config = functions.config();
        const storeId = config.sslcommerz?.store_id;
        const storePassword = config.sslcommerz?.store_password;
        if (!storeId || !storePassword) {
            res.status(500).send("SSLCommerz config missing");
            return;
        }
        const validationUrl = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php" +
            `?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;
        const validationResponse = await axios_1.default.get(validationUrl);
        const validData = validationResponse.data;
        if (validData.status !== "VALID" && validData.status !== "VALIDATED") {
            res.status(400).send("Invalid payment");
            return;
        }
        const txRef = admin.firestore().collection("transactions").doc(tranId);
        const txDoc = await txRef.get();
        if (!txDoc.exists) {
            res.status(404).send("Transaction not found");
            return;
        }
        if (txDoc.data()?.status !== "pending") {
            res.status(200).send("Already processed");
            return;
        }
        const tx = txDoc.data();
        const userRef = admin.firestore().collection("users").doc(tx.user_id);
        await admin.firestore().runTransaction(async (trx) => {
            const userDoc = await trx.get(userRef);
            const currentBalance = userDoc.data()?.wallet_balance ?? 0;
            const newBalance = currentBalance + tx.amount;
            trx.update(userRef, {
                wallet_balance: newBalance,
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            trx.update(txRef, {
                status: "success",
                balance_before: currentBalance,
                balance_after: newBalance,
                sslcommerz_val_id: valId,
                gateway_response: validationResponse.data,
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        });
        const userDoc = await userRef.get();
        const fcmToken = userDoc.data()?.fcm_token;
        if (fcmToken) {
            await admin.messaging().send({
                token: fcmToken,
                notification: {
                    title: "ওয়ালেটে টাকা যোগ হয়েছে! 💰",
                    body: `৳${(tx.amount / 100).toFixed(2)} সফলভাবে যোগ হয়েছে`,
                },
                data: { type: "wallet_credit", transaction_id: tranId },
            });
        }
        res.status(200).send("IPN processed");
    }
    catch (error) {
        functions.logger.error("sslcommerzIPN error", error);
        res.status(500).send("Internal error");
    }
});
//# sourceMappingURL=sslcommerzIPN.js.map