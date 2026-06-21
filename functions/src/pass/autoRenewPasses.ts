import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { sendPushAndLog } from "../notifications/notificationHelper";

type PassDoc = {
  user_id: string;
  pass_type: "monthly" | "quarterly" | "annual";
  price: number;
  valid_until: admin.firestore.Timestamp;
  auto_renew?: boolean;
  status?: string;
  vehicle_id?: string;
  vehicle_type?: string;
};

function nextValidityDate(passType: PassDoc["pass_type"], from: Date): Date {
  const next = new Date(from);
  if (passType === "monthly") {
    next.setMonth(next.getMonth() + 1);
    return next;
  }
  if (passType === "quarterly") {
    next.setMonth(next.getMonth() + 3);
    return next;
  }
  next.setFullYear(next.getFullYear() + 1);
  return next;
}

export const autoRenewPasses = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("Asia/Dhaka")
  .onRun(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const expiringPasses = await admin
      .firestore()
      .collection("passes")
      .where("status", "==", "active")
      .where("auto_renew", "==", true)
      .where("valid_until", "<=", admin.firestore.Timestamp.fromDate(tomorrow))
      .get();

    let renewed = 0;
    let failed = 0;

    for (const passDoc of expiringPasses.docs) {
      const pass = passDoc.data() as PassDoc;
      const userRef = admin.firestore().collection("users").doc(pass.user_id);
      const txRef = admin.firestore().collection("transactions").doc();

      try {
        await admin.firestore().runTransaction(async (tx) => {
          const userDoc = await tx.get(userRef);
          const balance = Number(userDoc.data()?.wallet_balance ?? 0);
          const price = Number(pass.price ?? 0);

          if (balance < price) {
            tx.update(passDoc.ref, {
              auto_renew: false,
              status: "expired",
              updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            failed += 1;
            return;
          }

          const validUntilDate = pass.valid_until.toDate();
          const newValidUntil = nextValidityDate(pass.pass_type, validUntilDate);
          const balanceAfter = balance - price;

          tx.update(userRef, {
            wallet_balance: balanceAfter,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          });

          tx.update(passDoc.ref, {
            status: "active",
            valid_until: admin.firestore.Timestamp.fromDate(newValidUntil),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          });

          tx.set(txRef, {
            id: txRef.id,
            user_id: pass.user_id,
            type: "pass_auto_renew",
            status: "success",
            amount: price,
            balance_before: balance,
            balance_after: balanceAfter,
            description: `${pass.pass_type} pass auto-renew`,
            description_bn: "পাস স্বয়ংক্রিয় নবায়ন",
            payment_method: "wallet",
            reference_id: passDoc.id,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          });

          renewed += 1;
        });

        const userDocAfter = await userRef.get();
        const statusAfter = passDoc.ref.get().then((doc) => doc.data()?.status as string | undefined);
        if ((await statusAfter) === "active") {
          await sendPushAndLog({
            userId: pass.user_id,
            type: "pass_expiry",
            title: "Pass renewed successfully",
            titleBn: "আপনার পাস সফলভাবে নবায়ন হয়েছে",
            body: "Your pass has been renewed from wallet balance.",
            bodyBn: "আপনার ওয়ালেট ব্যালেন্স থেকে পাস নবায়ন সম্পন্ন হয়েছে।",
            data: {
              passId: passDoc.id,
              walletBalance: Number(userDocAfter.data()?.wallet_balance ?? 0),
            },
          });
        } else {
          await sendPushAndLog({
            userId: pass.user_id,
            type: "pass_expiry",
            title: "Pass renewal failed",
            titleBn: "পাস নবায়ন ব্যর্থ হয়েছে",
            body: "Insufficient balance, auto-renew has been turned off.",
            bodyBn: "ব্যালেন্স অপর্যাপ্ত, স্বয়ংক্রিয় নবায়ন বন্ধ করা হয়েছে।",
            data: {
              passId: passDoc.id,
            },
          });
        }
      } catch (error) {
        failed += 1;
        functions.logger.error("autoRenewPasses failed", {
          passId: passDoc.id,
          error,
        });
      }
    }

    return {
      renewed,
      failed,
      total: expiringPasses.size,
    };
  });
