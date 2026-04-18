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
exports.generateOfflineQR = exports.processTollPayment = void 0;
const admin = __importStar(require("firebase-admin"));
const crypto_1 = require("crypto");
const functions = __importStar(require("firebase-functions"));
const verifyTollGate_1 = require("./verifyTollGate");
function normalizePayload(rawData) {
    const wrapper = rawData;
    return (wrapper?.data ?? rawData);
}
function resolveTollAmount(tollRates, vehicleType) {
    const direct = tollRates[vehicleType];
    if (typeof direct === "number")
        return direct;
    if (vehicleType === "truck") {
        const small = tollRates.truck_small;
        const large = tollRates.truck_large;
        return (typeof small === "number" ? small : typeof large === "number" ? large : 0);
    }
    if (vehicleType === "bus") {
        const small = tollRates.bus_small;
        const large = tollRates.bus_large;
        return (typeof small === "number" ? small : typeof large === "number" ? large : 0);
    }
    return typeof tollRates.car === "number" ? tollRates.car : 0;
}
exports.processTollPayment = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const data = normalizePayload(rawData);
    if (!data.qrPayload || !data.vehicleId) {
        throw new functions.https.HttpsError("invalid-argument", "qrPayload and vehicleId required");
    }
    const userId = context.auth.uid;
    const decodedQR = (0, verifyTollGate_1.decodeAndVerifyQrPayload)(data.qrPayload);
    const gateRef = admin.firestore().collection("toll_gates").doc(decodedQR.gate_id);
    const vehicleRef = admin.firestore().collection("vehicles").doc(data.vehicleId);
    const userRef = admin.firestore().collection("users").doc(userId);
    const paymentRef = admin.firestore().collection("toll_payments").doc();
    const transactionRef = admin.firestore().collection("transactions").doc();
    const gateDoc = await gateRef.get();
    if (!gateDoc.exists || gateDoc.data()?.status !== "active") {
        throw new functions.https.HttpsError("not-found", "Gate not active");
    }
    const gate = gateDoc.data();
    const vehicleDoc = await vehicleRef.get();
    if (!vehicleDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Vehicle not found");
    }
    const vehicle = vehicleDoc.data();
    if (vehicle.owner_uid !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Not your vehicle");
    }
    const now = admin.firestore.Timestamp.now();
    const activePassSnapshot = await admin
        .firestore()
        .collection("passes")
        .where("user_id", "==", userId)
        .where("vehicle_id", "==", data.vehicleId)
        .where("status", "==", "active")
        .where("valid_until", ">", now)
        .limit(1)
        .get();
    const hasFreePass = !activePassSnapshot.empty;
    const tollAmount = hasFreePass
        ? 0
        : resolveTollAmount(gate.toll_rates || {}, vehicle.vehicle_type);
    let balanceAfter = 0;
    await admin.firestore().runTransaction(async (tx) => {
        const userDoc = await tx.get(userRef);
        const balance = userDoc.data()?.wallet_balance ?? 0;
        if (!hasFreePass && balance < tollAmount) {
            throw new functions.https.HttpsError("failed-precondition", "Insufficient balance");
        }
        balanceAfter = balance - tollAmount;
        tx.update(userRef, {
            wallet_balance: balanceAfter,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.set(paymentRef, {
            id: paymentRef.id,
            user_id: userId,
            vehicle_id: data.vehicleId,
            gate_id: gateRef.id,
            gate_name: gate.name,
            road_name: gate.road_name,
            vehicle_plate: vehicle.plate_number,
            vehicle_type: vehicle.vehicle_type,
            amount: tollAmount,
            status: "success",
            payment_method: "wallet",
            balance_before: balance,
            balance_after: balanceAfter,
            qr_payload: data.qrPayload,
            gate_operator_uid: gate.gate_operator_uid || "",
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.set(transactionRef, {
            id: transactionRef.id,
            user_id: userId,
            type: "toll",
            status: "success",
            amount: tollAmount,
            balance_before: balance,
            balance_after: balanceAfter,
            description: `Toll payment at ${gate.name}`,
            description_bn: "টোল পরিশোধ",
            payment_method: "wallet",
            reference_id: paymentRef.id,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.set(gateRef, {
            daily_vehicle_count: admin.firestore.FieldValue.increment(1),
            daily_revenue: admin.firestore.FieldValue.increment(tollAmount),
        }, { merge: true });
    });
    await admin.database().ref(`/gates/${gateRef.id}/open_signal`).set({
        userId,
        vehicleId: data.vehicleId,
        paymentId: paymentRef.id,
        plate: vehicle.plate_number,
        timestamp: Date.now(),
        status: "open",
    });
    const userDoc = await userRef.get();
    const fcmToken = userDoc.data()?.fcm_token;
    if (fcmToken) {
        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: "টোল পরিশোধ সম্পন্ন ✓",
                body: `৳${(tollAmount / 100).toFixed(2)} কাটা হয়েছে`,
            },
            data: {
                type: "toll_payment",
                payment_id: paymentRef.id,
            },
        });
    }
    return {
        success: true,
        paymentId: paymentRef.id,
        amount: tollAmount,
        hasFreePass,
        balanceAfter,
    };
});
exports.generateOfflineQR = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const data = normalizePayload(rawData);
    const userId = context.auth.uid;
    if (!data.vehicleId || !data.reservedAmount || data.reservedAmount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "vehicleId and reservedAmount required");
    }
    const vehicleRef = admin.firestore().collection("vehicles").doc(data.vehicleId);
    const userRef = admin.firestore().collection("users").doc(userId);
    const tokenRef = admin.firestore().collection("offline_qr_tokens").doc();
    const validUntil = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
    const secret = functions.config().toll?.offline_secret || "tollbd-offline-secret";
    const tokenHash = (0, crypto_1.createHash)("sha256")
        .update(`${userId}:${data.vehicleId}:${Date.now()}:${secret}`)
        .digest("hex");
    await admin.firestore().runTransaction(async (tx) => {
        const vehicleDoc = await tx.get(vehicleRef);
        if (!vehicleDoc.exists || vehicleDoc.data()?.owner_uid !== userId) {
            throw new functions.https.HttpsError("permission-denied", "Not your vehicle");
        }
        const userDoc = await tx.get(userRef);
        const balance = userDoc.data()?.wallet_balance ?? 0;
        if (balance < data.reservedAmount) {
            throw new functions.https.HttpsError("failed-precondition", "Insufficient balance for offline token");
        }
        tx.update(userRef, {
            wallet_balance: balance - data.reservedAmount,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.set(tokenRef, {
            id: tokenRef.id,
            user_id: userId,
            vehicle_id: data.vehicleId,
            token_hash: tokenHash,
            amount_reserved: data.reservedAmount,
            valid_until: validUntil,
            status: "unused",
            used_at: null,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    return {
        id: tokenRef.id,
        user_id: userId,
        vehicle_id: data.vehicleId,
        token_hash: tokenHash,
        amount_reserved: data.reservedAmount,
        valid_until: validUntil.toDate().toISOString(),
        status: "unused",
        created_at: new Date().toISOString(),
    };
});
//# sourceMappingURL=processPayment.js.map