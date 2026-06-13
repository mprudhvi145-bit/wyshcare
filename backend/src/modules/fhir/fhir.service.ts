import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';

@Injectable()
export class FhirService {
  constructor(private readonly prisma: PrismaService) {}

  async getCapability(): Promise<object> {
    return {
      resourceType: 'CapabilityStatement',
      status: 'active',
      date: new Date().toISOString(),
      publisher: 'Wysh Technologies',
      kind: 'instance',
      software: { name: 'WyshCare FHIR Server', version: '1.0.0' },
      fhirVersion: '4.0.1',
      format: ['application/fhir+json'],
      rest: [
        {
          mode: 'server',
          resource: [
            {
              type: 'Patient',
              profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
              interaction: [
                { code: 'read' },
                { code: 'search-type' },
              ],
              searchParam: [
                { name: 'name', type: 'string' },
                { name: 'identifier', type: 'token' },
                { name: 'phone', type: 'token' },
                { name: 'email', type: 'token' },
              ],
            },
            {
              type: 'Observation',
              profile: ['http://hl7.org/fhir/StructureDefinition/Observation'],
              interaction: [
                { code: 'read' },
                { code: 'search-type' },
              ],
              searchParam: [
                { name: 'patient', type: 'reference' },
                { name: 'code', type: 'token' },
                { name: 'date', type: 'date' },
                { name: 'category', type: 'token' },
              ],
            },
            {
              type: 'MedicationRequest',
              profile: ['http://hl7.org/fhir/StructureDefinition/MedicationRequest'],
              interaction: [
                { code: 'read' },
                { code: 'search-type' },
              ],
              searchParam: [
                { name: 'patient', type: 'reference' },
                { name: 'status', type: 'token' },
                { name: 'authored-on', type: 'date' },
              ],
            },
          ],
        },
      ],
    };
  }

  // ---------------------------------------------------------------------------
  // Patient
  // ---------------------------------------------------------------------------
  async readPatient(userId: string): Promise<object> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true, emergencyProfileData: true },
    });
    if (!user) throw new NotFoundException('Patient not found');

    return {
      resourceType: 'Patient',
      id: user.id,
      identifier: [
        { system: 'https://wysh.care/id', value: user.wyshId },
        ...(user.aadhaarLast4
          ? [{ system: 'https://uidai.gov.in', value: `xxxx-xxxx-${user.aadhaarLast4}` }]
          : []),
        ...(user.abhaAddress
          ? [{ system: 'https://abdm.gov.in/abha', value: user.abhaAddress }]
          : []),
      ].filter(Boolean),
      name: user.fullName ? [{ use: 'official', text: user.fullName }] : undefined,
      telecom: [
        ...(user.phoneNumber ? [{ system: 'phone' as const, value: user.phoneNumber, use: 'mobile' as const }] : []),
        ...(user.email ? [{ system: 'email' as const, value: user.email }] : []),
      ],
      gender: (user.gender?.toLowerCase() as 'male' | 'female' | 'other' | undefined) ?? undefined,
      birthDate: user.dateOfBirth?.toISOString().slice(0, 10),
      ...(user.bloodGroup
        ? {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/patient-bloodGroup',
                valueString: user.bloodGroup,
              },
            ],
          }
        : {}),
      meta: {
        lastUpdated: user.updatedAt.toISOString(),
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async searchPatient(query: Record<string, string>): Promise<object> {
    const where: any = { deletedAt: null };

    if (query.name) {
      where.fullName = { contains: query.name, mode: 'insensitive' };
    }
    if (query.identifier) {
      where.wyshId = query.identifier;
    }
    if (query.phone) {
      where.phoneNumber = { contains: query.phone };
    }
    if (query.email) {
      where.email = { equals: query.email, mode: 'insensitive' };
    }

    const users = await this.prisma.user.findMany({
      where,
      include: { roles: true, emergencyProfileData: true },
      take: 50,
    });

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: users.length,
      entry: users.map((user) => ({
        fullUrl: `urn:uuid:${user.id}`,
        resource: {
          resourceType: 'Patient',
          id: user.id,
          identifier: [
            { system: 'https://wysh.care/id', value: user.wyshId },
            ...(user.aadhaarLast4
              ? [{ system: 'https://uidai.gov.in', value: `xxxx-xxxx-${user.aadhaarLast4}` }]
              : []),
            ...(user.abhaAddress
              ? [{ system: 'https://abdm.gov.in/abha', value: user.abhaAddress }]
              : []),
          ].filter(Boolean),
          name: user.fullName ? [{ use: 'official', text: user.fullName }] : undefined,
          telecom: [
            ...(user.phoneNumber ? [{ system: 'phone' as const, value: user.phoneNumber, use: 'mobile' as const }] : []),
            ...(user.email ? [{ system: 'email' as const, value: user.email }] : []),
          ],
          gender: (user.gender?.toLowerCase() as 'male' | 'female' | 'other' | undefined) ?? undefined,
          birthDate: user.dateOfBirth?.toISOString().slice(0, 10),
        },
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // Observation — vitals
  // ---------------------------------------------------------------------------
  async readObservation(observationId: string): Promise<object> {
    const vital = await this.prisma.vitalsRecord.findUnique({
      where: { id: observationId },
      include: { User_VitalsRecord_patientIdToUser: true },
    });
    if (!vital) throw new NotFoundException('Observation not found');

    return this.vitalToObservation(vital);
  }

  async searchObservation(query: Record<string, string>): Promise<object> {
    const patientId = query.patient;
    const code = query.code;
    const date = query.date;

    const where: any = {};
    if (patientId) where.patientId = patientId;

    const vitals = await this.prisma.vitalsRecord.findMany({
      where,
      include: { User_VitalsRecord_patientIdToUser: true },
      take: 100,
    });

    let observations = vitals.flatMap((v) => {
      const list = this.vitalToObservations(v);
      return Array.isArray(list) ? list : [list];
    });

    if (code) {
      observations = observations.filter((o: any) => o.code?.coding?.some((c: any) => c.code === code));
    }
    if (date) {
      const dateStr = date.replace(/eq|ge|le|gt|lt/, '').trim();
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        observations = observations.filter((o: any) => {
          const eff = o.effectiveDateTime;
          return eff && new Date(eff).toISOString().slice(0, 10) === d.toISOString().slice(0, 10);
        });
      }
    }

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: observations.length,
      entry: observations.map((obs) => ({
        fullUrl: `urn:uuid:${(obs as any).id}`,
        resource: obs,
      })),
    };
  }

  private vitalToObservation(vital: any): object {
    return {
      resourceType: 'Observation',
      id: vital.id,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '85354-9',
            display: 'Blood pressure panel',
          },
        ],
        text: 'Blood pressure',
      },
      subject: { reference: `Patient/${vital.patientId}` },
      effectiveDateTime: vital.recordedAt.toISOString(),
      issued: vital.createdAt.toISOString(),
      component: [
        ...(vital.bpSystolic != null
          ? [
              {
                code: {
                  coding: [
                    { system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' },
                  ],
                },
                valueQuantity: { value: vital.bpSystolic, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
              },
            ]
          : []),
        ...(vital.bpDiastolic != null
          ? [
              {
                code: {
                  coding: [
                    { system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' },
                  ],
                },
                valueQuantity: { value: vital.bpDiastolic, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
              },
            ]
          : []),
      ],
    };
  }

  private vitalToObservations(vital: any): object[] {
    const list: object[] = [];

    if (vital.bpSystolic != null || vital.bpDiastolic != null) {
      list.push({
        resourceType: 'Observation',
        id: `vital-bp-${vital.id}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' },
          ],
          text: 'Blood pressure',
        },
        subject: { reference: `Patient/${vital.patientId}` },
        effectiveDateTime: vital.recordedAt.toISOString(),
        issued: vital.createdAt.toISOString(),
        component: [
          ...(vital.bpSystolic != null
            ? [
                {
                  code: {
                    coding: [
                      { system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' },
                    ],
                  },
                  valueQuantity: { value: vital.bpSystolic, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
                },
              ]
            : []),
          ...(vital.bpDiastolic != null
            ? [
                {
                  code: {
                    coding: [
                      { system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' },
                    ],
                  },
                  valueQuantity: { value: vital.bpDiastolic, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
                },
              ]
            : []),
        ],
      });
    }

    if (vital.heartRate != null) {
      list.push({
        resourceType: 'Observation',
        id: `vital-hr-${vital.id}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' },
          ],
          text: 'Heart rate',
        },
        subject: { reference: `Patient/${vital.patientId}` },
        effectiveDateTime: vital.recordedAt.toISOString(),
        issued: vital.createdAt.toISOString(),
        valueQuantity: { value: vital.heartRate, unit: '/min', system: 'http://unitsofmeasure.org', code: '/min' },
      });
    }

    if (vital.temperature != null) {
      list.push({
        resourceType: 'Observation',
        id: `vital-temp-${vital.id}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '8310-5', display: 'Body temperature' },
          ],
          text: 'Temperature',
        },
        subject: { reference: `Patient/${vital.patientId}` },
        effectiveDateTime: vital.recordedAt.toISOString(),
        issued: vital.createdAt.toISOString(),
        valueQuantity: { value: vital.temperature, unit: 'deg C', system: 'http://unitsofmeasure.org', code: 'Cel' },
      });
    }

    if (vital.spo2 != null) {
      list.push({
        resourceType: 'Observation',
        id: `vital-spo2-${vital.id}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation' },
          ],
          text: 'SpO2',
        },
        subject: { reference: `Patient/${vital.patientId}` },
        effectiveDateTime: vital.recordedAt.toISOString(),
        issued: vital.createdAt.toISOString(),
        valueQuantity: { value: vital.spo2, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
      });
    }

    if (vital.respiratoryRate != null) {
      list.push({
        resourceType: 'Observation',
        id: `vital-rr-${vital.id}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '9279-1', display: 'Respiratory rate' },
          ],
          text: 'Respiratory rate',
        },
        subject: { reference: `Patient/${vital.patientId}` },
        effectiveDateTime: vital.recordedAt.toISOString(),
        issued: vital.createdAt.toISOString(),
        valueQuantity: {
          value: vital.respiratoryRate,
          unit: '/min',
          system: 'http://unitsofmeasure.org',
          code: '/min',
        },
      });
    }

    if (vital.weight != null) {
      list.push({
        resourceType: 'Observation',
        id: `vital-wt-${vital.id}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '29463-7', display: 'Body weight' },
          ],
          text: 'Weight',
        },
        subject: { reference: `Patient/${vital.patientId}` },
        effectiveDateTime: vital.recordedAt.toISOString(),
        issued: vital.createdAt.toISOString(),
        valueQuantity: { value: vital.weight, unit: 'kg', system: 'http://unitsofmeasure.org', code: 'kg' },
      });
    }

    if (vital.height != null) {
      list.push({
        resourceType: 'Observation',
        id: `vital-ht-${vital.id}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '8302-2', display: 'Body height' },
          ],
          text: 'Height',
        },
        subject: { reference: `Patient/${vital.patientId}` },
        effectiveDateTime: vital.recordedAt.toISOString(),
        issued: vital.createdAt.toISOString(),
        valueQuantity: { value: vital.height, unit: 'cm', system: 'http://unitsofmeasure.org', code: 'cm' },
      });
    }

    if (vital.bmi != null) {
      list.push({
        resourceType: 'Observation',
        id: `vital-bmi-${vital.id}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://loinc.org', code: '39156-5', display: 'Body mass index' },
          ],
          text: 'BMI',
        },
        subject: { reference: `Patient/${vital.patientId}` },
        effectiveDateTime: vital.recordedAt.toISOString(),
        issued: vital.createdAt.toISOString(),
        valueQuantity: { value: vital.bmi, unit: 'kg/m2', system: 'http://unitsofmeasure.org', code: 'kg/m2' },
      });
    }

    return list;
  }

  // ---------------------------------------------------------------------------
  // Observation — lab results
  // ---------------------------------------------------------------------------
  async readLabObservation(labResultId: string): Promise<object> {
    const lab = await this.prisma.labResult.findUnique({
      where: { id: labResultId },
      include: { DiagnosticOrder: { include: { user: true } } },
    });
    if (!lab) throw new NotFoundException('Observation not found');

    return this.labToObservation(lab);
  }

  async searchLabObservation(query: Record<string, string>): Promise<object> {
    const patientId = query.patient;
    const code = query.code;

    const where: any = {};
    if (patientId) {
      where.DiagnosticOrder = { userId: patientId };
    }

    const labs = await this.prisma.labResult.findMany({
      where,
      include: { DiagnosticOrder: { include: { user: true } } },
      take: 100,
    });

    let observations = labs.map((lab) => this.labToObservation(lab));

    if (code) {
      observations = observations.filter((o: any) =>
        o.code?.coding?.some((c: any) => c.code === code),
      );
    }

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: observations.length,
      entry: observations.map((obs) => ({
        fullUrl: `urn:uuid:${(obs as any).id}`,
        resource: obs,
      })),
    };
  }

  private labToObservation(lab: any): object {
    return {
      resourceType: 'Observation',
      id: `lab-${lab.id}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: lab.testName,
            display: lab.testName,
          },
        ],
        text: lab.testName,
      },
      subject: {
        reference: `Patient/${lab.DiagnosticOrder?.userId}`,
      },
      effectiveDateTime: lab.createdAt.toISOString(),
      issued: lab.createdAt.toISOString(),
      valueString: lab.result,
      ...(lab.unit
        ? {
            valueQuantity: {
              value: parseFloat(lab.result) || 0,
              unit: lab.unit,
              system: 'http://unitsofmeasure.org',
              code: lab.unit,
            },
          }
        : {}),
      referenceRange: lab.referenceRange
        ? [{ text: lab.referenceRange }]
        : undefined,
    };
  }

  // ---------------------------------------------------------------------------
  // MedicationRequest
  // ---------------------------------------------------------------------------
  async readMedicationRequest(prescriptionId: string): Promise<object> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        PrescriptionItem: true,
        patientUser: true,
        doctorProfile: { include: { user: true } },
      },
    });
    if (!prescription) throw new NotFoundException('MedicationRequest not found');

    return this.prescriptionToMedicationRequest(prescription);
  }

  async searchMedicationRequest(query: Record<string, string>): Promise<object> {
    const patientId = query.patient;
    const status = query.status;
    const authoredOn = query['authored-on'];

    const where: any = {};
    if (patientId) where.patientUserId = patientId;
    if (status) where.status = status.toUpperCase();

    const prescriptions = await this.prisma.prescription.findMany({
      where,
      include: {
        PrescriptionItem: true,
        patientUser: true,
        doctorProfile: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (authoredOn) {
      const dateStr = authoredOn.replace(/eq|ge|le|gt|lt/, '').trim();
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const filtered = prescriptions.filter((rx) =>
          rx.createdAt.toISOString().slice(0, 10) === d.toISOString().slice(0, 10),
        );
        return {
          resourceType: 'Bundle',
          type: 'searchset',
          total: filtered.length,
          entry: filtered.map((rx) => ({
            fullUrl: `urn:uuid:${rx.id}`,
            resource: this.prescriptionToMedicationRequest(rx),
          })),
        };
      }
    }

    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: prescriptions.length,
      entry: prescriptions.map((rx) => ({
        fullUrl: `urn:uuid:${rx.id}`,
        resource: this.prescriptionToMedicationRequest(rx),
      })),
    };
  }

  private prescriptionToMedicationRequest(rx: any): object {
    const statusMap: Record<string, string> = {
      DRAFT: 'draft',
      ACTIVE: 'active',
      DISPENSED: 'completed',
      CANCELLED: 'cancelled',
      EXPIRED: 'stopped',
    };

    return {
      resourceType: 'MedicationRequest',
      id: rx.id,
      identifier: [
        { system: 'https://wysh.care/prescription', value: rx.id },
      ],
      status: statusMap[rx.status] || 'unknown',
      intent: 'order',
      medicationCodeableConcept: rx.PrescriptionItem?.length
        ? {
            coding: [
              {
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: rx.PrescriptionItem[0].drugName,
                display: rx.PrescriptionItem[0].drugName,
              },
            ],
            text: rx.PrescriptionItem.map((i: any) => i.drugName).join(', '),
          }
        : undefined,
      subject: {
        reference: `Patient/${rx.patientUserId}`,
        display: rx.patientUser?.fullName,
      },
      authoredOn: rx.issuedAt?.toISOString() ?? rx.createdAt.toISOString(),
      requester: rx.doctorProfile?.user
        ? {
            reference: `Practitioner/${rx.doctorProfile.userId}`,
            display: rx.doctorProfile.user.fullName,
          }
        : undefined,
      dosageInstruction: rx.PrescriptionItem?.map((item: any) => ({
        text: `${item.drugName} ${item.dosage} — ${item.frequency} for ${item.durationDays} days`,
        timing: {
          code: {
            text: item.frequency,
          },
        },
        doseAndRate: [
          {
            doseQuantity: {
              value: parseFloat(item.dosage) || 0,
              unit: item.dosage.replace(/[\d.]+\s*/, '') || 'dose',
            },
          },
        ],
      })),
      dispenseRequest: {
        quantity: {
          value: rx.PrescriptionItem?.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0) || 0,
               },
        numberOfRepeatsAllowed: rx.PrescriptionItem?.[0]?.refills ?? 0,
      },
      note: rx.instructions ? [{ text: rx.instructions }] : undefined,
    };
  }
}
