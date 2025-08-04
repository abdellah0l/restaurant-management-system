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
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    return false;
  }
  
  if (new Date() > stored.expiresAt) {
    verificationCodes.delete(email);
    return false;
  }
  
  if (stored.code !== code) {
    return false;
  }
  
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