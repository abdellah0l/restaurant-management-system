import nodemailer from 'nodemailer';

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// Generate a random 6-digit verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification code email
export const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'رمز التحقق لتحديث الملف الشخصي',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center; margin-bottom: 30px;">رمز التحقق</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              مرحباً،
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              لقد طلبت تحديث معلومات ملفك الشخصي. يرجى استخدام رمز التحقق التالي:
            </p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 5px;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              هذا الرمز صالح لمدة 10 دقائق فقط. إذا لم تطلب هذا التحديث، يرجى تجاهل هذا البريد الإلكتروني.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              نظام إدارة المخزون
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
}; 