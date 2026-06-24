import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface BRTAResult {
  verified: boolean;
  ownerName: string;
  vehicleType: string;
  category: string;
}

export const verifyVehicle = async (registrationNumber: string): Promise<BRTAResult | null> => {
  if (!env.BRTA_API_URL) {
    return null;
  }

  try {
    const response = await axios.get<BRTAResult>(env.BRTA_API_URL, {
      params: { registrationNumber },
      headers: env.BRTA_API_KEY ? { Authorization: `Bearer ${env.BRTA_API_KEY}` } : undefined,
      timeout: 8000
    });

    return response.data;
  } catch (error) {
    logger.warn('BRTA API verification failed; manual admin approval required', { error });
    return null;
  }
};
