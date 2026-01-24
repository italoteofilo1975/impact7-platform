import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

const DEFAULT_OPTIONS: QRCodeOptions = {
  width: 300,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
};

/**
 * Gera um QR Code como Data URL (base64)
 */
export async function generateQRCodeDataURL(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const dataURL = await QRCode.toDataURL(data, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
    });
    return dataURL;
  } catch (error) {
    console.error('[QRCode] Erro ao gerar QR Code:', error);
    throw new Error('Falha ao gerar QR Code');
  }
}

/**
 * Gera um QR Code como Buffer (PNG)
 */
export async function generateQRCodeBuffer(
  data: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const buffer = await QRCode.toBuffer(data, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
    });
    return buffer;
  } catch (error) {
    console.error('[QRCode] Erro ao gerar QR Code buffer:', error);
    throw new Error('Falha ao gerar QR Code');
  }
}

/**
 * Gera URL de verificação de certificado
 */
export function getCertificateVerificationURL(
  certificateId: string,
  baseURL: string = 'https://impact7.com.br'
): string {
  return `${baseURL}/certificados/verificar?id=${certificateId}`;
}

/**
 * Gera QR Code para verificação de certificado
 */
export async function generateCertificateQRCode(
  certificateId: string,
  baseURL?: string,
  options?: QRCodeOptions
): Promise<{ dataURL: string; verificationURL: string }> {
  const verificationURL = getCertificateVerificationURL(certificateId, baseURL);
  const dataURL = await generateQRCodeDataURL(verificationURL, options);
  
  return {
    dataURL,
    verificationURL,
  };
}
