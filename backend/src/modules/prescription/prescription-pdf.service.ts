/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/prescription/prescription-pdf.service.ts
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
 * Business logic service for prescription
 *
 * Responsibilities:
 * - Execute business logic for prescription operations
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
 *
 * Dependencies:
 - common
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Prescription
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

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';

export interface PrescriptionPDFData {
  prescriptionId: string;
  doctorName: string;
  doctorQualification: string;
  doctorLicense: string;
  doctorContact: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  patientContact: string;
  diagnosis: string;
  date: string;
  items: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity: number;
    refills: number;
  }>;
  instructions?: string;
  verificationUrl: string;
  qrCodeDataUrl?: string;
}

@Injectable()
export class PrescriptionPDFService {
  private readonly logger = new Logger(PrescriptionPDFService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generatePrescriptionData(prescriptionId: string): Promise<PrescriptionPDFData> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patientUser: { select: { fullName: true, dateOfBirth: true, gender: true, phoneNumber: true } },
        doctorProfile: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        PrescriptionItem: true,
        PrescriptionVerification: { select: { verificationUrl: true } },
      },
    });

    if (!prescription) throw new Error(`Prescription ${prescriptionId} not found`);

    const age = prescription.patientUser.dateOfBirth
      ? Math.floor((Date.now() - new Date(prescription.patientUser.dateOfBirth).getTime()) / (365.25 * 86400000)).toString()
      : 'N/A';

    const diagnosisText = prescription.diagnosis
      ? (prescription.diagnosis as Array<{ code: string; name: string; type?: string }>)
          .map((d) => `${d.code} — ${d.name}${d.type ? ` (${d.type})` : ''}`)
          .join('\n')
      : prescription.diagnosisSummary ?? '';

    return {
      prescriptionId: prescription.id,
      doctorName: prescription.doctorProfile?.user?.fullName ?? 'Unknown',
      doctorQualification: prescription.doctorProfile?.qualifications?.join(', ') ?? '',
      doctorLicense: prescription.doctorProfile?.registrationNumber ?? '',
      doctorContact: prescription.doctorProfile?.consultationFee?.toString() ?? '',
      patientName: prescription.patientUser.fullName,
      patientAge: age,
      patientGender: prescription.patientUser.gender ?? 'N/A',
      patientContact: prescription.patientUser.phoneNumber,
      diagnosis: diagnosisText,
      date: String((prescription.issuedAt ?? new Date()).toISOString().split('T')[0]),
      items: prescription.PrescriptionItem.map((item) => ({
        name: item.drugName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: `${item.durationDays} days`,
        instructions: item.instructions ?? undefined,
        quantity: item.quantity,
        refills: item.refills,
      })),
      instructions: prescription.instructions ?? undefined,
      verificationUrl: prescription.PrescriptionVerification?.verificationUrl ?? '',
    };
  }

  generateHtml(data: PrescriptionPDFData): string {
    const itemsHtml = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #ccc;">${item.name}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.dosage}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.frequency}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.duration}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.refills}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.instructions ?? '—'}</td>
        </tr>`
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 40px; color: #1a1a2e; }
    .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
    .header .subtitle { color: #64748b; font-size: 12px; margin-top: 4px; }
    .doctor-info { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .patient-info { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 600; color: #2563eb; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .diagnosis { background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
    th { background: #2563eb; color: white; padding: 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    .instructions { background: #fef3c7; padding: 12px; border-radius: 8px; margin-bottom: 24px; font-size: 13px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
    .qr-placeholder { width: 80px; height: 80px; background: #f1f5f9; border: 2px dashed #94a3b8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; text-align: center; }
    .signature-area { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .signature-line { width: 200px; border-top: 1px solid #1a1a2e; margin-top: 40px; }
    .stamp { float: right; width: 100px; height: 100px; border: 2px solid #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2563eb; font-size: 10px; font-weight: 600; text-align: center; opacity: 0.7; }
  </style>
</head>
<body>
  <div class="header">
    <h1>WYSHCARE</h1>
    <div class="subtitle">Digital Prescription · Verified by WyshCare OS</div>
  </div>

  <div class="doctor-info">
    <div>
      <div class="section-title">Prescriber</div>
      <div style="font-size:16px;font-weight:600;">Dr. ${data.doctorName}</div>
      <div style="font-size:12px;color:#64748b;">${data.doctorQualification}</div>
      <div style="font-size:12px;color:#64748b;">License: ${data.doctorLicense}</div>
    </div>
    <div style="text-align:right;">
      <div class="section-title">Date</div>
      <div style="font-size:14px;">${data.date}</div>
      <div style="font-size:11px;color:#64748b;">Rx ID: ${data.prescriptionId.slice(0, 8).toUpperCase()}</div>
    </div>
  </div>

  <div class="patient-info">
    <div>
      <div class="section-title">Patient</div>
      <div style="font-size:14px;font-weight:500;">${data.patientName}</div>
      <div style="font-size:12px;color:#64748b;">${data.patientAge} yrs · ${data.patientGender}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:12px;color:#64748b;">${data.patientContact}</div>
    </div>
  </div>

  <div>
    <div class="section-title">Diagnosis</div>
    <div class="diagnosis">${data.diagnosis.replace(/\n/g, '<br>') || '—'}</div>
  </div>

  <div class="section-title">Prescription</div>
  <table>
    <thead>
      <tr>
        <th>Medication</th>
        <th>Dosage</th>
        <th>Frequency</th>
        <th>Duration</th>
        <th>Qty</th>
        <th>Refills</th>
        <th>Instructions</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  ${data.instructions ? `<div><div class="section-title">Additional Instructions</div><div class="instructions">${data.instructions}</div></div>` : ''}

  <div class="signature-area">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;">
      <div>
        <div class="signature-line"></div>
        <div style="font-size:12px;margin-top:4px;">Dr. ${data.doctorName}</div>
        <div style="font-size:11px;color:#64748b;">Digital Signature · Verified by WyshCare</div>
      </div>
      <div class="stamp">WYSHCARE<br>VERIFIED</div>
    </div>
  </div>

  <div class="footer">
    <div>Generated by WyshCare OS · wyshcare.com</div>
    <div>Verify at: ${data.verificationUrl || 'wyshcare.com/rx/verify'}</div>
  </div>
</body>
</html>`;
  }
}
