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
exports.adminApproveVehicle = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const notificationHelper_1 = require("../notifications/notificationHelper");
function normalizePayload(rawData) {
    const wrapper = rawData;
    return (wrapper.data ?? rawData);
}
function assertAdmin(context) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    if (context.auth.token.admin !== true) {
        throw new functions.https.HttpsError("permission-denied", "Admin access required");
    }
}
exports.adminApproveVehicle = functions.https.onCall(async (rawData, context) => {
    assertAdmin(context);
    const data = normalizePayload(rawData);
    if (!data.vehicleId) {
        throw new functions.https.HttpsError("invalid-argument", "vehicleId is required");
    }
    const vehicleRef = admin.firestore().collection("vehicles").doc(data.vehicleId);
    const vehicleDoc = await vehicleRef.get();
    if (!vehicleDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Vehicle not found");
    }
    const vehicle = vehicleDoc.data();
    const ownerUid = vehicle.owner_uid;
    if (!ownerUid) {
        throw new functions.https.HttpsError("failed-precondition", "Vehicle owner is missing");
    }
    await vehicleRef.update({
        brtc_status: "verified",
        verification_method: "manual_admin",
        verified_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    await (0, notificationHelper_1.sendPushAndLog)({
        userId: ownerUid,
        type: "system",
        title: "Vehicle verification approved",
        titleBn: "আপনার গাড়ি যাচাই হয়েছে ✓",
        body: `${vehicle.plate_number ?? "Vehicle"} has been approved by admin.`,
        bodyBn: `${vehicle.plate_number ?? "আপনার গাড়ি"} অ্যাডমিন দ্বারা অনুমোদিত হয়েছে।`,
        data: {
            vehicleId: data.vehicleId,
            status: "verified",
        },
    });
    return {
        success: true,
        vehicleId: data.vehicleId,
        status: "verified",
    };
});
//# sourceMappingURL=adminApproveVehicle.js.map