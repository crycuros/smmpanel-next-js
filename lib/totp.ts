import { generateSecret, generateURI, verify, verifySync } from 'otplib'
import QRCode from 'qrcode'

// Generate a secret for Google Authenticator
export function generateTOTPSecret(): string {
  return generateSecret()
}

// Generate QR code URL for Google Authenticator setup
export async function generateQRCodeURL(email: string, secret: string): Promise<string> {
  const otpauth = generateURI({
    secret,
    issuer: 'MND Panel',
    label: email,
    algorithm: 'sha1',
    digits: 6,
    period: 30
  })
  return await QRCode.toDataURL(otpauth)
}

// Verify TOTP code (synchronous)
export function verifyCode(secret: string, code: string): boolean {
  try {
    const result = verifySync({ token: code, secret })
    return result.valid === true
  } catch {
    return false
  }
}
