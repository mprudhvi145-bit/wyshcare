/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/src/modules/specialties/ophthalmology/ophthalmology.service.ts
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
 * Business logic service for ophthalmology
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
 *
 * Dependencies:
 - common
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

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { SpecialtyBaseService } from '../shared/specialty-base.service';

@Injectable()
export class OphthalmologyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly base: SpecialtyBaseService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'ophthalmology-exam',
        name: 'Comprehensive Eye Exam',
        description: 'Full ophthalmological evaluation',
        sections: [
          {
            id: 'chief-complaint', title: 'Chief Complaint', type: 'form' as const, fields: [
              { id: 'primaryComplaint', label: 'Primary Complaint', type: 'textarea', required: true },
              { id: 'onset', label: 'Onset', type: 'select', options: [
                { label: 'Sudden', value: 'sudden' }, { label: 'Gradual', value: 'gradual' },
              ]},
              { id: 'duration', label: 'Duration', type: 'text' },
              { id: 'eyeAffected', label: 'Eye Affected', type: 'select', options: [
                { label: 'Right (OD)', value: 'od' }, { label: 'Left (OS)', value: 'os' },
                { label: 'Both (OU)', value: 'ou' },
              ]},
              { id: 'symptoms', label: 'Symptoms', type: 'multiselect', options: [
                { label: 'Blurred Vision', value: 'blurred' }, { label: 'Double Vision', value: 'diplopia' },
                { label: 'Pain', value: 'pain' }, { label: 'Redness', value: 'redness' },
                { label: 'Photophobia', value: 'photophobia' }, { label: 'Floaters', value: 'floaters' },
                { label: 'Flashing Lights', value: 'flashes' }, { label: 'Watering', value: 'watering' },
                { label: 'Dryness', value: 'dryness' }, { label: 'Discharge', value: 'discharge' },
              ]},
            ],
          },
          {
            id: 'visual-acuity', title: 'Visual Acuity', type: 'measurement', fields: [
              { id: 'vaRightDistance', label: 'VA Distance - Right (OD)', type: 'text', placeholder: 'e.g., 6/6, 20/20' },
              { id: 'vaLeftDistance', label: 'VA Distance - Left (OS)', type: 'text' },
              { id: 'vaRightNear', label: 'VA Near - Right (OD)', type: 'text', placeholder: 'e.g., N6' },
              { id: 'vaLeftNear', label: 'VA Near - Left (OS)', type: 'text' },
              { id: 'pinholeRight', label: 'Pinhole - Right (OD)', type: 'text' },
              { id: 'pinholeLeft', label: 'Pinhole - Left (OS)', type: 'text' },
              { id: 'refractionRight', label: 'Refraction - Right (OD)', type: 'text' },
              { id: 'refractionLeft', label: 'Refraction - Left (OS)', type: 'text' },
            ],
          },
          {
            id: 'anterior-segment', title: 'Anterior Segment', type: 'form', fields: [
              { id: 'lids', label: 'Lids & Lashes', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Blepharitis', value: 'blepharitis' },
                { label: 'Hordeolum', value: 'hordeolum' }, { label: 'Chalazion', value: 'chalazion' },
                { label: 'Ptosis', value: 'ptosis' }, { label: 'Ectropion', value: 'ectropion' },
                { label: 'Entropion', value: 'entropion' }, { label: 'Trichiasis', value: 'trichiasis' },
              ]},
              { id: 'conjunctiva', label: 'Conjunctiva', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Conjunctivitis', value: 'conjunctivitis' },
                { label: 'Subconjunctival Hemorrhage', value: 'hemorrhage' },
                { label: 'Pinguecula', value: 'pinguecula' }, { label: 'Pterygium', value: 'pterygium' },
                { label: 'Chemosis', value: 'chemosis' }, { label: 'Follicles', value: 'follicles' },
              ]},
              { id: 'cornea', label: 'Cornea', type: 'select', options: [
                { label: 'Clear', value: 'clear' }, { label: 'Edema', value: 'edema' },
                { label: 'Opacity/Scar', value: 'opacity' }, { label: 'Ulcer', value: 'ulcer' },
                { label: 'Keratoconus', value: 'keratoconus' }, { label: 'Dystrophy', value: 'dystrophy' },
                { label: 'Keratopathy', value: 'keratopathy' }, { label: 'Graft', value: 'graft' },
              ]},
              { id: 'anteriorChamber', label: 'Anterior Chamber', type: 'select', options: [
                { label: 'Deep & Quiet', value: 'deep_quiet' }, { label: 'Shallow', value: 'shallow' },
                { label: 'Cells', value: 'cells' }, { label: 'Flare', value: 'flare' },
                { label: 'Hypopyon', value: 'hypopyon' }, { label: 'Hyphaema', value: 'hyphaema' },
              ]},
              { id: 'iris', label: 'Iris', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Iritis', value: 'iritis' },
                { label: 'Synechiae', value: 'synechiae' }, { label: 'Rubeosis', value: 'rubeosis' },
                { label: 'Coloboma', value: 'coloboma' }, { label: 'Iridodonesis', value: 'iridodonesis' },
              ]},
              { id: 'lens', label: 'Lens', type: 'select', options: [
                { label: 'Clear', value: 'clear' }, { label: 'NS Cataract', value: 'ns_cataract' },
                { label: 'Cortical Cataract', value: 'cortical_cataract' },
                { label: 'PSC Cataract', value: 'psc_cataract' },
                { label: 'Mature Cataract', value: 'mature_cataract' },
                { label: 'Pseudophakia (IOL)', value: 'pseudophakia' },
                { label: 'Aphakia', value: 'aphakia' }, { label: 'Dislocated IOL', value: 'dislocated_iol' },
              ]},
            ],
          },
          {
            id: 'posterior-segment', title: 'Posterior Segment', type: 'form', fields: [
              { id: 'vitreous', label: 'Vitreous', type: 'select', options: [
                { label: 'Clear', value: 'clear' }, { label: 'Vitreous Hemorrhage', value: 'hemorrhage' },
                { label: 'Vitreous Opacity', value: 'opacity' }, { label: 'PVD', value: 'pvd' },
                { label: 'Vitritis', value: 'vitritis' }, { label: 'Syneresis', value: 'syneresis' },
              ]},
              { id: 'opticDiscRight', label: 'Optic Disc - Right (OD)', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Cupping', value: 'cupping' },
                { label: 'Edema', value: 'edema' }, { label: 'Atrophy', value: 'atrophy' },
                { label: 'Drusen', value: 'drusen' }, { label: 'Hypoplasia', value: 'hypoplasia' },
              ]},
              { id: 'opticDiscLeft', label: 'Optic Disc - Left (OS)', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Cupping', value: 'cupping' },
                { label: 'Edema', value: 'edema' }, { label: 'Atrophy', value: 'atrophy' },
                { label: 'Drusen', value: 'drusen' }, { label: 'Hypoplasia', value: 'hypoplasia' },
              ]},
              { id: 'cdRatioRight', label: 'C:D Ratio - Right (OD)', type: 'text', placeholder: 'e.g., 0.3' },
              { id: 'cdRatioLeft', label: 'C:D Ratio - Left (OS)', type: 'text' },
              { id: 'macula', label: 'Macula', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'AMD Dry', value: 'amd_dry' },
                { label: 'AMD Wet', value: 'amd_wet' }, { label: 'Macular Edema', value: 'macular_edema' },
                { label: 'Macular Hole', value: 'macular_hole' }, { label: 'Epiretinal Membrane', value: 'erm' },
                { label: 'Drusen', value: 'drusen' }, { label: 'Scar', value: 'scar' },
              ]},
              { id: 'retina', label: 'Retina', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Diabetic Retinopathy', value: 'dr' },
                { label: 'Hypertensive Retinopathy', value: 'hr' }, { label: 'Retinal Detachment', value: 'rd' },
                { label: 'Retinal Vein Occlusion', value: 'rvo' }, { label: 'Retinal Artery Occlusion', value: 'rao' },
                { label: 'Retinitis Pigmentosa', value: 'rp' }, { label: 'Retinoblastoma', value: 'rb' },
              ]},
            ],
          },
          {
            id: 'glaucoma', title: 'Glaucoma Assessment', type: 'assessment', fields: [
              { id: 'iopRight', label: 'IOP - Right (OD) mmHg', type: 'number' },
              { id: 'iopLeft', label: 'IOP - Left (OS) mmHg', type: 'number' },
              { id: 'tonometryMethod', label: 'Tonometry Method', type: 'select', options: [
                { label: 'Goldmann', value: 'goldmann' }, { label: 'Non-contact', value: 'non_contact' },
                { label: 'Tonopen', value: 'tonopen' }, { label: 'iCare', value: 'icare' },
              ]},
              { id: 'gonioscopy', label: 'Gonioscopy', type: 'select', options: [
                { label: 'Open Angle', value: 'open' }, { label: 'Narrow Angle', value: 'narrow' },
                { label: 'Closed Angle', value: 'closed' }, { label: 'Not Done', value: 'not_done' },
              ]},
              { id: 'visualField', label: 'Visual Field', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'Defects Present', value: 'defects' },
                { label: 'Not Done', value: 'not_done' },
              ]},
              { id: 'octOpticNerve', label: 'OCT Optic Nerve', type: 'select', options: [
                { label: 'Normal', value: 'normal' }, { label: 'RNFL Thinning', value: 'rnfl_thinning' },
                { label: 'Not Done', value: 'not_done' },
              ]},
            ],
          },
          {
            id: 'diagnostics', title: 'Diagnostic Tests', type: 'form', fields: [
              { id: 'octMacula', label: 'OCT Macula', type: 'textarea' },
              { id: 'fundusPhoto', label: 'Fundus Photography', type: 'textarea' },
              { id: 'angiography', label: 'Angiography (FFA/ICG)', type: 'textarea' },
              { id: 'topography', label: 'Corneal Topography', type: 'textarea' },
              { id: 'pachymetry', label: 'Pachymetry', type: 'text' },
              { id: 'biometry', label: 'Biometry/IOL Master', type: 'textarea' },
              { id: 'specular', label: 'Specular Microscopy', type: 'textarea' },
              { id: 'schirmer', label: "Schirmer's Test", type: 'text' },
            ],
          },
          {
            id: 'diagnosis-plan', title: 'Diagnosis & Plan', type: 'form', fields: [
              { id: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: true },
              { id: 'icdCode', label: 'ICD-10 Code', type: 'text' },
              { id: 'treatment', label: 'Treatment Plan', type: 'textarea' },
              { id: 'medications', label: 'Eye Medications', type: 'textarea' },
              { id: 'surgery', label: 'Surgery Recommended', type: 'select', options: [
                { label: 'No', value: 'no' }, { label: 'Cataract Surgery', value: 'cataract' },
                { label: 'Glaucoma Surgery', value: 'glaucoma' }, { label: 'Vitrectomy', value: 'vitrectomy' },
                { label: 'Retinal Surgery', value: 'retinal' }, { label: 'Corneal Transplant', value: 'corneal' },
                { label: 'Refractive Surgery', value: 'refractive' }, { label: 'Oculoplasty', value: 'oculoplasty' },
              ]},
              { id: 'followUp', label: 'Follow-up', type: 'text' },
              { id: 'nextExamDue', label: 'Next Exam Due', type: 'text' },
            ],
          },
        ],
        isDefault: true,
      },
    ];
  }

  async saveOphthalmologyEncounter(encounterId: string, patientId: string, providerId: string, data: Record<string, unknown>) {
    const structuredFindings: Array<{
      category: string; findingKey: string; findingValue: Record<string, unknown>;
      severity?: string; status?: string;
    }> = [];

    for (const side of ['Right', 'Left']) {
      const prefix = side === 'Right' ? 'right' : 'left';
      const key = side === 'Right' ? 'od' : 'os';

      if (data[`iop${side}`]) {
        structuredFindings.push({
          category: 'iop',
          findingKey: key,
          findingValue: { iop: data[`iop${side}`], cdRatio: data[`cdRatio${side}`] ?? null },
          severity: Number(data[`iop${side}`]) > 25 ? 'severe' : Number(data[`iop${side}`]) > 21 ? 'moderate' : 'mild',
          status: 'active',
        });
      }

      if (data[`refraction${side}`]) {
        structuredFindings.push({
          category: 'refraction',
          findingKey: key,
          findingValue: { refraction: data[`refraction${side}`], va: data[`va${side}Distance`] ?? null },
          severity: 'mild',
          status: 'active',
        });
      }
    }

    if (data['octMacula']) {
      structuredFindings.push({
        category: 'oct',
        findingKey: 'macula',
        findingValue: { findings: data['octMacula'] as string },
        severity: (data['macula'] as string) !== 'normal' ? 'moderate' : 'mild',
        status: 'active',
      });
    }

    const enrichedFindings = structuredFindings.map(f => ({
      ...f, specialtyCode: 'ophthalmology', encounterId, patientId, providerId,
    }));

    return this.base.saveEncounterWithFindings({
      specialtyCode: 'ophthalmology', encounterId, patientId, providerId,
      templateId: 'ophthalmology-exam', formData: data,
      findings: enrichedFindings,
    });
  }

  async getOphthalmologyHistory(patientId: string) {
    return this.base.getPatientHistory(patientId, 'ophthalmology');
  }
}
