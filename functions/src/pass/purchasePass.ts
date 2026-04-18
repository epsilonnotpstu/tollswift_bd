import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

type PurchasePassPayload = {
  vehicleId: string;
  vehicleType: string;
  passType: "monthly" | "quarterly" | "annual";
};

function normalizePayload(rawData: unknown): PurchasePassPayload {
  const wrapper = rawData as { data?: PurchasePassPayload };
  return wrapper?.data ?? (rawData as PurchasePassPayload);
}

const passPricing: Record<string, Record<string, number>> = {
  monthly: {
    motorcycle: 30000,
    cng: 40000,
    car: 50000,
    microbus: 70000,
    truck: 100000,
    bus: 120000,
  },
  quarterly: {
    motorcycle: 80000,
    cng: 100000,
    car: 130000,
    microbus: 180000,
    truck: 260000,
    bus: 300000,
  },
  annual: {
    motorcycle: 260000,
    cng: 320000,
    car: 450000,
    microbus: 650000,
    truck: 920000,
    bus: 1050000,
  },
};

export const purchasePass = functions.https.onCall(async (rawData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const userId = context.auth.uid;
  const data = normalizePayload(rawData);
  if (!data.vehicleId || !data.vehicleType || !data.passType) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "vehicleId, vehicleType, passType required"
    );
  }

  const price = passPricing[data.passType]?.[data.vehicleType];
  if (!price) {
    throw new functions.https.HttpsError("invalid-argument", "Unsupported pass type");
  }

  const userRef = admin.firestore().collection("users").doc(userId);
  const vehicleRef = admin.firestore().collection("vehicles").doc(data.vehicleId);
  const passRef = admin.firestore().collection("passes").doc();
  const txRef = admin.firestore().collection("transactions").doc();

  const validFrom = admin.firestore.Timestamp.now();
  const validUntil = admin.firestore.Timestamp.fromDate(
    new Date(
      Date.now() +
        (data.passType === "monthly"
          ? 30
          : data.passType === "quarterly"
          ? 90
          : 365) *
          24 *
          60 *
          60 *
          1000
    )
  );

  let balanceAfter = 0;

  await admin.firestore().runTransaction(async (tx) => {
    const vehicleDoc = await tx.get(vehicleRef);
    if (!vehicleDoc.exists || vehicleDoc.data()?.owner_uid !== userId) {
      throw new functions.https.HttpsError("permission-denied", "Not your vehicle");
    }

    const userDoc = await tx.get(userRef);
    const currentBalance = (userDoc.data()?.wallet_balance as number | undefined) ?? 0;
    if (currentBalance < price) {
      throw new functions.https.HttpsError("failed-precondition", "Insufficient balance");
    }
    balanceAfter = currentBalance - price;

    tx.update(userRef, {
      wallet_balance: balanceAfter,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.set(passRef, {
      id: passRef.id,
      user_id: userId,
      vehicle_id: data.vehicleId,
      pass_type: data.passType,
      vehicle_type: data.vehicleType,
      price,
      status: "active",
      valid_from: validFrom,
      valid_until: validUntil,
      auto_renew: false,
      covered_gates: ["all"],
      transaction_id: txRef.id,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.set(txRef, {
      id: txRef.id,
      user_id: userId,
      type: "pass_purchase",
      status: "success",
      amount: price,
      balance_before: currentBalance,
      balance_after: balanceAfter,
      description: `${data.passType} pass purchase`,
      description_bn: "টোল পাস ক্রয়",
      payment_method: "wallet",
      reference_id: passRef.id,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return {
    success: true,
    passId: passRef.id,
    transactionId: txRef.id,
    price,
    balanceAfter,
  };
});
