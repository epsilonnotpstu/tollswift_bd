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
exports.sendPassExpiryReminders = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const notificationHelper_1 = require("../notifications/notificationHelper");
exports.sendPassExpiryReminders = functions.pubsub
    .schedule("0 9 * * *")
    .timeZone("Asia/Dhaka")
    .onRun(async () => {
    const now = new Date();
    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);
    const passes = await admin
        .firestore()
        .collection("passes")
        .where("status", "==", "active")
        .where("valid_until", ">=", admin.firestore.Timestamp.fromDate(now))
        .where("valid_until", "<=", admin.firestore.Timestamp.fromDate(inThreeDays))
        .get();
    let sent = 0;
    for (const doc of passes.docs) {
        const pass = doc.data();
        const validUntil = pass.valid_until.toDate();
        const daysLeft = Math.max(0, Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        await (0, notificationHelper_1.sendPushAndLog)({
            userId: pass.user_id,
            type: "pass_expiry",
            title: "Pass expiry reminder",
            titleBn: "পাসের মেয়াদ শেষ হওয়ার নোটিশ",
            body: `Your ${pass.pass_type} pass expires in ${daysLeft} day(s).`,
            bodyBn: `আপনার ${pass.pass_type} পাস ${daysLeft} দিনের মধ্যে মেয়াদ শেষ হবে।`,
            data: {
                passId: doc.id,
                daysLeft,
            },
        });
        sent += 1;
    }
    return { sent, total: passes.size };
});
//# sourceMappingURL=sendPassExpiryReminders.js.map