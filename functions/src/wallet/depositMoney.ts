import axios from "axios";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

type CreateSessionPayload = {
  amount: number;
  paymentMethod: string;
  currency?: string;
};

export const createSSLCommerzSession = functions.https.onCall(
  async (rawData, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login required");
    }

    const data = rawData as CreateSessionPayload;
    const amount = Number(data.amount);
    const paymentMethod = data.paymentMethod;
    const userId = context.auth.uid;

    if (!Number.isFinite(amount) || amount < 5000 || amount > 5000000) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid amount");
    }
    if (!paymentMethod) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Payment method required"
      );
    }

    const transactionRef = admin.firestore().collection("transactions").doc();
    const transactionId = transactionRef.id;

    await transactionRef.set({
      id: transactionId,
      user_id: userId,
      type: "deposit",
      status: "pending",
      amount,
      payment_method: paymentMethod,
      description: `Wallet top-up via ${paymentMethod}`,
      description_bn: "ওয়ালেটে টাকা যোগ",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const config = functions.config();
    const storeId = config.sslcommerz?.store_id;
    const storePassword = config.sslcommerz?.store_password;
    if (!storeId || !storePassword) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "SSLCommerz credentials not configured"
      );
    }

    const region = process.env.FUNCTION_REGION || "us-central1";
    const projectId = process.env.GCLOUD_PROJECT;

    const sslData = {
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: amount / 100,
      currency: data.currency ?? "BDT",
      tran_id: transactionId,
      success_url: "https://tollbd.app/payment/success",
      fail_url: "https://tollbd.app/payment/fail",
      cancel_url: "https://tollbd.app/payment/cancel",
      ipn_url: `https://${region}-${projectId}.cloudfunctions.net/sslcommerzIPN`,
      cus_name: "TollBD User",
      cus_phone: context.auth.token.phone_number ?? "",
      product_name: "Wallet Top-up",
      product_category: "Digital Payment",
      shipping_method: "NO",
      num_of_item: 1,
      product_profile: "general",
    };

    const response = await axios.post(
      "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      sslData
    );

    if (!response.data?.GatewayPageURL) {
      throw new functions.https.HttpsError(
        "internal",
        "Unable to create payment session"
      );
    }

    return {
      paymentUrl: response.data.GatewayPageURL as string,
      transactionId,
    };
  }
);

export const validateSSLPayment = functions.https.onCall(async (rawData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const transactionId = (rawData as { transactionId?: string }).transactionId;
  if (!transactionId) {
    throw new functions.https.HttpsError("invalid-argument", "transactionId required");
  }

  const txDoc = await admin.firestore().collection("transactions").doc(transactionId).get();
  if (!txDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Transaction not found");
  }

  const data = txDoc.data();
  if (data?.user_id !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "Forbidden");
  }

  return { valid: data?.status === "success", status: data?.status ?? "pending" };
});
