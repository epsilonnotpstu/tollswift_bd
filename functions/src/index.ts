import * as admin from "firebase-admin";

import { onUserCreated } from "./auth/onUserCreated";
import { sendNotification } from "./notifications/sendNotification";
import {
  createSSLCommerzSession,
  validateSSLPayment,
} from "./wallet/depositMoney";
import { getTransactions } from "./wallet/getTransactions";
import { sslcommerzIPN } from "./wallet/sslcommerzIPN";

admin.initializeApp();

export {
  onUserCreated,
  createSSLCommerzSession,
  validateSSLPayment,
  sslcommerzIPN,
  getTransactions,
  sendNotification,
};
