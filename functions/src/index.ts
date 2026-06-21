import * as admin from "firebase-admin";

import { createDispute } from "./history/createDispute";
import { submitNIDVerification } from "./auth/submitNIDVerification";
import { adminApproveVehicle } from "./admin/adminApproveVehicle";
import { adminRejectVehicle } from "./admin/adminRejectVehicle";
import { processDisputeRefund } from "./admin/processDisputeRefund";
import { updateDailyAnalytics } from "./analytics/updateDailyAnalytics";
import { onUserCreated } from "./auth/onUserCreated";
import { sendNotification } from "./notifications/sendNotification";
import { operatorManualTollEntry } from "./operator/manualTollEntry";
import { operatorSetGateStatus } from "./operator/setGateStatus";
import { autoRenewPasses } from "./pass/autoRenewPasses";
import { purchasePass } from "./pass/purchasePass";
import { sendPassExpiryReminders } from "./pass/sendPassExpiryReminders";
import {
  createSSLCommerzSession,
  validateSSLPayment,
} from "./wallet/depositMoney";
import { getTransactions } from "./wallet/getTransactions";
import { sslcommerzIPN } from "./wallet/sslcommerzIPN";
import { createFamilyAccount } from "./family/createFamilyAccount";
import { inviteFamilyMember } from "./family/inviteFamilyMember";
import { estimateRouteTolls } from "./toll/estimateRouteTolls";
import { generateOfflineQR, processTollPayment } from "./toll/processPayment";
import { verifyTollGate } from "./toll/verifyTollGate";
import { addVehicle } from "./vehicle/addVehicle";

admin.initializeApp();

export {
  onUserCreated,
  submitNIDVerification,
  addVehicle,
  adminApproveVehicle,
  adminRejectVehicle,
  processDisputeRefund,
  updateDailyAnalytics,
  verifyTollGate,
  estimateRouteTolls,
  processTollPayment,
  generateOfflineQR,
  purchasePass,
  autoRenewPasses,
  sendPassExpiryReminders,
  createDispute,
  createFamilyAccount,
  inviteFamilyMember,
  createSSLCommerzSession,
  validateSSLPayment,
  sslcommerzIPN,
  getTransactions,
  sendNotification,
  operatorSetGateStatus,
  operatorManualTollEntry,
};
