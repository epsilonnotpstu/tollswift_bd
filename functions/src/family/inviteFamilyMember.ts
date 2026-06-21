import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { sendPushAndLog } from "../notifications/notificationHelper";

type InviteMemberPayload = {
  familyId: string;
  phone: string;
  role?: "admin" | "member";
};

type FamilyMember = {
  uid: string;
  name: string;
  phone: string;
  role: "admin" | "member";
  joined_at: admin.firestore.Timestamp;
};

function normalizePayload(rawData: unknown): InviteMemberPayload {
  const wrapper = rawData as { data?: InviteMemberPayload };
  return (wrapper.data ?? rawData) as InviteMemberPayload;
}

function normalizePhone(value: string): string {
  return value.replace(/\s+/g, "").replace(/-/g, "");
}

export const inviteFamilyMember = functions.https.onCall(async (rawData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const data = normalizePayload(rawData);
  const callerUid = context.auth.uid;
  const phone = normalizePhone(data.phone ?? "");

  if (!data.familyId || !phone) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "familyId and phone are required"
    );
  }

  const familyRef = admin.firestore().collection("family_accounts").doc(data.familyId);
  const familyDoc = await familyRef.get();
  if (!familyDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Family account not found");
  }

  const family = familyDoc.data() as {
    owner_uid: string;
    members?: FamilyMember[];
    name?: string;
  };

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

  const newMember: FamilyMember = {
    uid: userDoc.id,
    name: (userData.name_bn as string | undefined) || (userData.name as string | undefined) || "Member",
    phone,
    role: data.role === "admin" ? "admin" : "member",
    joined_at: admin.firestore.Timestamp.now(),
  };

  await familyRef.update({
    members: [...members, newMember],
    member_uids: admin.firestore.FieldValue.arrayUnion(userDoc.id),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await sendPushAndLog({
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
