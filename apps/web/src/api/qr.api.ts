import { apiClient, unwrap } from './client';

export interface QRResponse {
  tokenId: string;
  tokenData: string;
  qrDataUrl: string;
  expiresAt: string;
  vehiclePlate: string;
}

export interface QRScanResponse {
  success: boolean;
  vehiclePlate: string;
  ownerName: string;
  amount: number;
  transactionId: string;
}

export const generateQR = (vehicleId: string) => apiClient.post('/qr/generate', { vehicleId }).then(unwrap<QRResponse>);

export const getQR = (vehicleId: string) => apiClient.get(`/qr/${vehicleId}`).then(unwrap<QRResponse | null>);

export const scanQR = (tokenData: string, bridgeId: string) => apiClient.post('/qr/scan', { tokenData, bridgeId }).then(unwrap<QRScanResponse>);
