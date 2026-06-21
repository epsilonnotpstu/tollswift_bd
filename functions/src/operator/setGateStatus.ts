import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

type SetGateStatusPayload = {
  gateId: string;
  status: "active" | "inactive";
};

function normalizePayload(rawData: unknown): SetGateStatusPayload {
  const wrapper = rawData as { data?: SetGateStatusPayload };
  return (wrapper.data ?? rawData) as SetGateStatusPayload;
}

async function assertActiveOperator(
  uid: string,
  gateId: string
): Promise<admin.firestore.DocumentData> {
  const operatorDoc = await admin.firestore().collection("gate_operators").doc(uid).get();
  if (!operatorDoc.exists) {
    throw new functions.https.HttpsError("permission-denied", "Operator profile not found");
  }

  const operator = operatorDoc.data() ?? {};
  if (operator.status !== "active") {
    throw new functions.https.HttpsError("permission-denied", "Operator account is inactive");
  }
  if ((operator.assigned_gate_id as string | undefined) !== gateId) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You are not assigned to this gate"
    );
  }

  return operator;
}

export const operatorSetGateStatus = functions.https.onCall(async (rawData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const data = normalizePayload(rawData);
  if (!data.gateId || !["active", "inactive"].includes(data.status)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "gateId and a valid status are required"
    );
  }

  await assertActiveOperator(context.auth.uid, data.gateId);

  await admin.database().ref(`/gates/${data.gateId}`).update({
    status: data.status,
    last_updated: Date.now(),
  });

  return {
    success: true,
    gateId: data.gateId,
    status: data.status,
  };
});

