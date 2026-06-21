import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { sendPushAndLog } from "../notifications/notificationHelper";

type PassDoc = {
  user_id: string;
  pass_type: string;
  valid_until: admin.firestore.Timestamp;
  status: string;
};

export const sendPassExpiryReminders = functions.pubsub
  .schedule("0 9 * * *")
  .timeZone("Asia/Dhaka")
  .onRun(async () => {
    const now = new Date();
    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const passes = await admin
      .firestore()
      .collection("passes")
      .where("status", "==", "active")
      .where("valid_until", ">=", admin.firestore.Timestamp.fromDate(now))
      .where("valid_until", "<=", admin.firestore.Timestamp.fromDate(inThreeDays))
      .get();

    let sent = 0;

    for (const doc of passes.docs) {
      const pass = doc.data() as PassDoc;
      const validUntil = pass.valid_until.toDate();
      const daysLeft = Math.max(
        0,
        Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      await sendPushAndLog({
        userId: pass.user_id,
        type: "pass_expiry",
        title: "Pass expiry reminder",
        titleBn: "পাসের মেয়াদ শেষ হওয়ার নোটিশ",
        body: `Your ${pass.pass_type} pass expires in ${daysLeft} day(s).`,
        bodyBn: `আপনার ${pass.pass_type} পাস ${daysLeft} দিনের মধ্যে মেয়াদ শেষ হবে।`,
        data: {
          passId: doc.id,
          daysLeft,
        },
      });

      sent += 1;
    }

    return { sent, total: passes.size };
  });
