import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

export const adminApproveVehicleFn = httpsCallable<{ vehicleId: string }, { success: boolean }>(
  functions,
  'adminApproveVehicle',
)

export const adminRejectVehicleFn = httpsCallable<
  { vehicleId: string; reason: string },
  { success: boolean }
>(functions, 'adminRejectVehicle')

export const processDisputeRefundFn = httpsCallable<
  { disputeId: string; refundAmount: number; adminNote?: string },
  { success: boolean }
>(functions, 'processDisputeRefund')
