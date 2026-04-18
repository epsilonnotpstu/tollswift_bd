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
exports.sendNotification = exports.getTransactions = exports.sslcommerzIPN = exports.validateSSLPayment = exports.createSSLCommerzSession = exports.onUserCreated = void 0;
const admin = __importStar(require("firebase-admin"));
const onUserCreated_1 = require("./auth/onUserCreated");
Object.defineProperty(exports, "onUserCreated", { enumerable: true, get: function () { return onUserCreated_1.onUserCreated; } });
const sendNotification_1 = require("./notifications/sendNotification");
Object.defineProperty(exports, "sendNotification", { enumerable: true, get: function () { return sendNotification_1.sendNotification; } });
const depositMoney_1 = require("./wallet/depositMoney");
Object.defineProperty(exports, "createSSLCommerzSession", { enumerable: true, get: function () { return depositMoney_1.createSSLCommerzSession; } });
Object.defineProperty(exports, "validateSSLPayment", { enumerable: true, get: function () { return depositMoney_1.validateSSLPayment; } });
const getTransactions_1 = require("./wallet/getTransactions");
Object.defineProperty(exports, "getTransactions", { enumerable: true, get: function () { return getTransactions_1.getTransactions; } });
const sslcommerzIPN_1 = require("./wallet/sslcommerzIPN");
Object.defineProperty(exports, "sslcommerzIPN", { enumerable: true, get: function () { return sslcommerzIPN_1.sslcommerzIPN; } });
admin.initializeApp();
//# sourceMappingURL=index.js.map