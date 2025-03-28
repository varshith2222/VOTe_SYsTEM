import { toast } from 'react-hot-toast';

class OTPService {
  private otpStore: Map<string, { otp: string; timestamp: number }> = new Map();
  private OTP_VALIDITY_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email: string): Promise<boolean> {
    try {
      const otp = this.generateOTP();
      
      // In a real application, you would integrate with an email service here
      // For demo purposes, we'll just show the OTP in a toast
      toast.success(`Demo Mode: Your OTP is ${otp}`, {
        duration: 10000
      });

      // Store OTP with timestamp
      this.otpStore.set(email, {
        otp,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return false;
    }
  }

  verifyOTP(email: string, otp: string): boolean {
    const storedData = this.otpStore.get(email);
    
    if (!storedData) {
      return false;
    }

    const { otp: storedOTP, timestamp } = storedData;
    const now = Date.now();

    // Check if OTP has expired
    if (now - timestamp > this.OTP_VALIDITY_DURATION) {
      this.otpStore.delete(email);
      return false;
    }

    // Verify OTP
    if (storedOTP === otp) {
      this.otpStore.delete(email);
      return true;
    }

    return false;
  }
}

export const otpService = new OTPService();
