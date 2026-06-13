import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AbdmAuthToken {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

@Injectable()
export class AbdmApiService {
  private readonly logger = new Logger(AbdmApiService.name);
  private readonly baseUrl: string;
  private readonly clientId: string | undefined;
  private readonly clientSecret: string | undefined;
  private cachedToken: AbdmAuthToken | null = null;
  private tokenExpiry = 0;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('ABDM_GATEWAY_URL', 'https://dev.abdm.gov.in');
    this.clientId = this.config.get<string>('ABDM_CLIENT_ID');
    this.clientSecret = this.config.get<string>('ABDM_CLIENT_SECRET');
  }

  isAvailable(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  private async getAuthToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiry) {
      return this.cachedToken.accessToken;
    }

    const response = await fetch(`${this.baseUrl}/api/hiecm/gateway/v3/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: this.clientId, clientSecret: this.clientSecret }),
    });

    if (!response.ok) {
      throw new Error(`ABDM auth failed: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as AbdmAuthToken;
    this.cachedToken = data;
    this.tokenExpiry = Date.now() + (data.expiresIn - 60) * 1000;
    return data.accessToken;
  }

  async searchHealthcarePractitioner(query: string) {
    if (!this.isAvailable()) return { success: false, error: 'ABDM credentials not configured' };

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseUrl}/api/hpr/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: query }),
    });

    if (!response.ok) {
      this.logger.error(`HPR search failed: ${response.status}`);
      return { success: false, error: 'HPR search failed' };
    }

    return response.json();
  }

  async searchHealthcareFacility(query: string) {
    if (!this.isAvailable()) return { success: false, error: 'ABDM credentials not configured' };

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseUrl}/api/hfr/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: query }),
    });

    if (!response.ok) {
      this.logger.error(`HFR search failed: ${response.status}`);
      return { success: false, error: 'HFR search failed' };
    }

    return response.json();
  }

  async createConsentRequest(consent: {
    patientAbha: string;
    hiuId: string;
    purpose: string;
    hiTypes: string[];
    dateRange?: { from: string; to: string };
  }) {
    if (!this.isAvailable()) return { success: false, error: 'ABDM credentials not configured' };

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseUrl}/api/hiecm/consent/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        consent: {
          patient: { id: consent.patientAbha },
          hiu: { id: consent.hiuId },
          purpose: { text: consent.purpose, code: 'HLTHMON' },
          hiTypes: consent.hiTypes,
          permission: {
            dateRange: consent.dateRange ?? { from: '2020-01-01', to: new Date().toISOString().slice(0, 10) },
            dataEraseAt: new Date(Date.now() + 365 * 24 * 60 * 60_000).toISOString().slice(0, 10),
            frequency: { unit: 'DAY', value: 1, repeats: 30 },
          },
        },
      }),
    });

    if (!response.ok) {
      this.logger.error(`Consent request failed: ${response.status}`);
      return { success: false, error: 'Consent request failed' };
    }

    return response.json();
  }

  async fetchConsentStatus(consentId: string) {
    if (!this.isAvailable()) return { success: false, error: 'ABDM credentials not configured' };

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseUrl}/api/hiecm/consent/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ consentId }),
    });

    if (!response.ok) {
      this.logger.error(`Consent status fetch failed: ${response.status}`);
      return { success: false, error: 'Consent status fetch failed' };
    }

    return response.json();
  }

  async pushHealthData(requestId: string, data: unknown) {
    if (!this.isAvailable()) return { success: false, error: 'ABDM credentials not configured' };

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseUrl}/api/hiecm/hip/data/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ requestId, data }),
    });

    if (!response.ok) {
      this.logger.error(`HIP data push failed: ${response.status}`);
      return { success: false, error: 'HIP data push failed' };
    }

    return response.json();
  }

  async pullHealthData(requestId: string) {
    if (!this.isAvailable()) return { success: false, error: 'ABDM credentials not configured' };

    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseUrl}/api/hiecm/hiu/data/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ requestId }),
    });

    if (!response.ok) {
      this.logger.error(`HIU data pull failed: ${response.status}`);
      return { success: false, error: 'HIU data pull failed' };
    }

    return response.json();
  }
}
