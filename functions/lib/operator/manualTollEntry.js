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
exports.operatorManualTollEntry = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const notificationHelper_1 = require("../notifications/notificationHelper");
function normalizePayload(rawData) {
    const wrapper = rawData;
    return (wrapper.data ?? rawData);
}
function normalizePhone(value) {
    return value.replace(/\s+/g, "").replace(/-/g, "");
}
function normalizePlate(value) {
    return value.trim().toUpperCase();
}
function resolveTollAmount(tollRates, vehicleType) {
    const direct = tollRates[vehicleType];
    if (typeof direct === "number")
        return direct;
    if (vehicleType === "truck") {
        const small = tollRates.truck_small;
        const large = tollRates.truck_large;
        if (typeof small === "number")
            return small;
        if (typeof large === "number")
            return large;
    }
    if (vehicleType === "bus") {
        const small = tollRates.bus_small;
        const large = tollRates.bus_large;
        if (typeof small === "number")
            return small;
        if (typeof large === "number")
            return large;
    }
    return typeof tollRates.car === "number" ? tollRates.car : 0;
}
async function assertActiveOperator(uid, gateId) {
    const operatorDoc = await admin.firestore().collection("gate_operators").doc(uid).get();
    if (!operatorDoc.exists) {
        throw new functions.https.HttpsError("permission-denied", "Operator profile not found");
    }
    const operator = operatorDoc.data() ?? {};
    if (operator.status !== "active") {
        throw new functions.https.HttpsError("permission-denied", "Operator account is inactive");
    }
    if (operator.assigned_gate_id !== gateId) {
        throw new functions.https.HttpsError("permission-denied", "You are not assigned to this gate");
    }
    return operator;
}
async function findUserByPhone(phone) {
    const normalized = normalizePhone(phone);
    const candidates = [normalized];
    if (normalized.startsWith("+880")) {
        candidates.push(`0${normalized.slice(4)}`);
    }
    else if (normalized.startsWith("0")) {
        candidates.push(`+880${normalized.slice(1)}`);
    }
    for (const candidate of candidates) {
        const snap = await admin
            .firestore()
            .collection("users")
            .where("phone", "==", candidate)
            .limit(1)
            .get();
        if (!snap.empty)
            return snap.docs[0];
    }
    throw new functions.https.HttpsError("not-found", "No user found with this phone number");
}
async function findVehicleByPlate(plateNumber, ownerUid) {
    const plate = normalizePlate(plateNumber);
    const normalizedCandidates = [plate, plateNumber.trim()];
    for (const candidate of normalizedCandidates) {
        let query = admin
            .firestore()
            .collection("vehicles")
            .where("plate_number", "==", candidate)
            .limit(5);
        const snap = await query.get();
        if (snap.empty)
            continue;
        if (!ownerUid)
            return snap.docs[0];
        const owned = snap.docs.find((doc) => doc.data().owner_uid === ownerUid);
        if (owned)
            return owned;
    }
    throw new functions.https.HttpsError("not-found", "Vehicle not found for this user");
}
exports.operatorManualTollEntry = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const data = normalizePayload(rawData);
    if (!data.gateId || !data.plateNumber || !data.vehicleType || !data.paymentMethod) {
        throw new functions.https.HttpsError("invalid-argument", "gateId, plateNumber, vehicleType and paymentMethod are required");
    }
    if (!["cash", "app"].includes(data.paymentMethod)) {
        throw new functions.https.HttpsError("invalid-argument", "paymentMethod must be cash or app");
    }
    await assertActiveOperator(context.auth.uid, data.gateId);
    const gateRef = admin.firestore().collection("toll_gates").doc(data.gateId);
    const gateDoc = await gateRef.get();
    if (!gateDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Gate not found");
    }
    const gate = gateDoc.data();
    const amount = resolveTollAmount(gate.toll_rates || {}, data.vehicleType);
    const manualRef = admin.firestore().collection("manual_toll_entries").doc();
    if (data.paymentMethod === "cash") {
        await manualRef.set({
            id: manualRef.id,
            gate_id: data.gateId,
            operator_uid: context.auth.uid,
            plate_number: normalizePlate(data.plateNumber),
            vehicle_type: data.vehicleType,
            amount,
            payment_method: "cash",
            status: "cash_collected",
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        await gateRef.set({
            daily_vehicle_count: admin.firestore.FieldValue.increment(1),
            daily_revenue: admin.firestore.FieldValue.increment(amount),
        }, { merge: true });
        return {
            success: true,
            mode: "cash",
            manualEntryId: manualRef.id,
            amount,
        };
    }
    if (!data.userPhone) {
        throw new functions.https.HttpsError("invalid-argument", "userPhone is required for app payment");
    }
    const userDoc = await findUserByPhone(data.userPhone);
    const userId = userDoc.id;
    const vehicleDoc = await findVehicleByPlate(data.plateNumber, userId);
    const vehicle = vehicleDoc.data();
    const userRef = admin.firestore().collection("users").doc(userId);
    const paymentRef = admin.firestore().collection("toll_payments").doc();
    const transactionRef = admin.firestore().collection("transactions").doc();
    let balanceAfter = 0;
    await admin.firestore().runTransaction(async (tx) => {
        const freshUser = await tx.get(userRef);
        const walletBalance = Number(freshUser.data()?.wallet_balance ?? 0);
        if (walletBalance < amount) {
            throw new functions.https.HttpsError("failed-precondition", "Insufficient wallet balance");
        }
        balanceAfter = walletBalance - amount;
        tx.update(userRef, {
            wallet_balance: balanceAfter,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.set(paymentRef, {
            id: paymentRef.id,
            user_id: userId,
            vehicle_id: vehicleDoc.id,
            gate_id: data.gateId,
            gate_name: gate.name ?? "",
            road_name: gate.road_name ?? "",
            vehicle_plate: vehicle.plate_number,
            vehicle_type: vehicle.vehicle_type,
            amount,
            status: "success",
            payment_method: "operator_manual",
            balance_before: walletBalance,
            balance_after: balanceAfter,
            qr_payload: "manual_entry",
            gate_operator_uid: context.auth?.uid ?? "",
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.set(transactionRef, {
            id: transactionRef.id,
            user_id: userId,
            type: "toll",
            status: "success",
            amount,
            balance_before: walletBalance,
            balance_after: balanceAfter,
            description: `Manual toll payment at ${gate.name ?? "gate"}`,
            description_bn: "ম্যানুয়াল টোল পরিশোধ",
            payment_method: "wallet",
            reference_id: paymentRef.id,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.set(manualRef, {
            id: manualRef.id,
            gate_id: data.gateId,
            operator_uid: context.auth?.uid ?? "",
            plate_number: normalizePlate(data.plateNumber),
            vehicle_type: data.vehicleType,
            amount,
            payment_method: "app",
            user_id: userId,
            user_phone: normalizePhone(data.userPhone || ""),
            status: "app_charged",
            toll_payment_id: paymentRef.id,
            transaction_id: transactionRef.id,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.set(gateRef, {
            daily_vehicle_count: admin.firestore.FieldValue.increment(1),
            daily_revenue: admin.firestore.FieldValue.increment(amount),
        }, { merge: true });
    });
    await admin.database().ref(`/gates/${data.gateId}/open_signal`).set({
        userId,
        vehicleId: vehicleDoc.id,
        paymentId: paymentRef.id,
        plate: vehicle.plate_number,
        timestamp: Date.now(),
        status: "open",
    });
    await (0, notificationHelper_1.sendPushAndLog)({
        userId,
        type: "toll_payment",
        title: "Toll payment completed",
        titleBn: "টোল পরিশোধ সম্পন্ন ✓",
        body: `৳${(amount / 100).toFixed(2)} charged at ${gate.name ?? "gate"}.`,
        bodyBn: `${gate.name ?? "গেট"} এ ৳${(amount / 100).toFixed(2)} কাটা হয়েছে`,
        data: {
            paymentId: paymentRef.id,
            gateId: data.gateId,
            amount,
            balanceAfter,
            source: "operator_manual",
        },
    });
    const lowBalanceThreshold = Number(userDoc.data()?.low_balance_threshold ?? 2000);
    if (balanceAfter <= lowBalanceThreshold) {
        await (0, notificationHelper_1.sendPushAndLog)({
            userId,
            type: "low_balance",
            title: "Low wallet balance",
            titleBn: "ওয়ালেট ব্যালেন্স কম",
            body: "Please add money to avoid toll payment failures.",
            bodyBn: "টোল পেমেন্টে সমস্যা এড়াতে ওয়ালেটে টাকা যোগ করুন।",
            data: {
                balance: balanceAfter,
                threshold: lowBalanceThreshold,
            },
        });
    }
    return {
        success: true,
        mode: "app",
        manualEntryId: manualRef.id,
        paymentId: paymentRef.id,
        amount,
        balanceAfter,
        userId,
        vehicleId: vehicleDoc.id,
    };
});
//# sourceMappingURL=manualTollEntry.js.map