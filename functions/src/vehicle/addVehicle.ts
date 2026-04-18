import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

type AddVehiclePayload = {
  plateNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  color: string;
  year: number;
  nickname?: string;
  brtcVerified?: boolean;
  brtcData?: Record<string, unknown> | null;
};

function normalizePayload(rawData: unknown): AddVehiclePayload {
  const wrapper = rawData as { data?: AddVehiclePayload };
  return wrapper?.data ?? (rawData as AddVehiclePayload);
}

export const addVehicle = functions.https.onCall(async (rawData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const userId = context.auth.uid;
  const data = normalizePayload(rawData);
  const plateNumber = (data.plateNumber ?? "").trim();
  if (!plateNumber) {
    throw new functions.https.HttpsError("invalid-argument", "plateNumber required");
  }

  const plateRaw = plateNumber.replace(/\s/g, "").toUpperCase();
  const existing = await admin
    .firestore()
    .collection("vehicles")
    .where("plate_number_raw", "==", plateRaw)
    .where("owner_uid", "==", userId)
    .limit(1)
    .get();

  if (!existing.empty) {
    throw new functions.https.HttpsError(
      "already-exists",
      "Vehicle already registered"
    );
  }

  const vehicleRef = admin.firestore().collection("vehicles").doc();
  const now = admin.firestore.FieldValue.serverTimestamp();

  await vehicleRef.set({
    id: vehicleRef.id,
    owner_uid: userId,
    plate_number: plateNumber,
    plate_number_raw: plateRaw,
    vehicle_type: data.vehicleType || "car",
    make: data.make || "",
    model: data.model || "",
    color: data.color || "",
    year: Number(data.year) || new Date().getFullYear(),
    nickname: data.nickname || "",
    brtc_status: data.brtcVerified ? "api_verified" : "pending_manual",
    brtc_data: data.brtcData ?? null,
    is_active: false,
    created_at: now,
    updated_at: now,
  });

  return { vehicleId: vehicleRef.id };
});
