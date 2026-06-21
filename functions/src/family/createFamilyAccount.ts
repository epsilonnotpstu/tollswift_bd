import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

type CreateFamilyPayload = {
  name: string;
  sharedWallet?: boolean;
};

function normalizePayload(rawData: unknown): CreateFamilyPayload {
  const wrapper = rawData as { data?: CreateFamilyPayload };
  return (wrapper.data ?? rawData) as CreateFamilyPayload;
}

export const createFamilyAccount = functions.https.onCall(async (rawData, context) => {
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
    throw new functions.https.HttpsError(
      "already-exists",
      "You already have a family account"
    );
  }

  const ownerProfile = await admin.firestore().collection("users").doc(ownerUid).get();
  const ownerData = ownerProfile.data() ?? {};

  const familyRef = admin.firestore().collection("family_accounts").doc();
  const member = {
    uid: ownerUid,
    name: (ownerData.name_bn as string | undefined) || (ownerData.name as string | undefined) || "Owner",
    phone: (ownerData.phone as string | undefined) ?? "",
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
