import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { FhirService } from '../modules/fhir/fhir.service';
import { PrismaService } from '../providers/prisma/prisma.service';

function makePrismaMock() {
  const fn = () => mock.fn<(...args: any[]) => any>();
  return {
    user: {
      findUnique: fn(),
      findMany: fn(),
    },
    vitalsRecord: {
      findUnique: fn(),
      findMany: fn(),
    },
    labResult: {
      findUnique: fn(),
      findMany: fn(),
    },
    prescription: {
      findUnique: fn(),
      findMany: fn(),
    },
  };
}

describe('FhirService', () => {
  describe('capability statement', () => {
    it('returns a valid CapabilityStatement', async () => {
      const prisma = makePrismaMock() as any;
      const service = new FhirService(prisma as unknown as PrismaService);
      const cap = await service.getCapability() as any;

      assert.equal(cap.resourceType, 'CapabilityStatement');
      assert.equal(cap.fhirVersion, '4.0.1');
      assert.equal(cap.rest[0].resource.length, 3);
    });
  });

  describe('Patient', () => {
    it('readPatient returns FHIR Patient resource', async () => {
      const prisma = makePrismaMock() as any;
      prisma.user.findUnique.mock.mockImplementation(() =>
        Promise.resolve({
          id: 'user-1',
          wyshId: 'WYSH-0001',
          phoneNumber: '+919000000001',
          email: 'test@example.com',
          fullName: 'Test Patient',
          gender: 'MALE',
          dateOfBirth: new Date('1990-01-15'),
          bloodGroup: 'O+',
          aadhaarLast4: '1234',
          abhaAddress: 'test@abdm',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-06-01'),
          roles: [{ role: 'PATIENT' }],
          emergencyProfileData: null,
        }),
      );

      const service = new FhirService(prisma as unknown as PrismaService);
      const patient = await service.readPatient('user-1') as any;

      assert.equal(patient.resourceType, 'Patient');
      assert.equal(patient.id, 'user-1');
      assert.equal(patient.name[0].text, 'Test Patient');
      assert.equal(patient.gender, 'male');
      assert.equal(patient.birthDate, '1990-01-15');
      assert.ok(patient.identifier.some((i: any) => i.system === 'https://wysh.care/id'));
    });

    it('readPatient throws when not found', async () => {
      const prisma = makePrismaMock() as any;
      prisma.user.findUnique.mock.mockImplementation(() => Promise.resolve(null));
      const service = new FhirService(prisma as unknown as PrismaService);
      await assert.rejects(() => service.readPatient('nonexistent'), NotFoundException);
    });

    it('searchPatient returns Bundle', async () => {
      const prisma = makePrismaMock() as any;
      prisma.user.findMany.mock.mockImplementation(() =>
        Promise.resolve([
          { id: 'u1', wyshId: 'WYSH-1', fullName: 'Alice', phoneNumber: '+91...', email: 'a@t.com', gender: 'FEMALE', dateOfBirth: new Date('1990-01-01'), createdAt: new Date(), updatedAt: new Date(), roles: [], emergencyProfileData: null },
          { id: 'u2', wyshId: 'WYSH-2', fullName: 'Bob', phoneNumber: '+91...', email: 'b@t.com', gender: 'MALE', dateOfBirth: new Date('1985-05-05'), createdAt: new Date(), updatedAt: new Date(), roles: [], emergencyProfileData: null },
        ]),
      );

      const service = new FhirService(prisma as unknown as PrismaService);
      const result = await service.searchPatient({ name: 'Ali' }) as any;

      assert.equal(result.resourceType, 'Bundle');
      assert.equal(result.type, 'searchset');
      assert.equal(result.total, 2);
    });
  });

  describe('Observation — vitals', () => {
    it('readObservation returns FHIR Observation', async () => {
      const prisma = makePrismaMock() as any;
      prisma.vitalsRecord.findUnique.mock.mockImplementation(() =>
        Promise.resolve({
          id: 'vital-1',
          patientId: 'user-1',
          bpSystolic: 120,
          bpDiastolic: 80,
          heartRate: 72,
          temperature: 36.6,
          spo2: 98,
          respiratoryRate: 16,
          weight: 75,
          height: 175,
          bmi: 24.5,
          recordedAt: new Date('2024-06-01T10:00:00Z'),
          createdAt: new Date('2024-06-01T10:00:00Z'),
          patient: { id: 'user-1' },
        }),
      );

      const service = new FhirService(prisma as unknown as PrismaService);
      const obs = await service.readObservation('vital-1') as any;

      assert.equal(obs.resourceType, 'Observation');
      assert.equal(obs.status, 'final');
      assert.equal(obs.subject.reference, 'Patient/user-1');
      assert.ok(obs.component.length >= 2);
    });

    it('searchObservation returns Bundle', async () => {
      const prisma = makePrismaMock() as any;
      prisma.vitalsRecord.findMany.mock.mockImplementation(() =>
        Promise.resolve([
          { id: 'v1', patientId: 'user-1', bpSystolic: 120, bpDiastolic: 80, heartRate: null, temperature: null, spo2: null, respiratoryRate: null, weight: null, height: null, bmi: null, recordedAt: new Date(), createdAt: new Date(), patient: { id: 'user-1' } },
        ]),
      );

      const service = new FhirService(prisma as unknown as PrismaService);
      const result = await service.searchObservation({ patient: 'user-1' }) as any;
      assert.equal(result.resourceType, 'Bundle');
      assert.equal(result.type, 'searchset');
    });
  });

  describe('MedicationRequest', () => {
    it('readMedicationRequest returns FHIR MedicationRequest', async () => {
      const prisma = makePrismaMock() as any;
      prisma.prescription.findUnique.mock.mockImplementation(() =>
        Promise.resolve({
          id: 'rx-1',
          status: 'ACTIVE',
          patientUserId: 'user-1',
          issuedAt: new Date('2024-06-01'),
          createdAt: new Date('2024-06-01'),
          instructions: 'Take with food',
          patientUser: { id: 'user-1', fullName: 'Test Patient' },
          doctorProfile: { userId: 'doc-1', user: { fullName: 'Dr. Test' } },
          PrescriptionItem: [
            { drugName: 'Amoxicillin', dosage: '500mg', frequency: 'TID', durationDays: 7, quantity: 21, refills: 0 },
          ],
        }),
      );

      const service = new FhirService(prisma as unknown as PrismaService);
      const mr = await service.readMedicationRequest('rx-1') as any;

      assert.equal(mr.resourceType, 'MedicationRequest');
      assert.equal(mr.id, 'rx-1');
      assert.equal(mr.status, 'active');
      assert.equal(mr.intent, 'order');
      assert.equal(mr.subject.reference, 'Patient/user-1');
      assert.ok(mr.dosageInstruction);
      assert.equal(mr.dosageInstruction.length, 1);
    });

    it('readMedicationRequest throws when not found', async () => {
      const prisma = makePrismaMock() as any;
      prisma.prescription.findUnique.mock.mockImplementation(() => Promise.resolve(null));
      const service = new FhirService(prisma as unknown as PrismaService);
      await assert.rejects(() => service.readMedicationRequest('nonexistent'), NotFoundException);
    });

    it('searchMedicationRequest returns Bundle', async () => {
      const prisma = makePrismaMock() as any;
      prisma.prescription.findMany.mock.mockImplementation(() =>
        Promise.resolve([
          { id: 'rx-1', status: 'ACTIVE', patientUserId: 'user-1', issuedAt: new Date(), createdAt: new Date(), patientUser: { fullName: 'P' }, doctorProfile: null, PrescriptionItem: [{ drugName: 'Metformin', dosage: '500mg', frequency: 'BID', durationDays: 30, quantity: 60, refills: 2 }] },
        ]),
      );

      const service = new FhirService(prisma as unknown as PrismaService);
      const result = await service.searchMedicationRequest({ patient: 'user-1' }) as any;
      assert.equal(result.resourceType, 'Bundle');
      assert.equal(result.type, 'searchset');
      assert.equal(result.total, 1);
    });
  });

  describe('Observation — lab results', () => {
    it('readLabObservation returns FHIR Observation with laboratory category', async () => {
      const prisma = makePrismaMock() as any;
      prisma.labResult.findUnique.mock.mockImplementation(() =>
        Promise.resolve({
          id: 'lab-1',
          diagnosticOrderId: 'do-1',
          testName: 'Hemoglobin',
          result: '14.5',
          unit: 'g/dL',
          referenceRange: '13.0-17.0',
          isAbnormal: false,
          createdAt: new Date('2024-06-01'),
          updatedAt: new Date('2024-06-01'),
          diagnosticOrder: { userId: 'user-1' },
        }),
      );

      const service = new FhirService(prisma as unknown as PrismaService);
      const obs = await service.readLabObservation('lab-1') as any;

      assert.equal(obs.resourceType, 'Observation');
      assert.equal(obs.category[0].coding[0].code, 'laboratory');
      assert.equal(obs.code.coding[0].code, 'Hemoglobin');
      assert.equal(obs.valueString, '14.5');
    });
  });
});
