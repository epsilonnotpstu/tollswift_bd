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
exports.createFamilyAccount = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
function normalizePayload(rawData) {
    const wrapper = rawData;
    return (wrapper.data ?? rawData);
}
exports.createFamilyAccount = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const data = normalizePayload(rawData);
    const ownerUid = context.auth.uid;
    const name = (data.name ?? "").trim();
    if (!name) {
        throw new functions.https.HttpsError("invalid-argument", "Family name is required");
    }
    const existing = await admin
        .firestore()
        .collection("family_accounts")
        .where("owner_uid", "==", ownerUid)
        .limit(1)
        .get();
    if (!existing.empty) {
        throw new functions.https.HttpsError("already-exists", "You already have a family account");
    }
    const ownerProfile = await admin.firestore().collection("users").doc(ownerUid).get();
    const ownerData = ownerProfile.data() ?? {};
    const familyRef = admin.firestore().collection("family_accounts").doc();
    const member = {
        uid: ownerUid,
        name: ownerData.name_bn || ownerData.name || "Owner",
        phone: ownerData.phone ?? "",
        role: "admin",
        joined_at: admin.firestore.Timestamp.now(),
    };
    await familyRef.set({
        id: familyRef.id,
        owner_uid: ownerUid,
        name,
        members: [member],
        member_uids: [ownerUid],
        shared_wallet: data.sharedWallet ?? true,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {
        success: true,
        familyId: familyRef.id,
    };
});
//# sourceMappingURL=createFamilyAccount.js.map