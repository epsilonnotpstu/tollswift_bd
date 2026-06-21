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
exports.autoRenewPasses = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const notificationHelper_1 = require("../notifications/notificationHelper");
function nextValidityDate(passType, from) {
    const next = new Date(from);
    if (passType === "monthly") {
        next.setMonth(next.getMonth() + 1);
        return next;
    }
    if (passType === "quarterly") {
        next.setMonth(next.getMonth() + 3);
        return next;
    }
    next.setFullYear(next.getFullYear() + 1);
    return next;
}
exports.autoRenewPasses = functions.pubsub
    .schedule("0 0 * * *")
    .timeZone("Asia/Dhaka")
    .onRun(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expiringPasses = await admin
        .firestore()
        .collection("passes")
        .where("status", "==", "active")
        .where("auto_renew", "==", true)
        .where("valid_until", "<=", admin.firestore.Timestamp.fromDate(tomorrow))
        .get();
    let renewed = 0;
    let failed = 0;
    for (const passDoc of expiringPasses.docs) {
        const pass = passDoc.data();
        const userRef = admin.firestore().collection("users").doc(pass.user_id);
        const txRef = admin.firestore().collection("transactions").doc();
        try {
            await admin.firestore().runTransaction(async (tx) => {
                const userDoc = await tx.get(userRef);
                const balance = Number(userDoc.data()?.wallet_balance ?? 0);
                const price = Number(pass.price ?? 0);
                if (balance < price) {
                    tx.update(passDoc.ref, {
                        auto_renew: false,
                        status: "expired",
                        updated_at: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    failed += 1;
                    return;
                }
                const validUntilDate = pass.valid_until.toDate();
                const newValidUntil = nextValidityDate(pass.pass_type, validUntilDate);
                const balanceAfter = balance - price;
                tx.update(userRef, {
                    wallet_balance: balanceAfter,
                    updated_at: admin.firestore.FieldValue.serverTimestamp(),
                });
                tx.update(passDoc.ref, {
                    status: "active",
                    valid_until: admin.firestore.Timestamp.fromDate(newValidUntil),
                    updated_at: admin.firestore.FieldValue.serverTimestamp(),
                });
                tx.set(txRef, {
                    id: txRef.id,
                    user_id: pass.user_id,
                    type: "pass_auto_renew",
                    status: "success",
                    amount: price,
                    balance_before: balance,
                    balance_after: balanceAfter,
                    description: `${pass.pass_type} pass auto-renew`,
                    description_bn: "পাস স্বয়ংক্রিয় নবায়ন",
                    payment_method: "wallet",
                    reference_id: passDoc.id,
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                    updated_at: admin.firestore.FieldValue.serverTimestamp(),
                });
                renewed += 1;
            });
            const userDocAfter = await userRef.get();
            const statusAfter = passDoc.ref.get().then((doc) => doc.data()?.status);
            if ((await statusAfter) === "active") {
                await (0, notificationHelper_1.sendPushAndLog)({
                    userId: pass.user_id,
                    type: "pass_expiry",
                    title: "Pass renewed successfully",
                    titleBn: "আপনার পাস সফলভাবে নবায়ন হয়েছে",
                    body: "Your pass has been renewed from wallet balance.",
                    bodyBn: "আপনার ওয়ালেট ব্যালেন্স থেকে পাস নবায়ন সম্পন্ন হয়েছে।",
                    data: {
                        passId: passDoc.id,
                        walletBalance: Number(userDocAfter.data()?.wallet_balance ?? 0),
                    },
                });
            }
            else {
                await (0, notificationHelper_1.sendPushAndLog)({
                    userId: pass.user_id,
                    type: "pass_expiry",
                    title: "Pass renewal failed",
                    titleBn: "পাস নবায়ন ব্যর্থ হয়েছে",
                    body: "Insufficient balance, auto-renew has been turned off.",
                    bodyBn: "ব্যালেন্স অপর্যাপ্ত, স্বয়ংক্রিয় নবায়ন বন্ধ করা হয়েছে।",
                    data: {
                        passId: passDoc.id,
                    },
                });
            }
        }
        catch (error) {
            failed += 1;
            functions.logger.error("autoRenewPasses failed", {
                passId: passDoc.id,
                error,
            });
        }
    }
    return {
        renewed,
        failed,
        total: expiringPasses.size,
    };
});
//# sourceMappingURL=autoRenewPasses.js.map