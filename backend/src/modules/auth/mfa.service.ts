import { Injectable, Logger } from '@nestjs/common';
import { authenticator } from 'otplib';
import { createHash, randomBytes } from 'node:crypto';
import * as qrcode from 'qrcode';

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);

  generateSecret(email: string): { secret: string; otpauthUrl: string } {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, 'WyshCare', secret);
    return { secret, otpauthUrl };
  }

  verifyToken(secret: string, token: string): boolean {
    return authenticator.check(token, secret);
  }

  generateBackupCodes(): { hashed: string[]; plain: string[] } {
    const plain: string[] = [];
    const hashed: string[] = [];
    for (let i = 0; i < 8; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      plain.push(code);
      hashed.push(createHash('sha256').update(code).digest('hex'));
    }
    return { hashed, plain };
  }

  verifyBackupCode(code: string, hashedCodes: string): string | null {
    const hash = createHash('sha256').update(code).digest('hex');
    const codes = JSON.parse(hashedCodes) as string[];
    return codes.includes(hash) ? hash : null;
  }

  removeUsedBackupCode(usedHash: string, hashedCodes: string): string {
    const codes = JSON.parse(hashedCodes) as string[];
    return JSON.stringify(codes.filter((c) => c !== usedHash));
  }

  generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
    return qrcode.toDataURL(otpauthUrl);
  }
}
