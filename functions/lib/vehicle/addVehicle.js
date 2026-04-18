"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVehicle = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
function normalizePayload(rawData) {
    const wrapper = rawData;
    return wrapper?.data ?? rawData;
}
exports.addVehicle = functions.https.onCall(async (rawData, context) => {
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
        throw new functions.https.HttpsError("already-exists", "Vehicle already registered");
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
//# sourceMappingURL=addVehicle.js.map