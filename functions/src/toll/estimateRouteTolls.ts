import axios from "axios";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

type EstimatePayload = {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  vehicleType: string;
};

type LatLngPoint = { lat: number; lng: number };

function normalizePayload(rawData: unknown): EstimatePayload {
  const wrapper = rawData as { data?: EstimatePayload };
  return (wrapper.data ?? rawData) as EstimatePayload;
}

function decodePolyline(encoded: string): LatLngPoint[] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const points: LatLngPoint[] = [];

  while (index < encoded.length) {
    let result = 1;
    let shift = 0;
    let b: number;

    do {
      b = encoded.codePointAt(index)! - 63 - 1;
      index += 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = encoded.codePointAt(index)! - 63 - 1;
      index += 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({
      lat: lat * 1e-5,
      lng: lng * 1e-5,
    });
  }

  return points;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(from: LatLngPoint, to: LatLngPoint): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export const estimateRouteTolls = functions.https.onCall(async (rawData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const data = normalizePayload(rawData);
  if (
    !Number.isFinite(data.originLat) ||
    !Number.isFinite(data.originLng) ||
    !Number.isFinite(data.destLat) ||
    !Number.isFinite(data.destLng) ||
    !data.vehicleType
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "origin/destination coordinates and vehicleType are required"
    );
  }

  const mapsKey =
    (functions.config().google?.maps_key as string | undefined) ||
    process.env.GOOGLE_MAPS_KEY;
  if (!mapsKey) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Google Maps key is not configured"
    );
  }

  const directionsUrl = "https://maps.googleapis.com/maps/api/directions/json";
  const routeResponse = await axios.get<{ routes?: Array<{ overview_polyline?: { points?: string } }> }>(
    directionsUrl,
    {
      params: {
        origin: `${data.originLat},${data.originLng}`,
        destination: `${data.destLat},${data.destLng}`,
        key: mapsKey,
      },
      timeout: 10000,
    }
  );

  const polyline = routeResponse.data.routes?.[0]?.overview_polyline?.points;
  if (!polyline) {
    return {
      tollsOnRoute: [],
      totalAmount: 0,
      routeFound: false,
    };
  }

  const routePoints = decodePolyline(polyline);
  const gatesSnap = await admin
    .firestore()
    .collection("toll_gates")
    .where("status", "==", "active")
    .get();

  const tollsOnRoute = gatesSnap.docs
    .map((doc) => {
      const gate = doc.data();
      const gateLocation = gate.location as admin.firestore.GeoPoint | undefined;
      if (!gateLocation) return null;

      const isOnRoute = routePoints.some((point) =>
        haversineDistanceKm(point, {
          lat: gateLocation.latitude,
          lng: gateLocation.longitude,
        }) <= 0.5
      );

      if (!isOnRoute) return null;

      const tollRates = (gate.toll_rates || {}) as Record<string, unknown>;
      const amount = Number(tollRates[data.vehicleType] ?? 0);

      return {
        gateId: gate.id || doc.id,
        gateName: (gate.name as string | undefined) ?? "",
        roadName: (gate.road_name as string | undefined) ?? "",
        amount: Number.isFinite(amount) ? amount : 0,
        location: {
          latitude: gateLocation.latitude,
          longitude: gateLocation.longitude,
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.gateName.localeCompare(b.gateName));

  const totalAmount = tollsOnRoute.reduce((sum, item) => sum + item.amount, 0);

  return {
    routeFound: true,
    tollsOnRoute,
    totalAmount,
  };
});
