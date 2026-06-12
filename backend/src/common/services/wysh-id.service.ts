/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/common/services/wysh-id.service.ts
 *
 * Product:
 * WyshCare Healthcare Operating System
 *
 * Brand:
 * WYSH
 *
 * Founder:
 * Vimarshak Prudhvi
 *
 * Purpose:
 * Business logic service for services
 *
 * Responsibilities:
 * - Execute business logic for wyshid operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - common
 - node:crypto
 *
 * Dependencies:
 - common
 - node:crypto
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
WyshID
 *
 * Last Reviewed:
2026-06-12
 *
 * ============================================================================
 * (c) Wysh Technologies
 * Built by Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { randomInt } from 'node:crypto';

@Injectable()
export class WyshIdService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a unique Wysh ID in the format WYSH-XXXXXXXX where X is a digit.
   * Includes a simple Luhn checksum for typo detection.
   * @returns A unique Wysh ID string.
   */
  async generateWyshId(): Promise<string> {
    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Generate 9 random digits (we will compute checksum as 10th digit)
      const raw = Array.from({ length: 9 }, () => randomInt(0, 9)).join('');
      const checksum = this.computeLuhnChecksum(raw);
      const candidate = `WYSH-${raw}${checksum}`;

      const existing = await this.prisma.user.findUnique({
        where: { wyshId: candidate },
      });

      if (!existing) {
        return candidate;
      }
      // If collision, try again
    }
    throw new InternalServerErrorException(
      'Failed to generate a unique Wysh ID after multiple attempts',
    );
  }

  /**
   * Compute Luhn checksum for a string of digits.
   * Returns a single digit (0-9).
   */
  private computeLuhnChecksum(digits: string): number {
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits.charAt(i), 10);
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = n % 9 + 9; // equivalent to subtracting 9
        }
      }
      sum += n;
      alternate = !alternate;
    }
    const mod = sum % 10;
    return (mod * 9) % 10; // the check digit that makes total sum multiple of 10
  }

  /**
   * Validate a Wysh ID format and checksum.
   * @param wyshId The Wysh ID to validate.
   * @returns True if valid format and checksum.
   */
  validateWyshId(wyshId: string): boolean {
    const match = wyshId.match(/^WYSH-(\d{10})$/);
    if (!match) return false;
    const digits = match[1]!;
    // Luhn validation: compute checksum on first 9 digits, compare to 10th
    const raw = digits.slice(0, 9);
    const providedCheck = parseInt(digits.charAt(9), 10);
    const computedCheck = this.computeLuhnChecksum(raw);
    return providedCheck === computedCheck;
  }
}