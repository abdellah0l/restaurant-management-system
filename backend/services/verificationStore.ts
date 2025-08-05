interface VerificationCode {
  code: string;
  email: string;
  expiresAt: Date;
}

const verificationCodes = new Map<string, VerificationCode>();

export const storeVerificationCode = (email: string, code: string): void => {
  verificationCodes.delete(email);
  
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  verificationCodes.set(email, { code, email, expiresAt });
  
  cleanupExpiredCodes();
};

export const verifyCode = (email: string, code: string): boolean => {
  console.log('Verifying code for email:', email);
  console.log('Current stored codes:', Array.from(verificationCodes.entries()));
  
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    console.log('No stored code found for email:', email);
    return false;
  }
  
  console.log('Stored code:', stored.code, 'Received code:', code);
  console.log('Stored expires at:', stored.expiresAt, 'Current time:', new Date());
  
  if (new Date() > stored.expiresAt) {
    console.log('Code has expired');
    verificationCodes.delete(email);
    return false;
  }
  
  if (stored.code !== code) {
    console.log('Code mismatch');
    return false;
  }
  
  console.log('Code verification successful');
  verificationCodes.delete(email);
  return true;
};

const cleanupExpiredCodes = (): void => {
  const now = new Date();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(email);
    }
  }
};

export const getStoredCode = (email: string): string | null => {
  const stored = verificationCodes.get(email);
  return stored ? stored.code : null;
}; 