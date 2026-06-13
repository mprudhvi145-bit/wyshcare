import { EncryptionService } from '../../common/encryption/encryption.service';

export const PHI_MODELS = new Set([
  'User', 'DoctorProfile', 'HealthRecord', 'Prescription', 'ClinicalNote',
  'ConsultationRecording', 'ConsultationSOAP', 'ConsultationTranscript',
  'HealthInformationTransfer', 'AbhaProfile', 'Allergy', 'Condition',
  'Immunization', 'ProcedureRecord', 'FamilyHistory', 'VitalsRecord',
  'LabResult', 'EmergencyProfile', 'EmergencyContact', 'LifestyleProfile',
  'SymptomEvent', 'Medication', 'PrescriptionItem', 'DiagnosticReport', 'CarePlan',
]);

export const PHI_FIELD_MAP: Record<string, string[]> = {
  User: ['fullName', 'phoneNumber', 'email', 'dateOfBirth', 'aadhaarLast4', 'aadhaarLastDigits'],
  DoctorProfile: ['fullName', 'phoneNumber', 'email', 'registrationNumber', 'primaryPhysician', 'physicianPhone'],
  HealthRecord: ['diagnosisSummary', 'medicalHistory', 'chronicConditions', 'allergiesSummary', 'bloodGroup'],
  Prescription: ['instructions', 'currentMedications', 'diagnosisSummary'],
  ClinicalNote: ['content', 'diagnosisSummary'],
  ConsultationRecording: ['storageUrl'],
  ConsultationSOAP: ['subjective', 'objective', 'assessment', 'plan'],
  ConsultationTranscript: ['transcriptText'],
  HealthInformationTransfer: ['dataPayload'],
  AbhaProfile: ['abhaNumber', 'abhaAddress', 'healthIdNumber'],
  Allergy: ['allergiesSummary'],
  Condition: ['diagnosisSummary', 'chronicConditions'],
  Immunization: ['medicalHistory'],
  ProcedureRecord: ['pastSurgeries'],
  FamilyHistory: ['medicalHistory'],
  VitalsRecord: ['bloodGroup'],
  LabResult: ['diagnosisSummary'],
  EmergencyProfile: ['emergencyNotes', 'emergencyContactName', 'emergencyContactPhone'],
  EmergencyContact: ['emergencyContactName', 'emergencyContactPhone'],
  LifestyleProfile: ['chronicConditions'],
  SymptomEvent: ['diagnosisSummary'],
  Medication: ['currentMedications'],
  PrescriptionItem: ['instructions', 'currentMedications'],
  DiagnosticReport: ['diagnosisSummary'],
  CarePlan: ['diagnosisSummary', 'instructions'],
};

function encryptFields(data: Record<string, unknown>, modelName: string, fields: string[], svc: EncryptionService): void {
  for (const field of fields) {
    if (typeof data[field] === 'string' && (data[field] as string).length > 0) {
      data[field] = svc.encrypt(data[field] as string, `${modelName}:${field}`);
    }
  }
}

function decryptFields(data: Record<string, unknown>, modelName: string, fields: string[], svc: EncryptionService): void {
  for (const field of fields) {
    if (typeof data[field] === 'string' && (data[field] as string).length > 0) {
      try {
        data[field] = svc.decrypt(data[field] as string, `${modelName}:${field}`);
      } catch {
        /* already plaintext */
      }
    }
  }
}

function buildEncryptionService(): EncryptionService {
  const key = process.env.MASTER_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('MASTER_ENCRYPTION_KEY is not set');
  }
  return new EncryptionService({
    getOrThrow: () => key,
    get: () => undefined,
  } as any);
}

function processArgs(args: any, action: string, modelName: string, fields: string[], svc: EncryptionService): void {
  if (action === 'upsert') {
    if (args?.create) encryptFields(args.create, modelName, fields, svc);
    if (args?.update) encryptFields(args.update, modelName, fields, svc);
  } else if (action === 'createMany' && Array.isArray(args?.data)) {
    for (const item of args.data) encryptFields(item, modelName, fields, svc);
  } else if (args?.data) {
    encryptFields(args.data, modelName, fields, svc);
  }
}

function processResult(result: unknown, modelName: string, fields: string[], svc: EncryptionService): void {
  if (!result) return;
  const items = Array.isArray(result) ? result : [result];
  for (const item of items) {
    if (typeof item === 'object' && item !== null) {
      decryptFields(item as Record<string, unknown>, modelName, fields, svc);
    }
  }
}

export function createEncryptionExtension() {
  const svc = buildEncryptionService();
  const ALL = ['create', 'createMany', 'update', 'updateMany', 'upsert'];
  return {
    name: 'phi-encryption' as const,
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          if (!model || !PHI_MODELS.has(model)) return query(args);
          const fields = PHI_FIELD_MAP[model];
          if (!fields?.length) return query(args);
          if (ALL.includes(operation)) processArgs(args, operation, model, fields, svc);
          const result = await query(args);
          processResult(result, model, fields, svc);
          return result;
        },
      },
    },
  };
}
