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
exports.operatorManualTollEntry = exports.operatorSetGateStatus = exports.sendNotification = exports.getTransactions = exports.sslcommerzIPN = exports.validateSSLPayment = exports.createSSLCommerzSession = exports.inviteFamilyMember = exports.createFamilyAccount = exports.createDispute = exports.sendPassExpiryReminders = exports.autoRenewPasses = exports.purchasePass = exports.generateOfflineQR = exports.processTollPayment = exports.estimateRouteTolls = exports.verifyTollGate = exports.updateDailyAnalytics = exports.processDisputeRefund = exports.adminRejectVehicle = exports.adminApproveVehicle = exports.addVehicle = exports.submitNIDVerification = exports.onUserCreated = void 0;
const admin = __importStar(require("firebase-admin"));
const createDispute_1 = require("./history/createDispute");
Object.defineProperty(exports, "createDispute", { enumerable: true, get: function () { return createDispute_1.createDispute; } });
const submitNIDVerification_1 = require("./auth/submitNIDVerification");
Object.defineProperty(exports, "submitNIDVerification", { enumerable: true, get: function () { return submitNIDVerification_1.submitNIDVerification; } });
const adminApproveVehicle_1 = require("./admin/adminApproveVehicle");
Object.defineProperty(exports, "adminApproveVehicle", { enumerable: true, get: function () { return adminApproveVehicle_1.adminApproveVehicle; } });
const adminRejectVehicle_1 = require("./admin/adminRejectVehicle");
Object.defineProperty(exports, "adminRejectVehicle", { enumerable: true, get: function () { return adminRejectVehicle_1.adminRejectVehicle; } });
const processDisputeRefund_1 = require("./admin/processDisputeRefund");
Object.defineProperty(exports, "processDisputeRefund", { enumerable: true, get: function () { return processDisputeRefund_1.processDisputeRefund; } });
const updateDailyAnalytics_1 = require("./analytics/updateDailyAnalytics");
Object.defineProperty(exports, "updateDailyAnalytics", { enumerable: true, get: function () { return updateDailyAnalytics_1.updateDailyAnalytics; } });
const onUserCreated_1 = require("./auth/onUserCreated");
Object.defineProperty(exports, "onUserCreated", { enumerable: true, get: function () { return onUserCreated_1.onUserCreated; } });
const sendNotification_1 = require("./notifications/sendNotification");
Object.defineProperty(exports, "sendNotification", { enumerable: true, get: function () { return sendNotification_1.sendNotification; } });
const manualTollEntry_1 = require("./operator/manualTollEntry");
Object.defineProperty(exports, "operatorManualTollEntry", { enumerable: true, get: function () { return manualTollEntry_1.operatorManualTollEntry; } });
const setGateStatus_1 = require("./operator/setGateStatus");
Object.defineProperty(exports, "operatorSetGateStatus", { enumerable: true, get: function () { return setGateStatus_1.operatorSetGateStatus; } });
const autoRenewPasses_1 = require("./pass/autoRenewPasses");
Object.defineProperty(exports, "autoRenewPasses", { enumerable: true, get: function () { return autoRenewPasses_1.autoRenewPasses; } });
const purchasePass_1 = require("./pass/purchasePass");
Object.defineProperty(exports, "purchasePass", { enumerable: true, get: function () { return purchasePass_1.purchasePass; } });
const sendPassExpiryReminders_1 = require("./pass/sendPassExpiryReminders");
Object.defineProperty(exports, "sendPassExpiryReminders", { enumerable: true, get: function () { return sendPassExpiryReminders_1.sendPassExpiryReminders; } });
const depositMoney_1 = require("./wallet/depositMoney");
Object.defineProperty(exports, "createSSLCommerzSession", { enumerable: true, get: function () { return depositMoney_1.createSSLCommerzSession; } });
Object.defineProperty(exports, "validateSSLPayment", { enumerable: true, get: function () { return depositMoney_1.validateSSLPayment; } });
const getTransactions_1 = require("./wallet/getTransactions");
Object.defineProperty(exports, "getTransactions", { enumerable: true, get: function () { return getTransactions_1.getTransactions; } });
const sslcommerzIPN_1 = require("./wallet/sslcommerzIPN");
Object.defineProperty(exports, "sslcommerzIPN", { enumerable: true, get: function () { return sslcommerzIPN_1.sslcommerzIPN; } });
const createFamilyAccount_1 = require("./family/createFamilyAccount");
Object.defineProperty(exports, "createFamilyAccount", { enumerable: true, get: function () { return createFamilyAccount_1.createFamilyAccount; } });
const inviteFamilyMember_1 = require("./family/inviteFamilyMember");
Object.defineProperty(exports, "inviteFamilyMember", { enumerable: true, get: function () { return inviteFamilyMember_1.inviteFamilyMember; } });
const estimateRouteTolls_1 = require("./toll/estimateRouteTolls");
Object.defineProperty(exports, "estimateRouteTolls", { enumerable: true, get: function () { return estimateRouteTolls_1.estimateRouteTolls; } });
const processPayment_1 = require("./toll/processPayment");
Object.defineProperty(exports, "generateOfflineQR", { enumerable: true, get: function () { return processPayment_1.generateOfflineQR; } });
Object.defineProperty(exports, "processTollPayment", { enumerable: true, get: function () { return processPayment_1.processTollPayment; } });
const verifyTollGate_1 = require("./toll/verifyTollGate");
Object.defineProperty(exports, "verifyTollGate", { enumerable: true, get: function () { return verifyTollGate_1.verifyTollGate; } });
const addVehicle_1 = require("./vehicle/addVehicle");
Object.defineProperty(exports, "addVehicle", { enumerable: true, get: function () { return addVehicle_1.addVehicle; } });
admin.initializeApp();
//# sourceMappingURL=index.js.map