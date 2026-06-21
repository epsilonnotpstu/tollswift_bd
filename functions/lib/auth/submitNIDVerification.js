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
exports.submitNIDVerification = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const notificationHelper_1 = require("../notifications/notificationHelper");
function normalizePayload(rawData) {
    const wrapper = rawData;
    return (wrapper.data ?? rawData);
}
exports.submitNIDVerification = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const data = normalizePayload(rawData);
    const userId = context.auth.uid;
    const nidNumber = (data.nidNumber ?? "").trim();
    if (!/^\d{10}$|^\d{17}$/.test(nidNumber)) {
        throw new functions.https.HttpsError("invalid-argument", "NID number must be 10 or 17 digits");
    }
    if (!data.nidFrontUrl || !data.nidBackUrl || !data.selfieUrl) {
        throw new functions.https.HttpsError("invalid-argument", "NID front, back and selfie URLs are required");
    }
    const ref = admin.firestore().collection("nid_verifications").doc(userId);
    await ref.set({
        user_id: userId,
        nid_number: nidNumber,
        nid_front_url: data.nidFrontUrl,
        nid_back_url: data.nidBackUrl,
        selfie_url: data.selfieUrl,
        date_of_birth: data.dateOfBirth ?? "",
        status: "pending",
        rejection_reason: "",
        submitted_at: admin.firestore.FieldValue.serverTimestamp(),
        reviewed_at: null,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await admin.firestore().collection("users").doc(userId).set({
        nid_number: nidNumber,
        nid_verified: false,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await (0, notificationHelper_1.sendPushAndLog)({
        userId,
        type: "system",
        title: "NID verification submitted",
        titleBn: "NID যাচাই অনুরোধ জমা হয়েছে",
        body: "Your NID documents were received and are under review.",
        bodyBn: "আপনার NID নথি গ্রহণ করা হয়েছে এবং যাচাই চলছে।",
        data: {
            status: "pending",
        },
    });
    return {
        success: true,
        status: "pending",
    };
});
//# sourceMappingURL=submitNIDVerification.js.map