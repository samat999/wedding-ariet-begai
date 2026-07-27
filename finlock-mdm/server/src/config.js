import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3847', 10),
  appName: process.env.APP_NAME || 'FinLock MDM',
  mdmMode: process.env.MDM_MODE || 'demo',
  micromdm: {
    url: (process.env.MICROMDM_URL || '').replace(/\/$/, ''),
    apiKey: process.env.MICROMDM_API_KEY || '',
  },
};
