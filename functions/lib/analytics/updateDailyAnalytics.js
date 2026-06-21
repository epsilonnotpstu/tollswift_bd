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
exports.updateDailyAnalytics = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
function formatDateYYYYMMDD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
}
function formatDateYYYYMMDDDashed(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
function startOfDayDhaka(now) {
    const dhakaNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    dhakaNow.setHours(0, 0, 0, 0);
    return dhakaNow;
}
function inferHourDhaka(date) {
    const dhaka = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    return dhaka.getHours();
}
function toCategory(vehicleType) {
    const normalized = vehicleType.toLowerCase();
    if (normalized.includes("motor") || normalized.includes("bike"))
        return "motorcycle";
    if (normalized.includes("micro"))
        return "microbus";
    if (normalized.includes("truck"))
        return "truck";
    if (normalized.includes("bus"))
        return "bus";
    return "car";
}
exports.updateDailyAnalytics = functions.pubsub
    .schedule("0 * * * *")
    .timeZone("Asia/Dhaka")
    .onRun(async () => {
    const now = new Date();
    const dayStart = startOfDayDhaka(now);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const paymentsSnap = await admin
        .firestore()
        .collection("toll_payments")
        .where("created_at", ">=", admin.firestore.Timestamp.fromDate(dayStart))
        .where("created_at", "<", admin.firestore.Timestamp.fromDate(dayEnd))
        .get();
    const perGate = new Map();
    for (const paymentDoc of paymentsSnap.docs) {
        const data = paymentDoc.data();
        const gateId = data.gate_id ?? "unknown";
        const amount = Number(data.amount ?? 0);
        const vehicleType = data.vehicle_type ?? "car";
        const createdAt = data.created_at?.toDate() ?? now;
        const status = data.status ?? "success";
        if (!perGate.has(gateId)) {
            perGate.set(gateId, {
                vehicleCounts: {
                    motorcycle: 0,
                    car: 0,
                    microbus: 0,
                    truck: 0,
                    bus: 0,
                },
                totalRevenue: 0,
                totalVehicles: 0,
                hourly: Array.from({ length: 24 }, (_, hour) => ({
                    hour,
                    vehicles: 0,
                    revenue: 0,
                })),
                passUsageCount: 0,
                disputeCount: 0,
            });
        }
        const aggregate = perGate.get(gateId);
        const category = toCategory(vehicleType);
        aggregate.vehicleCounts[category] += 1;
        aggregate.totalVehicles += 1;
        aggregate.totalRevenue += amount;
        const hour = inferHourDhaka(createdAt);
        aggregate.hourly[hour].vehicles += 1;
        aggregate.hourly[hour].revenue += amount;
        if (amount === 0)
            aggregate.passUsageCount += 1;
        if (status === "disputed")
            aggregate.disputeCount += 1;
    }
    const batch = admin.firestore().batch();
    const dateKey = formatDateYYYYMMDD(dayStart);
    const dateValue = formatDateYYYYMMDDDashed(dayStart);
    for (const [gateId, stats] of perGate.entries()) {
        const peakHour = stats.hourly.reduce((best, item) => (item.vehicles > best.vehicles ? item : best), stats.hourly[0]).hour;
        const ref = admin
            .firestore()
            .collection("analytics_daily")
            .doc(`${gateId}_${dateKey}`);
        batch.set(ref, {
            gate_id: gateId,
            date: dateValue,
            total_revenue: stats.totalRevenue,
            vehicle_counts: stats.vehicleCounts,
            total_vehicles: stats.totalVehicles,
            peak_hour: peakHour,
            hourly_data: stats.hourly,
            pass_usage_count: stats.passUsageCount,
            dispute_count: stats.disputeCount,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    await batch.commit();
    return {
        gatesUpdated: perGate.size,
        paymentsProcessed: paymentsSnap.size,
        date: dateValue,
    };
});
//# sourceMappingURL=updateDailyAnalytics.js.map