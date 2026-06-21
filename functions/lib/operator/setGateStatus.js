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
exports.operatorSetGateStatus = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
function normalizePayload(rawData) {
    const wrapper = rawData;
    return (wrapper.data ?? rawData);
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
exports.operatorSetGateStatus = functions.https.onCall(async (rawData, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Login required");
    }
    const data = normalizePayload(rawData);
    if (!data.gateId || !["active", "inactive"].includes(data.status)) {
        throw new functions.https.HttpsError("invalid-argument", "gateId and a valid status are required");
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
//# sourceMappingURL=setGateStatus.js.map