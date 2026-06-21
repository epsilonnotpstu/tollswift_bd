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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateRouteTolls = void 0;
const axios_1 = __importDefault(require("axios"));
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
function normalizePayload(rawData) {
    const wrapper = rawData;
    return (wrapper.data ?? rawData);
}
function decodePolyline(encoded) {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const points = [];
    while (index < encoded.length) {
        let result = 1;
        let shift = 0;
        let b;
        do {
            b = encoded.codePointAt(index) - 63 - 1;
            index += 1;
            result += b << shift;
            shift += 5;
        } while (b >= 0x1f);
        lat += result & 1 ? ~(result >> 1) : result >> 1;
        result = 1;
        shift = 0;
        do {
            b = encoded.codePointAt(index) - 63 - 1;
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
function toRadians(value) {
    return (value * Math.PI) / 180;
}
function haversineDistanceKm(from, to) {
    const earthRadiusKm = 6371;
    const dLat = toRadians(to.lat - from.lat);
    const dLng = toRadians(to.lng - from.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(from.lat)) *
            Math.cos(toRadians(to.lat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}
exports.estimateRouteTolls = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const data = normalizePayload(rawData);
    if (!Number.isFinite(data.originLat) ||
        !Number.isFinite(data.originLng) ||
        !Number.isFinite(data.destLat) ||
        !Number.isFinite(data.destLng) ||
        !data.vehicleType) {
        throw new functions.https.HttpsError("invalid-argument", "origin/destination coordinates and vehicleType are required");
    }
    const mapsKey = functions.config().google?.maps_key ||
        process.env.GOOGLE_MAPS_KEY;
    if (!mapsKey) {
        throw new functions.https.HttpsError("failed-precondition", "Google Maps key is not configured");
    }
    const directionsUrl = "https://maps.googleapis.com/maps/api/directions/json";
    const routeResponse = await axios_1.default.get(directionsUrl, {
        params: {
            origin: `${data.originLat},${data.originLng}`,
            destination: `${data.destLat},${data.destLng}`,
            key: mapsKey,
        },
        timeout: 10000,
    });
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
        const gateLocation = gate.location;
        if (!gateLocation)
            return null;
        const isOnRoute = routePoints.some((point) => haversineDistanceKm(point, {
            lat: gateLocation.latitude,
            lng: gateLocation.longitude,
        }) <= 0.5);
        if (!isOnRoute)
            return null;
        const tollRates = (gate.toll_rates || {});
        const amount = Number(tollRates[data.vehicleType] ?? 0);
        return {
            gateId: gate.id || doc.id,
            gateName: gate.name ?? "",
            roadName: gate.road_name ?? "",
            amount: Number.isFinite(amount) ? amount : 0,
            location: {
                latitude: gateLocation.latitude,
                longitude: gateLocation.longitude,
            },
        };
    })
        .filter((item) => item !== null)
        .sort((a, b) => a.gateName.localeCompare(b.gateName));
    const totalAmount = tollsOnRoute.reduce((sum, item) => sum + item.amount, 0);
    return {
        routeFound: true,
        tollsOnRoute,
        totalAmount,
    };
});
//# sourceMappingURL=estimateRouteTolls.js.map