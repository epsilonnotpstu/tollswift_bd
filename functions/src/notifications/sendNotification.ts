import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

type SendNotificationData = {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export const sendNotification = functions.https.onCall(
  async (rawData, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login required");
    }

    const data = rawData as SendNotificationData;
    if (!data.userId || !data.title || !data.body) {
      throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }

    const userDoc = await admin.firestore().collection("users").doc(data.userId).get();
    const token = userDoc.data()?.fcm_token as string | undefined;
    if (!token) {
      throw new functions.https.HttpsError("not-found", "FCM token not found");
    }

    const messageId = await admin.messaging().send({
      token,
      notification: {
        title: data.title,
        body: data.body,
      },
      data: data.data ?? {},
    });

    return { success: true, messageId };
  }
);
