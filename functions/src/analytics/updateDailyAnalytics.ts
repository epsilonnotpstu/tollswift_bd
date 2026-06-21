import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

type Hourly = {
  hour: number;
  vehicles: number;
  revenue: number;
};

type VehicleCounts = {
  motorcycle: number;
  car: number;
  microbus: number;
  truck: number;
  bus: number;
};

function formatDateYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function formatDateYYYYMMDDDashed(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDayDhaka(now: Date): Date {
  const dhakaNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  dhakaNow.setHours(0, 0, 0, 0);
  return dhakaNow;
}

function inferHourDhaka(date: Date): number {
  const dhaka = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  return dhaka.getHours();
}

function toCategory(vehicleType: string): keyof VehicleCounts {
  const normalized = vehicleType.toLowerCase();
  if (normalized.includes("motor") || normalized.includes("bike")) return "motorcycle";
  if (normalized.includes("micro")) return "microbus";
  if (normalized.includes("truck")) return "truck";
  if (normalized.includes("bus")) return "bus";
  return "car";
}

export const updateDailyAnalytics = functions.pubsub
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

    const perGate = new Map<
      string,
      {
        vehicleCounts: VehicleCounts;
        totalRevenue: number;
        totalVehicles: number;
        hourly: Hourly[];
        passUsageCount: number;
        disputeCount: number;
      }
    >();

    for (const paymentDoc of paymentsSnap.docs) {
      const data = paymentDoc.data();
      const gateId = (data.gate_id as string | undefined) ?? "unknown";
      const amount = Number(data.amount ?? 0);
      const vehicleType = (data.vehicle_type as string | undefined) ?? "car";
      const createdAt = (data.created_at as admin.firestore.Timestamp | undefined)?.toDate() ?? now;
      const status = (data.status as string | undefined) ?? "success";

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

      const aggregate = perGate.get(gateId)!;
      const category = toCategory(vehicleType);
      aggregate.vehicleCounts[category] += 1;
      aggregate.totalVehicles += 1;
      aggregate.totalRevenue += amount;

      const hour = inferHourDhaka(createdAt);
      aggregate.hourly[hour].vehicles += 1;
      aggregate.hourly[hour].revenue += amount;

      if (amount === 0) aggregate.passUsageCount += 1;
      if (status === "disputed") aggregate.disputeCount += 1;
    }

    const batch = admin.firestore().batch();
    const dateKey = formatDateYYYYMMDD(dayStart);
    const dateValue = formatDateYYYYMMDDDashed(dayStart);

    for (const [gateId, stats] of perGate.entries()) {
      const peakHour = stats.hourly.reduce(
        (best, item) => (item.vehicles > best.vehicles ? item : best),
        stats.hourly[0]
      ).hour;

      const ref = admin
        .firestore()
        .collection("analytics_daily")
        .doc(`${gateId}_${dateKey}`);

      batch.set(
        ref,
        {
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
        },
        { merge: true }
      );
    }

    await batch.commit();

    return {
      gatesUpdated: perGate.size,
      paymentsProcessed: paymentsSnap.size,
      date: dateValue,
    };
  });
