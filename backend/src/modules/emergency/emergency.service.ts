/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/emergency/emergency.service.ts
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
 * Business logic service for emergency
 *
 * Responsibilities:
 * - Execute business logic for emergency operations
 * - Coordinate data access and external API calls
 *
 * Used By:
 - backend/src/modules/prescription/prescription.service.ts
 - backend/src/providers/storage/storage.module.ts
 - backend/src/modules/abdm/abdm.module.ts
 - backend/src/modules/digital-twin/digital-twin.service.ts
 - backend/src/modules/prescription/interaction-engine.service.ts
 - backend/src/modules/interoperability/interoperability.module.ts
 - backend/src/main.ts
 - backend/src/modules/health-graph/health-graph.service.ts
 *
 * Calls:
 - crypto
 - client
 - common
 *
 * Dependencies:
 - crypto
 - client
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Emergency
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

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../providers/prisma/prisma.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { DomainEventsService } from '../../providers/events/events.service';
import { UpdateEmergencyProfileDto } from './dto/update-profile.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { ShareLocationDto } from './dto/share-location.dto';
import { GrantAccessDto } from './dto/grant-access.dto';

@Injectable()
export class EmergencyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly events: DomainEventsService,
  ) {}

  async getOrCreateProfile(userId: string) {
    let profile = await this.prisma.emergencyProfile.findUnique({
      where: { userId },
      include: { contacts: true },
    });

    if (!profile) {
      profile = await this.prisma.emergencyProfile.create({
        data: { userId },
        include: { contacts: true },
      });
    }

    const readinessScore = this.calculateReadinessScore(profile);
    if (profile.readinessScore !== readinessScore) {
      profile = await this.prisma.emergencyProfile.update({
        where: { id: profile.id },
        data: { readinessScore },
        include: { contacts: true },
      });
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateEmergencyProfileDto) {
    const profile = await this.getOrCreateProfile(userId);

    const updated = await this.prisma.emergencyProfile.update({
      where: { id: profile.id },
      data: {
        ...dto,
        advanceDirectives: dto.advanceDirectives as Prisma.InputJsonValue,
      },
    });

    const readinessScore = this.calculateReadinessScore(updated);
    if (updated.readinessScore !== readinessScore) {
      await this.prisma.emergencyProfile.update({
        where: { id: updated.id },
        data: { readinessScore },
      });
    }

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'EMERGENCY_PROFILE_UPDATED',
      resourceType: 'EmergencyProfile',
      resourceId: profile.id,
    });

    return this.prisma.emergencyProfile.findUnique({
      where: { id: profile.id },
      include: { contacts: true },
    });
  }

  async activateEmergencyMode(userId: string) {
    const profile = await this.getOrCreateProfile(userId);

    if (profile.emergencyMode) {
      throw new BadRequestException('Emergency mode is already active');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await this.prisma.emergencyProfile.update({
      where: { id: profile.id },
      data: {
        emergencyMode: true,
        modeActivatedAt: now,
        modeExpiresAt: expiresAt,
      },
    });

    const primaryContacts = profile.contacts.filter((c) => c.isPrimary);
    for (const contact of primaryContacts) {
      await this.prisma.emergencyAccess.create({
        data: {
          patientUserId: userId,
          reason: 'OTHER',
          notes: `Auto-granted for primary contact: ${contact.name} (${contact.phone})`,
          expiresAt,
        },
      });
    }

    this.events.publish('emergency.activated', {
      userId,
      profileId: profile.id,
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      contactsNotified: primaryContacts.length,
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'EMERGENCY_MODE_ACTIVATED',
      resourceType: 'EmergencyProfile',
      resourceId: profile.id,
      metadata: { expiresAt: expiresAt.toISOString() },
    });

    await this.prisma.timelineEvent.create({
      data: {
        userId,
        type: 'NOTE' as const,
        title: 'Emergency Mode Activated',
        summary: `Emergency mode activated for 24 hours. ${primaryContacts.length} contact(s) notified.`,
        occurredAt: now,
      },
    });

    const latestLocation = await this.prisma.emergencyLocation.findFirst({
      where: { profileId: profile.id },
      orderBy: { sharedAt: 'desc' },
    });

    return {
      emergencyMode: true,
      modeActivatedAt: now,
      modeExpiresAt: expiresAt,
      contactsNotified: primaryContacts.length,
      currentLocation: latestLocation,
    };
  }

  async deactivateEmergencyMode(userId: string) {
    const profile = await this.getOrCreateProfile(userId);

    if (!profile.emergencyMode) {
      throw new BadRequestException('Emergency mode is not active');
    }

    await this.prisma.emergencyProfile.update({
      where: { id: profile.id },
      data: {
        emergencyMode: false,
        modeActivatedAt: null,
        modeExpiresAt: null,
      },
    });

    this.events.publish('emergency.deactivated', {
      userId,
      profileId: profile.id,
      deactivatedAt: new Date().toISOString(),
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'EMERGENCY_MODE_DEACTIVATED',
      resourceType: 'EmergencyProfile',
      resourceId: profile.id,
    });

    await this.prisma.timelineEvent.create({
      data: {
        userId,
        type: 'NOTE' as const,
        title: 'Emergency Mode Deactivated',
        summary: 'Emergency mode was deactivated.',
        occurredAt: new Date(),
      },
    });

    return { emergencyMode: false };
  }

  async getContacts(profileId: string) {
    return this.prisma.emergencyContact.findMany({
      where: { profileId },
      orderBy: { priority: 'asc' },
    });
  }

  async addContact(profileId: string, userId: string, dto: CreateEmergencyContactDto) {
    if (dto.isPrimary) {
      await this.prisma.emergencyContact.updateMany({
        where: { profileId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contactCount = await this.prisma.emergencyContact.count({
      where: { profileId },
    });

    const contact = await this.prisma.emergencyContact.create({
      data: {
        profileId,
        name: dto.name,
        relationship: dto.relationship,
        phone: dto.phone,
        email: dto.email,
        isPrimary: dto.isPrimary ?? false,
        priority: contactCount + 1,
      },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'EMERGENCY_CONTACT_ADDED',
      resourceType: 'EmergencyContact',
      resourceId: contact.id,
    });

    return contact;
  }

  async updateContact(contactId: string, userId: string, dto: UpdateEmergencyContactDto) {
    const existing = await this.prisma.emergencyContact.findUnique({
      where: { id: contactId },
      include: { profile: true },
    });

    if (!existing) {
      throw new NotFoundException('Emergency contact not found');
    }

    if (dto.isPrimary) {
      await this.prisma.emergencyContact.updateMany({
        where: { profileId: existing.profileId, isPrimary: true, id: { not: contactId } },
        data: { isPrimary: false },
      });
    }

    const updated = await this.prisma.emergencyContact.update({
      where: { id: contactId },
      data: dto,
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: existing.profile.userId,
      action: 'EMERGENCY_CONTACT_UPDATED',
      resourceType: 'EmergencyContact',
      resourceId: contactId,
    });

    return updated;
  }

  async deleteContact(contactId: string, userId: string) {
    const existing = await this.prisma.emergencyContact.findUnique({
      where: { id: contactId },
      include: { profile: true },
    });

    if (!existing) {
      throw new NotFoundException('Emergency contact not found');
    }

    await this.prisma.emergencyContact.delete({
      where: { id: contactId },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: existing.profile.userId,
      action: 'EMERGENCY_CONTACT_REMOVED',
      resourceType: 'EmergencyContact',
      resourceId: contactId,
    });
  }

  async shareLocation(profileId: string, userId: string, dto: ShareLocationDto) {
    const location = await this.prisma.emergencyLocation.create({
      data: {
        profileId,
        latitude: new Prisma.Decimal(dto.latitude),
        longitude: new Prisma.Decimal(dto.longitude),
        accuracy: dto.accuracy ?? null,
        source: 'GPS',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'EMERGENCY_LOCATION_SHARED',
      resourceType: 'EmergencyLocation',
      resourceId: location.id,
    });

    return location;
  }

  async getEmergencyQR(userId: string) {
    const profile = await this.getOrCreateProfile(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        bloodGroup: true,
        allergiesSummary: true,
        chronicConditions: true,
        emergencyProfileData: {
          include: {
            contacts: { orderBy: { priority: 'asc' } },
            locations: { orderBy: { sharedAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = profile.modeExpiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);

    const qrData: Record<string, unknown> = {
      token,
      profile: {
        bloodGroup: user.bloodGroup ?? profile.bloodGroup,
        allergies: user.allergiesSummary,
        conditions: user.chronicConditions,
        emergencyNotes: profile.emergencyNotes,
        organDonor: profile.organDonor,
        primaryPhysician: profile.primaryPhysician,
        physicianPhone: profile.physicianPhone,
        insuranceProvider: profile.insuranceProvider,
        insurancePolicy: profile.insurancePolicy,
      },
      expiresAt,
    };

    if (profile.emergencyMode) {
      qrData.contacts = profile.contacts;
      if (user.emergencyProfileData?.locations?.length) {
        qrData.currentLocation = user.emergencyProfileData.locations[0];
      }
    }

    return qrData;
  }

  async grantAccess(userId: string, dto: GrantAccessDto) {
    const expiresAt = new Date(Date.now() + dto.expiresIn * 60 * 60 * 1000);

    const access = await this.prisma.emergencyAccess.create({
      data: {
        patientUserId: userId,
        accessorUserId: dto.providerUserId,
        reason: dto.reason,
        notes: dto.notes,
        expiresAt,
      },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: userId,
      action: 'EMERGENCY_ACCESS_GRANTED',
      resourceType: 'EmergencyAccess',
      resourceId: access.id,
      metadata: {
        accessorUserId: dto.providerUserId,
        reason: dto.reason,
        expiresAt: expiresAt.toISOString(),
      },
    });

    return access;
  }

  async revokeAccess(accessId: string, userId: string) {
    const existing = await this.prisma.emergencyAccess.findUnique({
      where: { id: accessId },
    });

    if (!existing) {
      throw new NotFoundException('Emergency access record not found');
    }

    await this.prisma.emergencyAccess.delete({
      where: { id: accessId },
    });

    await this.auditLog.capture({
      actorUserId: userId,
      patientUserId: existing.patientUserId,
      action: 'EMERGENCY_ACCESS_REVOKED',
      resourceType: 'EmergencyAccess',
      resourceId: accessId,
    });
  }

  private calculateReadinessScore(
    profile: {
      bloodGroup: string | null;
      organDonor: boolean | null;
      advanceDirectives: Prisma.JsonValue | null;
      primaryPhysician: string | null;
      insuranceProvider: string | null;
      insurancePolicy: string | null;
      emergencyNotes: string | null;
    } & { contacts?: { id: string }[] },
  ): number {
    let score = 0;

    if (profile.bloodGroup) score += 20;

    const contactCount = profile.contacts?.length ?? 0;
    if (contactCount > 0) {
      score += 25;
      score += (contactCount - 1) * 5;
    }

    if (profile.primaryPhysician) score += 15;
    if (profile.insuranceProvider || profile.insurancePolicy) score += 10;
    if (profile.advanceDirectives) score += 15;
    if (profile.emergencyNotes) score += 10;
    if (profile.organDonor !== null) score += 5;

    return Math.min(score, 100);
  }
}
