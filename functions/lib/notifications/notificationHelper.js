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
exports.createNotificationLog = createNotificationLog;
exports.sendPushAndLog = sendPushAndLog;
const admin = __importStar(require("firebase-admin"));
function stringifyData(raw) {
    if (!raw)
        return {};
    const entries = Object.entries(raw).map(([key, value]) => [key, String(value)]);
    return Object.fromEntries(entries);
}
async function createNotificationLog(input) {
    const ref = admin.firestore().collection("notifications_log").doc();
    await ref.set({
        id: ref.id,
        user_id: input.userId,
        type: input.type,
        title: input.title,
        title_bn: input.titleBn,
        body: input.body,
        body_bn: input.bodyBn,
        data: input.data ?? {},
        is_read: false,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        read_at: null,
    });
    return ref.id;
}
async function sendPushAndLog(input) {
    await createNotificationLog(input);
    const userDoc = await admin.firestore().collection("users").doc(input.userId).get();
    const fcmToken = userDoc.data()?.fcm_token;
    if (!fcmToken)
        return;
    await admin.messaging().send({
        token: fcmToken,
        notification: {
            title: input.titleBn,
            body: input.bodyBn,
        },
        data: {
            type: input.type,
            ...stringifyData(input.data),
        },
    });
}
//# sourceMappingURL=notificationHelper.js.map