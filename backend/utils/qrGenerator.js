import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateQRCode = async (data) => {
  try {
    const qrData = JSON.stringify({
      productId: data.productId,
      productName: data.productName,
      farmerName: data.farmerName,
      farmerLocation: data.farmerLocation,
      fpoName: data.fpoName,
      purchaseDate: data.purchaseDate,
      price: data.price,
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#2d5016',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

