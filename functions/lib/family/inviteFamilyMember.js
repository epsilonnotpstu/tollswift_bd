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
exports.inviteFamilyMember = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const notificationHelper_1 = require("../notifications/notificationHelper");
function normalizePayload(rawData) {
    const wrapper = rawData;
    return (wrapper.data ?? rawData);
}
function normalizePhone(value) {
    return value.replace(/\s+/g, "").replace(/-/g, "");
}
exports.inviteFamilyMember = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const data = normalizePayload(rawData);
    const callerUid = context.auth.uid;
    const phone = normalizePhone(data.phone ?? "");
    if (!data.familyId || !phone) {
        throw new functions.https.HttpsError("invalid-argument", "familyId and phone are required");
    }
    const familyRef = admin.firestore().collection("family_accounts").doc(data.familyId);
    const familyDoc = await familyRef.get();
    if (!familyDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Family account not found");
    }
    const family = familyDoc.data();
    const members = family.members ?? [];
    const callerMember = members.find((item) => item.uid === callerUid);
    const canInvite = family.owner_uid === callerUid || callerMember?.role === "admin";
    if (!canInvite) {
        throw new functions.https.HttpsError("permission-denied", "Only family admins can invite");
    }
    const userSnap = await admin
        .firestore()
        .collection("users")
        .where("phone", "==", phone)
        .limit(1)
        .get();
    if (userSnap.empty) {
        throw new functions.https.HttpsError("not-found", "No user found with this phone number");
    }
    const userDoc = userSnap.docs[0];
    const userData = userDoc.data();
    const alreadyMember = members.some((item) => item.uid === userDoc.id);
    if (alreadyMember) {
        throw new functions.https.HttpsError("already-exists", "User is already in this family");
    }
    const newMember = {
        uid: userDoc.id,
        name: userData.name_bn || userData.name || "Member",
        phone,
        role: data.role === "admin" ? "admin" : "member",
        joined_at: admin.firestore.Timestamp.now(),
    };
    await familyRef.update({
        members: [...members, newMember],
        member_uids: admin.firestore.FieldValue.arrayUnion(userDoc.id),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    await (0, notificationHelper_1.sendPushAndLog)({
        userId: userDoc.id,
        type: "system",
        title: "Family account invitation accepted",
        titleBn: "পারিবারিক অ্যাকাউন্টে আপনাকে যোগ করা হয়েছে",
        body: `You were added to ${family.name ?? "a family account"}.`,
        bodyBn: `${family.name ?? "একটি পরিবার"} অ্যাকাউন্টে আপনাকে যোগ করা হয়েছে।`,
        data: {
            familyId: data.familyId,
            role: newMember.role,
        },
    });
    return {
        success: true,
        familyId: data.familyId,
        memberUid: userDoc.id,
    };
});
//# sourceMappingURL=inviteFamilyMember.js.map