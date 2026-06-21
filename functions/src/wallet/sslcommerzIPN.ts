import axios from "axios";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { sendPushAndLog } from "../notifications/notificationHelper";

type SslIppBody = {
  tran_id?: string;
  status?: string;
  val_id?: string;
  amount?: string;
};

export const sslcommerzIPN = functions.https.onRequest(async (req, res) => {
  try {
    const body = req.body as SslIppBody;
    const tranId = body.tran_id;
    const valId = body.val_id;

    if (!tranId || !valId) {
      res.status(400).send("Missing tran_id or val_id");
      return;
    }

    const config = functions.config();
    const storeId = config.sslcommerz?.store_id;
    const storePassword = config.sslcommerz?.store_password;
    if (!storeId || !storePassword) {
      res.status(500).send("SSLCommerz config missing");
      return;
    }

    const validationUrl =
      "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php" +
      `?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;

    const validationResponse = await axios.get(validationUrl);
    const validData = validationResponse.data as { status?: string };

    if (validData.status !== "VALID" && validData.status !== "VALIDATED") {
      res.status(400).send("Invalid payment");
      return;
    }

    const txRef = admin.firestore().collection("transactions").doc(tranId);
    const txDoc = await txRef.get();
    if (!txDoc.exists) {
      res.status(404).send("Transaction not found");
      return;
    }
    if (txDoc.data()?.status !== "pending") {
      res.status(200).send("Already processed");
      return;
    }

    const tx = txDoc.data() as {
      user_id: string;
      amount: number;
      description?: string;
    };
    const userRef = admin.firestore().collection("users").doc(tx.user_id);

    await admin.firestore().runTransaction(async (trx) => {
      const userDoc = await trx.get(userRef);
      const currentBalance = (userDoc.data()?.wallet_balance as number | undefined) ?? 0;
      const newBalance = currentBalance + tx.amount;

      trx.update(userRef, {
        wallet_balance: newBalance,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      trx.update(txRef, {
        status: "success",
        balance_before: currentBalance,
        balance_after: newBalance,
        sslcommerz_val_id: valId,
        gateway_response: validationResponse.data,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await sendPushAndLog({
      userId: tx.user_id,
      type: "wallet_credit",
      title: "Wallet credited",
      titleBn: "ওয়ালেটে টাকা যোগ হয়েছে! 💰",
      body: `BDT ${(tx.amount / 100).toFixed(2)} has been added to your wallet.`,
      bodyBn: `৳${(tx.amount / 100).toFixed(2)} সফলভাবে যোগ হয়েছে`,
      data: {
        transactionId: tranId,
        amount: tx.amount,
      },
    });

    res.status(200).send("IPN processed");
  } catch (error) {
    functions.logger.error("sslcommerzIPN error", error);
    res.status(500).send("Internal error");
  }
});
