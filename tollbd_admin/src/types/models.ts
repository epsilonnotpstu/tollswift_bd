import type { Timestamp } from 'firebase/firestore'

export type TollGate = {
  id: string
  name: string
  name_en?: string
  road_name: string
  status: 'active' | 'inactive' | 'maintenance'
  toll_rates: Record<string, number>
}

export type AnalyticsDaily = {
  gate_id: string
  date: string
  total_revenue: number
  total_vehicles: number
  peak_hour: number
  pass_usage_count: number
  dispute_count: number
  vehicle_counts?: Record<string, number>
  hourly_data?: Array<{ hour: number; vehicles: number; revenue: number }>
}

export type Vehicle = {
  id: string
  owner_uid: string
  plate_number: string
  vehicle_type: string
  make?: string
  model?: string
  brtc_status: string
  created_at?: Timestamp
  registration_doc_url?: string
}

export type Dispute = {
  id: string
  user_id: string
  toll_payment_id: string
  reason: string
  description?: string
  status: 'open' | 'in_review' | 'resolved' | string
  refund_amount?: number
  admin_notes?: string
  created_at?: Timestamp
}

export type UserProfile = {
  uid: string
  name?: string
  name_bn?: string
  phone?: string
  wallet_balance?: number
  account_status?: string
}
