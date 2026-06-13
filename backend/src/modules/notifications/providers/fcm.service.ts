import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private readonly projectId: string | null;
  private readonly credentialsPath: string | null;
  private auth: GoogleAuth | null = null;
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor(private readonly configService: ConfigService) {
    this.projectId = this.configService.get<string>('FCM_PROJECT_ID') ?? null;
    const credPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS') ?? null;
    this.credentialsPath = credPath ? path.resolve(process.cwd(), credPath) : null;

    if (this.projectId && this.credentialsPath && fs.existsSync(this.credentialsPath)) {
      const raw = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf-8'));
      this.logger.log(`FCM Project: ${this.projectId}`);
      this.logger.log(`Service Account: ${raw.client_email}`);

      this.auth = new GoogleAuth({
        keyFile: this.credentialsPath,
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
      });
      this.logger.log(`FCM HTTP v1 initialized — project: ${this.projectId}`);
    } else {
      this.logger.warn(
        `FCM not configured — set FCM_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS`,
      );
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.auth) {
      throw new Error('FCM not configured');
    }

    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
    }

    const client = await this.auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse?.token;

    if (!accessToken) {
      throw new Error('Failed to obtain OAuth2 access token');
    }

    this.cachedToken = {
      token: accessToken,
      expiresAt: Date.now() + 60 * 60 * 1000 - 60_000,
    };

    return accessToken;
  }

  async sendPush(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<string> {
    if (!this.projectId || !this.auth) {
      this.logger.warn(`[FCM Mock] Push not sent — FCM not configured`);
      return `push_mock_${Date.now()}`;
    }

    const accessToken = await this.getAccessToken();

    const message: Record<string, unknown> = {
      message: {
        token: deviceToken,
        notification: { title, body },
        data: data ?? {},
      },
    };

    try {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(message),
        },
      );

      if (!response.ok) {
        const errBody = await response.text();
        this.logger.error(`[FCM v1] Response status=${response.status} body=${errBody}`);
        if (response.status === 404 && errBody.includes('UNREGISTERED')) {
          throw Object.assign(new Error(`FCM: device token unregistered`), {
            code: 'UNREGISTERED',
            deviceToken,
          });
        }
        throw new Error(`FCM HTTP error: ${response.status} — ${errBody}`);
      }

      const result = await response.json();
      const messageId = result.name ?? `push_${Date.now()}`;
      this.logger.log(`[FCM v1] Push sent to device ${deviceToken.slice(0, 8)}… — ID: ${messageId}`);
      return messageId;
    } catch (err) {
      this.logger.error(`[FCM v1] Send failed: ${(err as Error).message}`);
      throw err;
    }
  }

  async sendMulticast(
    deviceTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: string[]; failed: { token: string; error: string }[] }> {
    const results: { success: string[]; failed: { token: string; error: string }[] } = {
      success: [],
      failed: [],
    };

    for (const token of deviceTokens) {
      try {
        const id = await this.sendPush(token, title, body, data);
        results.success.push(id);
      } catch (err) {
        results.failed.push({ token, error: (err as Error).message });
      }
    }

    return results;
  }
}
