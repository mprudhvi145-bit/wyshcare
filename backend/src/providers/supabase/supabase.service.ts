import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (url && anonKey) {
      this.client = createClient(url, anonKey);
      this.logger.log('Supabase client initialized');
    } else {
      this.logger.warn('SUPABASE_URL or SUPABASE_ANON_KEY not set — OTP will use fallback');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async sendOtp(phoneNumber: string): Promise<{ success: boolean }> {
    if (!this.client) {
      this.logger.warn(`Supabase not configured — cannot send OTP`);
      return { success: false };
    }
    const { error } = await this.client.auth.signInWithOtp({ phone: phoneNumber });
    if (error) {
      this.logger.error(`Supabase OTP send failed: ${error.message}`);
      return { success: false };
    }
    return { success: true };
  }

  async verifyOtp(phoneNumber: string, token: string): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'Supabase not configured' };
    }
    const { error } = await this.client.auth.verifyOtp({ phone: phoneNumber, token, type: 'sms' });
    if (error) {
      this.logger.warn(`Supabase OTP verify failed: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
}
