/**
 * @file سرویس احراز هویت HTLand
 * @description عملیات مرتبط با ارسال OTP، rate limiting و مدیریت سشن‌ها
 * @since 1.0.0
 */

const crypto = require('crypto');
const logger = require('../utils/logger');
const smsProvider = require('./smsProvider');

/**
 * @class AuthService
 * @description سرویس مدیریت عملیات احراز هویت
 */
class AuthService {
  constructor() {
    // Redis غیرفعال شده (به خاطر تحریم و نبود کارت اعتباری)
    this.redisClient = null;
    
    // سرویس ارسال پیامک
    this.smsProvider = smsProvider;
    
    // تنظیمات rate limiting (فقط برای نمایش، عملاً استفاده نمی‌شه)
    this.rateLimits = {
      send_otp: { window: 900, max: 3 },
      verify_otp: { window: 300, max: 5 },
      forgot_password: { window: 3600, max: 3 }
    };
  }
  
  /**
   * بررسی rate limiting - بدون Redis همیشه مجاز است
   */
  async checkRateLimit(identifier, action) {
    // بدون Redis، هیچ محدودیتی اعمال نمی‌شود
    return true;
  }
  
  /**
   * ارسال کد OTP از طریق پیامک
   */
  async sendOTPSMS(phone, otpCode) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`[DEV] OTP for ${phone}: ${otpCode}`);
        return true;
      }
      
      const message = `کد تأیید HTLand: ${otpCode}\nاین کد ۵ دقیقه اعتبار دارد.\nwww.htland.ir`;
      const result = await this.smsProvider.sendSMS(phone, message);
      
      logger.info(`SMS sent to ${phone}: ${result ? 'success' : 'failed'}`);
      return result;
    } catch (error) {
      logger.error('Error sending OTP SMS:', error);
      return false;
    }
  }
  
  /**
   * ارسال پیامک بازیابی رمز عبور
   */
  async sendPasswordResetSMS(phone, otpCode) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`[DEV] Password reset OTP for ${phone}: ${otpCode}`);
        return true;
      }
      
      const message = `کد بازیابی رمز عبور HTLand: ${otpCode}\nاین کد ۵ دقیقه اعتبار دارد.\nwww.htland.ir`;
      const result = await this.smsProvider.sendSMS(phone, message);
      
      logger.info(`Password reset SMS sent to ${phone}: ${result ? 'success' : 'failed'}`);
      return result;
    } catch (error) {
      logger.error('Error sending password reset SMS:', error);
      return false;
    }
  }
  
  /**
   * ارسال پیامک خوش‌آمدگویی
   */
  async sendWelcomeSMS(phone, firstName = 'کاربر') {
    try {
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`[DEV] Welcome SMS for ${phone}`);
        return true;
      }
      
      const message = `${firstName} عزیز، به خانواده HTLand خوش آمدید!\nسفارش‌های خود را با اطمینان از کیفیت محصولات ارگانیک شمال ثبت کنید.\nwww.htland.ir`;
      const result = await this.smsProvider.sendSMS(phone, message);
      
      logger.info(`Welcome SMS sent to ${phone}`);
      return result;
    } catch (error) {
      logger.error('Error sending welcome SMS:', error);
      return false;
    }
  }
  
  generateReferralCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  
  validateIranianPhone(phone) {
    return /^09[0-9]{9}$/.test(phone);
  }
  
  encryptData(data) {
    if (!process.env.ENCRYPTION_KEY) return data;
    
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  decryptData(encryptedData) {
    if (!process.env.ENCRYPTION_KEY || !encryptedData.includes(':')) return encryptedData;
    
    try {
      const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Error decrypting data:', error);
      throw new Error('رمزگشایی ناموفق بود');
    }
  }
  
  generateHash(data) {
    return crypto
      .createHash('sha256')
      .update(data + (process.env.HASH_SALT || ''))
      .digest('hex');
  }
  
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>]/g, '').replace(/javascript:/gi, '').trim();
  }
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  checkPasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    let strength = 'ضعیف';
    if (score >= 4) strength = 'قوی';
    else if (score >= 3) strength = 'متوسط';
    
    return { isValid: score >= 3, strength, score, checks };
  }
  
  generateEmailVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  async disconnect() {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
        logger.info('Redis connection closed');
      } catch (error) {
        logger.error('Error closing Redis connection:', error);
      }
    }
  }
}

module.exports = new AuthService();
