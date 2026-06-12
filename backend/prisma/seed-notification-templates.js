/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/prisma/seed-notification-templates.js
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
 * seed-notification-templates — Database module
 *
 * Responsibilities:
 * - Support database functionality
 *
 * Used By:
 - Standalone (not imported by other source files)
 *
 * Calls:
 - None identified
 *
 * Dependencies:
 - None identified
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Database
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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const templates = [
  {
    key: 'appointment_booked',
    name: 'Appointment Booked',
    channels: ['SMS', 'EMAIL', 'PUSH', 'IN_APP'],
    subject: 'Appointment Confirmed – {{doctorName}}',
    body: `Hi {{patientName}},

Your appointment with {{doctorName}} has been confirmed for {{appointmentTime}}.

Mode: {{consultationMode}}
Location: {{clinicName}}

Need to reschedule? Visit your WyshCare dashboard.

Thank you,
WyshCare Health Team`,
    variables: ['patientName', 'doctorName', 'appointmentTime', 'consultationMode', 'clinicName'],
  },
  {
    key: 'appointment_reminder',
    name: 'Appointment Reminder',
    channels: ['SMS', 'EMAIL', 'PUSH'],
    subject: 'Reminder: Appointment with {{doctorName}} in {{hoursBefore}} hours',
    body: `Hi {{patientName}},

This is a reminder that your appointment with {{doctorName}} at {{clinicName}} is in {{hoursBefore}} hours.

Time: {{appointmentTime}}

Please arrive 15 minutes early.

WyshCare Health`,
    variables: ['patientName', 'doctorName', 'clinicName', 'appointmentTime', 'hoursBefore'],
  },
  {
    key: 'appointment_cancelled',
    name: 'Appointment Cancelled',
    channels: ['SMS', 'EMAIL', 'PUSH'],
    subject: 'Appointment Cancelled – {{doctorName}}',
    body: `Hi {{patientName}},

Your appointment with {{doctorName}} on {{appointmentTime}} has been cancelled.

Reason: {{reason}}

Book a new appointment anytime on your WyshCare dashboard.

WyshCare Health`,
    variables: ['patientName', 'doctorName', 'appointmentTime', 'reason'],
  },
  {
    key: 'lab_result_ready',
    name: 'Lab Result Ready',
    channels: ['SMS', 'EMAIL', 'PUSH', 'IN_APP'],
    subject: 'Your Lab Result is Ready – {{testName}}',
    body: `Hi {{patientName}},

Your lab result for {{testName}} is now available.

Result: {{result}} {{unit}}
Status: {{isAbnormal}}

{{#if isAbnormal}}
Please consult your doctor to discuss these results.
{{/if}}

View full report on your WyshCare dashboard.

WyshCare Health`,
    variables: ['patientName', 'testName', 'result', 'unit', 'isAbnormal'],
  },
  {
    key: 'prescription_created',
    name: 'Prescription Created',
    channels: ['SMS', 'PUSH', 'IN_APP'],
    subject: 'New Prescription from {{doctorName}}',
    body: `Hi {{patientName}},

Dr. {{doctorName}} has prescribed:

{{medicationNames}}

{{#if diagnosis}}
Diagnosis: {{diagnosis}}
{{/if}}

View and manage your prescriptions on WyshCare.

WyshCare Health`,
    variables: ['patientName', 'doctorName', 'medicationNames', 'diagnosis'],
  },
  {
    key: 'prescription_reminder',
    name: 'Prescription Refill Reminder',
    channels: ['SMS', 'PUSH', 'IN_APP'],
    subject: 'Medication Reminder – {{medications}}',
    body: `Hi {{patientName}},

Don't forget to take your medication:

{{medications}}

Prescribed by: Dr. {{doctorName}}
Prescription ID: {{prescriptionId}}

WyshCare Health`,
    variables: ['patientName', 'doctorName', 'prescriptionId', 'medications'],
  },
  {
    key: 'careplan_created',
    name: 'Care Plan Created',
    channels: ['EMAIL', 'PUSH', 'IN_APP'],
    subject: 'Your Care Plan is Ready – {{planTitle}}',
    body: `Hi {{patientName}},

A new care plan has been created for you:

Title: {{planTitle}}
Type: {{planType}}
ID: {{carePlanId}}

Follow your care plan on the WyshCare dashboard to stay on track.

WyshCare Health`,
    variables: ['patientName', 'planTitle', 'planType', 'carePlanId'],
  },
  {
    key: 'emergency_generic',
    name: 'Emergency Alert',
    channels: ['SMS', 'EMAIL', 'PUSH', 'VOICE'],
    subject: '🚨 EMERGENCY ALERT – {{type}}',
    body: `EMERGENCY ALERT

Type: {{type}}
Time: {{timestamp}}

Details:
{{details}}

This is an automated alert from WyshCare Health.`,
    variables: ['type', 'timestamp', 'details'],
  },
  {
    key: 'health_score_update',
    name: 'Health Score Updated',
    channels: ['PUSH', 'IN_APP'],
    subject: 'Your Health Score has Changed',
    body: `Hi {{patientName}},

Your WyshCare Health Score is now {{score}} (was {{previousScore}}).

{{#if scoreUp}}
Great improvement! Keep it up.
{{else}}
Check your dashboard for recommendations to improve.
{{/if}}

WyshCare Health`,
    variables: ['patientName', 'score', 'previousScore', 'scoreUp'],
  },
];

async function seedNotificationTemplates() {
  console.log('Seeding notification templates...');

  for (const template of templates) {
    const existing = await prisma.notificationTemplate.findUnique({
      where: { key: template.key },
    });

    if (existing) {
      await prisma.notificationTemplate.update({
        where: { key: template.key },
        data: template,
      });
      console.log(`  Updated: ${template.key}`);
    } else {
      await prisma.notificationTemplate.create({
        data: template,
      });
      console.log(`  Created: ${template.key}`);
    }
  }

  console.log(`Done. ${templates.length} templates seeded.`);
}

seedNotificationTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
