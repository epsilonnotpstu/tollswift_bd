import * as admin from "firebase-admin";

export type NotificationType =
  | "toll_payment"
  | "wallet_credit"
  | "low_balance"
  | "pass_expiry"
  | "dispute_update"
  | "system";

type NotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  titleBn: string;
  body: string;
  bodyBn: string;
  data?: Record<string, string | number | boolean>;
};

function stringifyData(
  raw?: Record<string, string | number | boolean>
): Record<string, string> {
  if (!raw) return {};
  const entries = Object.entries(raw).map(([key, value]) => [key, String(value)]);
  return Object.fromEntries(entries);
}

export async function createNotificationLog(input: NotificationInput): Promise<string> {
  const ref = admin.firestore().collection("notifications_log").doc();
  await ref.set({
    id: ref.id,
    user_id: input.userId,
    type: input.type,
    title: input.title,
    title_bn: input.titleBn,
    body: input.body,
    body_bn: input.bodyBn,
    data: input.data ?? {},
    is_read: false,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    read_at: null,
  });
  return ref.id;
}

export async function sendPushAndLog(input: NotificationInput): Promise<void> {
  await createNotificationLog(input);

  const userDoc = await admin.firestore().collection("users").doc(input.userId).get();
  const fcmToken = userDoc.data()?.fcm_token as string | undefined;
  if (!fcmToken) return;

  await admin.messaging().send({
    token: fcmToken,
    notification: {
      title: input.titleBn,
      body: input.bodyBn,
    },
    data: {
      type: input.type,
      ...stringifyData(input.data),
    },
  });
}
