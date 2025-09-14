import crypto from 'crypto';

// Generate 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP via SMS (mock implementation)
export const sendOTP = async (phone, otp) => {
  // In production, integrate with SMS service like Twilio, AWS SNS, etc.
  console.log(`SMS to ${phone}: Your OTP is ${otp}. Valid for 10 minutes.`);
  
  // Mock delay to simulate SMS sending
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true;
};

// Send OTP via email (for backup)
export const sendOTPEmail = async (email, otp) => {
  // In production, integrate with email service like SendGrid, AWS SES, etc.
  console.log(`Email to ${email}: Your OTP is ${otp}. Valid for 10 minutes.`);
  
  return true;
};
