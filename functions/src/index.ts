import * as admin from "firebase-admin";

import { createDispute } from "./history/createDispute";
import { onUserCreated } from "./auth/onUserCreated";
import { sendNotification } from "./notifications/sendNotification";
import { purchasePass } from "./pass/purchasePass";
import {
  createSSLCommerzSession,
  validateSSLPayment,
} from "./wallet/depositMoney";
import { getTransactions } from "./wallet/getTransactions";
import { sslcommerzIPN } from "./wallet/sslcommerzIPN";
import { generateOfflineQR, processTollPayment } from "./toll/processPayment";
import { verifyTollGate } from "./toll/verifyTollGate";
import { addVehicle } from "./vehicle/addVehicle";

admin.initializeApp();

export {
  onUserCreated,
  addVehicle,
  verifyTollGate,
  processTollPayment,
  generateOfflineQR,
  purchasePass,
  createDispute,
  createSSLCommerzSession,
  validateSSLPayment,
  sslcommerzIPN,
  getTransactions,
  sendNotification,
};
