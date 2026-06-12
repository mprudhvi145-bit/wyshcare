/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/app/ai-copilot-sidebar.tsx
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
 * React component: ai-copilot-sidebar
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - utils
 - patient-store
 - lucide-react
 - react
 *
 * Dependencies:
 - utils
 - patient-store
 - lucide-react
 - react
 *
 * Security Notes:
Standard authentication and authorization apply
 *
 * Business Domain:
Frontend
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

'use client';

import { useState, useMemo } from 'react';
import { Brain, Lightbulb, AlertOctagon, TrendingUp, Sparkles, Activity, Pill, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatientStore } from '@/stores/patient-store';

interface CDSAlert {
  type: 'critical' | 'warning' | 'info';
  message: string;
}

const SOAP_TEMPLATES: Record<string, { S: string; O: string; A: string; P: string }> = {
  'general-medicine': {
    S: 'Patient reports improvement but persistent fatigue. BP medication adherence confirmed. Occasional headaches — 2-3/month, responding to Sumatriptan.',
    O: 'BP 142/88, HR 78, Temp 98.4\u00b0F, SpO2 97%. General exam: no acute distress. CVS: S1S2 normal, no murmurs. CNS: grossly intact.',
    A: 'Hypertension Stage 1 \u2014 responding to Losartan. Headache \u2014 migraine without aura, controlled with Sumatriptan PRN.',
    P: 'Continue Losartan 50mg daily. Follow up in 4 weeks. Consider HbA1c and lipid panel. Encourage DASH diet and daily BP log.',
  },
  dental: {
    S: 'Patient reports sharp pain in lower right quadrant when consuming cold beverages. Pain has been present for ~2 weeks. Wakes at night occasionally. No significant bleeding.',
    O: 'Soft tissue: mild gingival inflammation generalized. Tooth #26: deep distal caries. Tooth #18: partially impacted with pericoronitis. Periodontal probing depths within normal limits. BOP 15%.',
    A: 'Dental caries #26 requiring restorative treatment. Impacted #18 with recurrent pericoronitis.',
    P: '1. Restore #26 with composite restoration. 2. Evaluate #18 for extraction. 3. Prescribe Chlorhexidine mouthwash. 4. Schedule follow-up in 2 weeks for extraction consult.',
  },
  ent: {
    S: 'Nasal congestion persistent for 3 weeks, worse at night. Left ear fullness and decreased hearing. No vertigo. Post-nasal drip noted. Snoring reported by spouse.',
    O: 'Nasal mucosa: boggy, inferior turbinates hypertrophied. Tympanic membrane: left retracted with air-fluid level. Rinne: left ear BC>AC. Weber: lateralizes to left. Nasendoscopy: mucosal edema, patent ostia.',
    A: 'Chronic sinusitis with bilateral nasal obstruction. Left SNHL mild-to-moderate. Allergic rhinitis.',
    P: '1. Continue Fluticasone nasal spray and Montelukast. 2. Consider CT sinuses if no improvement in 4 weeks. 3. Audiometry follow-up 3 months. 4. Evaluate for hearing aid if SNHL progresses.',
  },
  dermatology: {
    S: 'Facial rash flares cyclically, worse around menses. Mild itching but no pain. Concerned about hair thinning at crown. Uses clindamycin gel with partial improvement.',
    O: 'Face: inflammatory papules and pustules on chin and cheeks, few closed comedones. Scalp: frontal and crown thinning, positive hair pull test. Wood\u2019s lamp: no fluorescence. Melasma: bilateral malar hyperpigmentation.',
    A: 'Acne vulgaris moderate. Androgenetic alopecia Ludwig I. Melasma.',
    P: '1. Continue Clindamycin gel + BP wash. 2. Add Tretinoin 0.025% cream at bedtime. 3. Minoxidil 5% foam for scalp. 4. Melasma: daily SPF 50+, Hydroquinone 4% for 8 weeks. 5. Follow-up in 8 weeks.',
  },
  ophthalmology: {
    S: 'Gradual blurring of distance vision over several months. Difficulty reading road signs. No flashes or floaters. Glare sensitivity when driving at night.',
    O: 'VA OD: 20/40, OS: 20/25. IOP OD: 22mmHg, OS: 18mmHg. Slit lamp: NS Grade 2 OD, clear OS. Fundus: C/D ratio 0.4 OU, macula normal. Confrontation fields: full OU.',
    A: 'Cataract OD Grade 2 \u2014 nuclear sclerotic. Glaucoma suspect OD.',
    P: '1. IOP borderline \u2014 repeat in 3 months. 2. Cataract extraction OD when vision affects QoL. 3. Continue Latanoprost/Timolol. 4. Visual field test to establish baseline. Review driving safety.',
  },
  cardiology: {
    S: 'Patient reports mild chest tightness on walking up stairs, resolves with rest. No orthopnea or paroxysmal nocturnal dyspnea.',
    O: 'BP 156/94, HR 88, Temp 98.3\u00b0F, SpO2 96%. Heart sounds: S1S2 normal, soft grade II/VI systolic murmur at left sternal border.',
    A: 'Chest pain evaluation: atypical angina. Stage 2 Hypertension.',
    P: '1. Order Stress Echocardiogram. 2. Adjust Metoprolol dose. 3. Continue Atorvastatin 40mg. 4. Return immediately if chest pain worsens.',
  },
  pediatrics: {
    S: 'Mother presents child for routine growth monitoring and scheduled immunizations. No acute complaints. Normal sleep and milestones.',
    O: 'HR 85 bpm, Temp 98.6\u00b0F, SpO2 99%. Height and weight trace along the 50th percentile curves. General exam: alert, active.',
    A: 'Healthy 7-year-old child. Up to date on growth milestones.',
    P: '1. Administer MMR 2nd dose today. 2. Counsel mother on balanced nutrition and screen time limits. 3. Next routine visit at 8 years.',
  },
  orthopedics: {
    S: 'Patient complains of severe, aching bilateral knee pain, worse on the right. Stiff in mornings for 15 minutes. Trouble going down stairs.',
    O: 'BP 130/82, HR 76, Temp 98.5\u00b0F, SpO2 98%. Knees: right knee with mild effusion, crepitus. ROM: right knee flexed to 90 degrees.',
    A: 'Bilateral knee osteoarthritis, Kellgren-Lawrence Grade 3 OD.',
    P: '1. Refer for physiotherapy. 2. Prescribe topical NSAID gel. 3. Discuss future intra-articular steroid injection if pain persists.',
  },
  gynecology: {
    S: 'Patient presents for initial prenatal visit. LMP indicates 14 weeks gestation. Reports mild morning sickness and fatigue, resolving now.',
    O: 'BP 116/70, HR 74, Temp 98.2\u00b0F, SpO2 99%. Abdomen: soft, nontender, fundus palpable just above pubic symphysis.',
    A: 'Intrauterine pregnancy at 14 weeks gestation. Good maternal progress.',
    P: '1. Continue prenatal vitamins and folic acid. 2. Order routine first-trimester labs. 3. Schedule next prenatal checkup in 4 weeks.',
  },
  neurology: {
    S: 'Patient complains of resting tremors in right hand, slower gait, and difficulty buttoning shirts. Family reports mild memory lapses.',
    O: 'BP 132/84, HR 68, Temp 98.4\u00b0F, SpO2 97%. GCS: 15/15. Motor: resting pill-rolling tremor in right hand. Rigidity: cogwheel rigidity present. Gait: shuffling.',
    A: 'Parkinsonian tremors. Mild Cognitive Impairment.',
    P: '1. Adjust Carbidopa-Levodopa dosing. 2. Continue Donepezil 5mg daily. 3. Refer to physical therapy. 4. Order brain MRI.',
  },
  psychiatry: {
    S: 'Patient reports persistent depressed mood, lack of energy, and increased anxiety for the past month. Hopeless but denies active intent.',
    O: 'BP 112/72, HR 82, Temp 98.6\u00b0F, SpO2 99%. MSE: neat, cooperative, slow speech, dysphoric mood. PHQ-9: 14 (Mod), GAD-7: 12 (Mod).',
    A: 'Major Depressive Disorder (moderate). Generalized Anxiety Disorder.',
    P: '1. Increase Sertraline to 100mg daily. 2. Continue Clonazepam 0.25mg PRN. 3. Refer for CBT. 4. Establish safety plan.',
  },
  pulmonology: {
    S: 'Patient reports worsening chronic cough with sputum production. Shortness of breath when walking 100 meters.',
    O: 'BP 138/88, HR 86, Temp 99.0\u00b0F, SpO2 93% on room air. Chest: decreased breath sounds, expiratory wheeze bilaterally.',
    A: 'COPD GOLD Stage II (Moderate) exacerbation risk.',
    P: '1. Continue Tiotropium inhaler. 2. Optimize Fluticasone/Salmeterol. 3. Check technique for inhaler use. 4. Sputum culture.',
  },
  gastroenterology: {
    S: 'Patient reports burning epigastric pain after meals, frequent acid regurgitation, and alternating bowel habits with loose stools.',
    O: 'BP 124/80, HR 76, Temp 98.4\u00b0F, SpO2 98%. Abdomen: soft, mild epigastric tenderness, no rebound or guarding.',
    A: 'Gastroesophageal Reflux Disease (GERD). Irritable Bowel Syndrome with Diarrhea (IBS-D).',
    P: '1. Continue Omeprazole 20mg before breakfast. 2. Take Dicyclomine PRN. 3. Counsel on low FODMAP diet and avoiding late meals.',
  },
  urology: {
    S: 'Patient reports hesitancy, weak stream, incomplete emptying, and waking up 2-3 times at night to urinate.',
    O: 'BP 140/86, HR 72, Temp 98.1\u00b0F, SpO2 98%. Suprapubic: nontender. DRE: prostate enlarged (~40g), firm, symmetrical. PVR: 65 ml.',
    A: 'Benign Prostatic Hyperplasia (BPH) with moderate LUTS.',
    P: '1. Continue Tamsulosin 0.4mg. 2. Continue Finasteride 5mg daily. 3. Limit fluids before bedtime. 4. Repeat PSA/PVR in 6 months.',
  },
  endocrinology: {
    S: 'Patient reports fluctuating home glucose readings, averaging 180 mg/dL. Reports fatigue and dry skin. Normal adherence to insulin.',
    O: 'BP 130/82, HR 74, Temp 98.5\u00b0F, SpO2 98%. Thyroid: normal palpation. Foot exam: normal sensation, positive pulses. HbA1c: 7.8%.',
    A: 'Type 2 Diabetes Mellitus (uncontrolled). Primary Hypothyroidism, stable.',
    P: '1. Adjust metformin/empagliflozin. 2. Adjust basal insulin dose. 3. Continue Levothyroxine. 4. Refer for diabetic eye exam.',
  },
};

export function AICopilotSidebar() {
  const { activePatient, specialtyCode } = usePatientStore();
  const [tab, setTab] = useState<'insights' | 'scribe'>('insights');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [soapGenerated, setSoapGenerated] = useState(false);
  const [customCdsOpen, setCustomCdsOpen] = useState(false);

  const code = specialtyCode ?? 'general-medicine';

  const cdsAlerts = useMemo(() => {
    const alerts: CDSAlert[] = [];
    if (!activePatient) return alerts;

    const [sysStr, diaStr] = activePatient.vitals.bp.split('/');
    const sys = parseInt(sysStr ?? '120');
    const dia = parseInt(diaStr ?? '80');

    if (sys >= 160 || dia >= 100) alerts.push({ type: 'critical', message: 'Hypertensive crisis: BP ' + activePatient.vitals.bp + ' \u2014 immediate intervention needed' });
    else if (sys >= 140 || dia >= 90) alerts.push({ type: 'warning', message: 'Elevated BP ' + activePatient.vitals.bp + ' \u2014 review antihypertensive therapy' });

    if (activePatient.vitals.hr > 100) alerts.push({ type: 'warning', message: 'Tachycardia: HR ' + activePatient.vitals.hr + ' bpm \u2014 assess for causes' });
    else if (activePatient.vitals.hr < 55) alerts.push({ type: 'warning', message: 'Bradycardia: HR ' + activePatient.vitals.hr + ' bpm \u2014 review beta-blocker / calcium channel blocker' });

    if (activePatient.vitals.temp >= 100.4) alerts.push({ type: 'critical', message: 'Fever ' + activePatient.vitals.temp + '\u00b0F \u2014 consider infectious workup' });

    if (activePatient.vitals.spo2 <= 92) alerts.push({ type: 'critical', message: 'Hypoxia: SpO2 ' + activePatient.vitals.spo2 + '% \u2014 initiate O2 and assess' });
    else if (activePatient.vitals.spo2 <= 94) alerts.push({ type: 'warning', message: 'Borderline SpO2: ' + activePatient.vitals.spo2 + '% \u2014 check respiratory status' });

    activePatient.allergies.forEach(allergy => {
      const matchingMeds = activePatient.medications.filter(m =>
        m.toLowerCase().includes(allergy.toLowerCase().replace('r', '').slice(0, 4))
      );
      if (matchingMeds.length > 0) {
        alerts.push({ type: 'critical', message: 'Drug-allergy conflict: ' + matchingMeds[0] + ' with ' + allergy + ' allergy on record' });
      }
    });

    if (specialtyCode === 'dental' && activePatient.medications.some(m => m.toLowerCase().includes('warfarin') || m.toLowerCase().includes('apixaban'))) {
      alerts.push({ type: 'warning', message: 'Anticoagulant detected \u2014 check INR before any surgical procedure' });
    }
    if (specialtyCode === 'ophthalmology' && activePatient.medications.some(m => m.toLowerCase().includes('metformin'))) {
      alerts.push({ type: 'info', message: 'Metformin use \u2014 risk of empty capillary syndrome during vitrectomy' });
    }
    if (specialtyCode === 'dermatology' && activePatient.allergies.some(a => a.toLowerCase().includes('doxycycline'))) {
      alerts.push({ type: 'warning', message: 'Doxycycline allergy on record \u2014 avoid tetracycline-class antibiotics' });
    }
    if (specialtyCode === 'ent' && activePatient.vitals.temp >= 100.4) {
      alerts.push({ type: 'info', message: 'Febrile with sinus symptoms \u2014 consider bacterial sinusitis vs viral etiology' });
    }
    if (specialtyCode === 'cardiology' && sys >= 150) {
      alerts.push({ type: 'warning', message: 'Cardiology alert: High systolic BP (' + activePatient.vitals.bp + ') \u2014 optimize antihypertensive therapy' });
    }
    if (specialtyCode === 'pulmonology' && activePatient.vitals.spo2 <= 93) {
      alerts.push({ type: 'critical', message: 'Pulmonology alert: Hypoxia detected (' + activePatient.vitals.spo2 + '%) \u2014 evaluate for supplemental oxygen' });
    }
    if (specialtyCode === 'endocrinology' && activePatient.vitals.temp >= 100.4 && activePatient.medications.some(m => m.toLowerCase().includes('metformin'))) {
      alerts.push({ type: 'warning', message: 'Metformin patient with fever \u2014 monitor for lactic acidosis risk' });
    }
    if (specialtyCode === 'gynecology' && sys >= 140 && activePatient.condition.toLowerCase().includes('prenatal')) {
      alerts.push({ type: 'critical', message: 'Gestational Hypertension: BP ' + activePatient.vitals.bp + ' in pregnancy \u2014 evaluate for preeclampsia' });
    }
    if (specialtyCode === 'psychiatry' && activePatient.medications.some(m => m.toLowerCase().includes('sertraline')) && activePatient.medications.some(m => m.toLowerCase().includes('tramadol'))) {
      alerts.push({ type: 'critical', message: 'Serotonin Syndrome Risk: Sertraline + Tramadol co-prescription' });
    }

    if (activePatient.medications.length >= 3) {
      alerts.push({ type: 'warning', message: 'Polypharmacy (' + activePatient.medications.length + ' active Rx) \u2014 review for potential drug interactions' });
    }

    return alerts;
  }, [activePatient, specialtyCode]);

  const insights = useMemo(() => {
    if (!activePatient) return { riskScores: [], suggestions: [] as string[], drugInteractions: [] as string[] };

    const riskScores: { label: string; value: string; color: string }[] = [];
    const suggestions: string[] = [];
    const drugInteractions: string[] = [];

    const [sysStr] = activePatient.vitals.bp.split('/');
    const sys = parseInt(sysStr ?? '120');

    switch (specialtyCode) {
      case 'general-medicine': {
        riskScores.push({ label: 'Readmission Risk', value: activePatient.risk === 'high' ? '28%' : activePatient.risk === 'medium' ? '14%' : '6%', color: activePatient.risk === 'high' ? '#FF5A5A' : activePatient.risk === 'medium' ? '#FFD84D' : '#2EE59D' });
        riskScores.push({ label: 'Treatment Response', value: sys > 140 ? '62%' : '87%', color: sys > 140 ? '#FFD84D' : '#2EE59D' });
        riskScores.push({ label: 'CV Risk (10yr)', value: activePatient.age > 50 ? '18%' : '8%', color: activePatient.age > 50 ? '#FFD84D' : '#2EE59D' });
        suggestions.push('Consider HbA1c and lipid panel based on age and BP');
        suggestions.push('Review medication adherence \u2014 ' + activePatient.medications.length + ' active prescriptions');
        if (activePatient.condition.toLowerCase().includes('migraine')) {
          suggestions.push('Migraine diary recommended \u2014 track triggers and frequency');
        }
        suggestions.push('Schedule annual wellness exam with preventive screenings');
        break;
      }
      case 'dental': {
        riskScores.push({ label: 'Caries Risk', value: activePatient.condition.includes('Caries') ? 'High' : 'Moderate', color: activePatient.condition.includes('Caries') ? '#FF5A5A' : '#FFD84D' });
        riskScores.push({ label: 'Perio Score', value: activePatient.condition.includes('Gingivitis') ? 'Grade B' : 'Grade A', color: activePatient.condition.includes('Gingivitis') ? '#FFD84D' : '#2EE59D' });
        riskScores.push({ label: 'TMJ Health', value: 'Normal', color: '#2EE59D' });
        suggestions.push('Caries detected \u2014 consider composite restoration or crown');
        if (activePatient.condition.includes('Impacted')) {
          suggestions.push('Impacted tooth evaluation \u2014 consider extraction vs watchful waiting');
          suggestions.push('Assess pericoronitis risk for partially erupted third molar');
        }
        suggestions.push('Recall interval: 6 months with bitewings');
        if (activePatient.allergies.some(a => a.toLowerCase().includes('penicillin'))) {
          drugInteractions.push('Penicillin allergy \u2014 use Clindamycin or Azithromycin for prophylaxis');
        }
        break;
      }
      case 'ent': {
        riskScores.push({ label: 'Sinusitis Score', value: activePatient.condition.includes('Chronic') ? '84%' : '45%', color: activePatient.condition.includes('Chronic') ? '#FF5A5A' : '#FFD84D' });
        riskScores.push({ label: 'Hearing Loss', value: activePatient.condition.includes('SNHL') ? 'Moderate' : 'Normal', color: activePatient.condition.includes('SNHL') ? '#FFD84D' : '#2EE59D' });
        riskScores.push({ label: 'Allergy Severity', value: activePatient.condition.includes('Allergic') ? 'Moderate' : 'Mild', color: activePatient.condition.includes('Allergic') ? '#FFD84D' : '#2EE59D' });
        suggestions.push('Complete audiological evaluation \u2014 bone conduction thresholds');
        if (activePatient.condition.includes('Sinusitis')) {
          suggestions.push('CT sinuses without contrast if no improvement in 4 weeks');
        }
        if (activePatient.allergies.some(a => a.toLowerCase().includes('aspirin'))) {
          drugInteractions.push('Aspirin sensitivity \u2014 avoid NSAIDs in nasal polyp patients');
        }
        suggestions.push('Allergy skin testing or specific IgE for environmental allergens');
        break;
      }
      case 'dermatology': {
        riskScores.push({ label: 'Melanoma Risk', value: 'Low', color: '#2EE59D' });
        riskScores.push({ label: 'Alopecia Progression', value: activePatient.condition.includes('Ludwig') ? 'Active' : 'Stable', color: activePatient.condition.includes('Ludwig') ? '#FFD84D' : '#8FD3D1' });
        riskScores.push({ label: 'Acne Severity', value: activePatient.condition.includes('Acne') ? 'Moderate' : 'Mild', color: activePatient.condition.includes('Acne') ? '#FFD84D' : '#2EE59D' });
        suggestions.push('Full body skin exam recommended annually');
        if (activePatient.condition.includes('Melasma')) {
          suggestions.push('Melasma: strict photoprotection + hydroquinone 4% or azelaic acid');
        }
        if (activePatient.allergies.some(a => a.toLowerCase().includes('doxycycline'))) {
          drugInteractions.push('Doxycycline allergy \u2014 avoid tetracyclines; consider macrolides for acne');
        }
        suggestions.push('Biopsy any changing or irregular pigmented lesion');
        break;
      }
      case 'ophthalmology': {
        riskScores.push({ label: 'Glaucoma Risk', value: activePatient.condition.includes('Glaucoma') ? 'Moderate' : 'Low', color: activePatient.condition.includes('Glaucoma') ? '#FF5A5A' : '#2EE59D' });
        riskScores.push({ label: 'Cataract Grade', value: activePatient.condition.includes('Grade 2') ? 'Grade 2 (Moderate)' : 'Grade 1 (Mild)', color: activePatient.condition.includes('Grade 2') ? '#FFD84D' : '#8FD3D1' });
        riskScores.push({ label: 'Macular Health', value: 'Normal', color: '#2EE59D' });
        suggestions.push('Monitor IOP closely \u2014 consider pachymetry for corrected IOP');
        if (activePatient.condition.includes('Cataract')) {
          suggestions.push('Evaluate for cataract extraction when VA < 20/40 or QoL affected');
        }
        if (activePatient.medications.some(m => m.toLowerCase().includes('latanoprost'))) {
          drugInteractions.push('Latanoprost + Timolol \u2014 good dual therapy; watch for bradycardia');
        }
        suggestions.push('Dilated fundus exam annually with optic nerve photography');
        break;
      }
      case 'cardiology': {
        riskScores.push({ label: 'ASCVD 10yr Risk', value: activePatient.age > 50 ? '16.4%' : '4.2%', color: activePatient.age > 50 ? '#FF5A5A' : '#2EE59D' });
        riskScores.push({ label: 'Heart Failure Risk', value: 'Low', color: '#2EE59D' });
        riskScores.push({ label: 'Arrythmia Risk', value: activePatient.condition.toLowerCase().includes('chest pain') ? 'Moderate' : 'Low', color: activePatient.condition.toLowerCase().includes('chest pain') ? '#FFD84D' : '#2EE59D' });
        suggestions.push('Order stress test or coronary calcium scan for chest pain evaluation');
        suggestions.push('Review patient daily BP log; target < 130/80 mmHg');
        if (activePatient.medications.some(m => m.toLowerCase().includes('metoprolol'))) {
          suggestions.push('Titrate beta blocker dosage based on resting HR target of 55-65 bpm');
        }
        break;
      }
      case 'pediatrics': {
        riskScores.push({ label: 'Growth Percentile', value: '50th', color: '#2EE59D' });
        riskScores.push({ label: 'Developmental Status', value: 'Normal', color: '#2EE59D' });
        riskScores.push({ label: 'Vaccination Gap', value: activePatient.condition.includes('MMR') ? '1 Dose Due' : 'None', color: activePatient.condition.includes('MMR') ? '#FFD84D' : '#2EE59D' });
        suggestions.push('Administer MMR vaccine 2nd dose today');
        suggestions.push('Provide age-appropriate developmental screening questionnaire');
        suggestions.push('Counsel on pediatric nutrition and cognitive development');
        break;
      }
      case 'orthopedics': {
        riskScores.push({ label: 'OA Grade', value: 'Grade 3', color: '#FFD84D' });
        riskScores.push({ label: 'Osteoporosis Risk', value: activePatient.condition.includes('Osteoporosis') ? 'High' : 'Low', color: activePatient.condition.includes('Osteoporosis') ? '#FF5A5A' : '#2EE59D' });
        riskScores.push({ label: 'Surgical Indicator', value: 'Moderate', color: '#FFD84D' });
        suggestions.push('Recommend low-impact joint loading exercises and weight management');
        suggestions.push('Consider DEXA scan for osteoporosis monitoring');
        if (activePatient.allergies.some(a => a.toLowerCase().includes('nsaid'))) {
          drugInteractions.push('NSAID allergy on record \u2014 avoid oral NSAIDs; use Acetaminophen or topical treatments');
        }
        break;
      }
      case 'gynecology': {
        riskScores.push({ label: 'Preeclampsia Risk', value: 'Low', color: '#2EE59D' });
        riskScores.push({ label: 'Preterm Birth Risk', value: 'Low', color: '#2EE59D' });
        riskScores.push({ label: 'Gestational Diabetes', value: 'Pending Screen', color: '#8FD3D1' });
        suggestions.push('Order routine prenatal screen and Gestational Diabetes Screen at 24-28 weeks');
        suggestions.push('Review nutritional guidelines and prenatal iron/folate supplementation');
        break;
      }
      case 'neurology': {
        riskScores.push({ label: 'Fall Risk', value: activePatient.condition.toLowerCase().includes('parkinson') ? 'High' : 'Low', color: activePatient.condition.toLowerCase().includes('parkinson') ? '#FF5A5A' : '#2EE59D' });
        riskScores.push({ label: 'Cognitive Decline', value: 'Mild', color: '#FFD84D' });
        riskScores.push({ label: 'Stroke Risk', value: 'Low', color: '#2EE59D' });
        suggestions.push('Refer to physical therapy for specialized balance and gait rehabilitation');
        suggestions.push('Check orthostatic blood pressure readings');
        break;
      }
      case 'psychiatry': {
        riskScores.push({ label: 'Suicide Risk', value: 'Low', color: '#2EE59D' });
        riskScores.push({ label: 'Depression Severity', value: 'Moderate', color: '#FFD84D' });
        riskScores.push({ label: 'Anxiety Severity', value: 'Moderate', color: '#FFD84D' });
        suggestions.push('Enroll patient in structured Cognitive Behavioral Therapy (CBT)');
        suggestions.push('Optimize Sertraline dosing; monitor for side effects like sleep disturbance');
        suggestions.push('Establish safety plan and provide crisis hotline details');
        break;
      }
      case 'pulmonology': {
        riskScores.push({ label: 'COPD Exacerbation', value: 'Moderate', color: '#FFD84D' });
        riskScores.push({ label: 'PFT Impairment', value: 'Moderate Obstructive', color: '#FFD84D' });
        riskScores.push({ label: 'Hypoxia Risk', value: activePatient.vitals.spo2 < 94 ? 'High' : 'Low', color: activePatient.vitals.spo2 < 94 ? '#FF5A5A' : '#2EE59D' });
        suggestions.push('Perform inhaler technique check at every clinical visit');
        suggestions.push('Order chest x-ray to rule out acute infectious consolidation');
        suggestions.push('Refer for pulmonary rehabilitation program');
        break;
      }
      case 'gastroenterology': {
        riskScores.push({ label: 'Esophagitis Risk', value: 'Moderate', color: '#FFD84D' });
        riskScores.push({ label: 'GI Bleed Risk', value: 'Low', color: '#2EE59D' });
        riskScores.push({ label: 'IBS Severity', value: 'Mild-Moderate', color: '#8FD3D1' });
        suggestions.push('Counsel on lifestyle modifications: avoid eating within 3 hours of sleeping');
        suggestions.push('Trial low FODMAP diet; monitor stool frequency and Bristol Type');
        break;
      }
      case 'urology': {
        riskScores.push({ label: 'BPH Progression', value: 'Moderate', color: '#FFD84D' });
        riskScores.push({ label: 'Urinary Retention', value: 'Low', color: '#2EE59D' });
        riskScores.push({ label: 'Prostate Malignancy', value: 'Low', color: '#2EE59D' });
        suggestions.push('Check PSA level annually; monitor for rising trends');
        suggestions.push('Avoid bladder irritants like caffeine and alcohol in evenings');
        suggestions.push('Monitor post-void residual volume (PVR); report if > 100 ml');
        break;
      }
      case 'endocrinology': {
        riskScores.push({ label: 'TIR Glycemia', value: 'Poor (38%)', color: '#FF5A5A' });
        riskScores.push({ label: 'Nephropathy Risk', value: 'Low', color: '#2EE59D' });
        riskScores.push({ label: 'Thyroid Control', value: 'Optimal', color: '#2EE59D' });
        suggestions.push('Titrate basal insulin dosage to target fasting glucose < 130 mg/dL');
        suggestions.push('Order diabetic foot exam and screening for diabetic retinopathy');
        suggestions.push('Check microalbumin-to-creatinine ratio annually');
        break;
      }
      default: {
        riskScores.push({ label: 'Readmission Risk', value: activePatient.risk === 'high' ? '28%' : '14%', color: activePatient.risk === 'high' ? '#FF5A5A' : '#FFD84D' });
        suggestions.push('Continue routine monitoring as per standard guidelines');
      }
    }

    return { riskScores, suggestions, drugInteractions };
  }, [activePatient, specialtyCode]);

  const MOCK_TRANSCRIPTS: Record<string, string[]> = {
    'general-medicine': [
      'Doctor: How have you been feeling since your last visit?',
      'Patient: The headaches are better but I still feel tired.',
      'Doctor: Are you taking your BP medication regularly?',
      'Patient: Yes, every morning. My readings have been lower.',
    ],
    dental: [
      'Doctor: When did you first notice the tooth pain?',
      'Patient: About 2 weeks ago. It hurts when I drink cold water.',
      'Doctor: Does it wake you up at night?',
      'Patient: Sometimes, yes. The pain is sharp.',
    ],
    ent: [
      'Doctor: How long have you had the congestion?',
      'Patient: About 3 weeks now. It\'s not getting better.',
      'Doctor: Any hearing loss or ringing in your ears?',
      'Patient: The left ear feels clogged.',
    ],
    dermatology: [
      'Doctor: How long have you had this rash on your face?',
      'Patient: It comes and goes, mostly around my period.',
      'Doctor: Any new products or stress recently?',
      'Patient: I started a new face wash last month.',
    ],
    ophthalmology: [
      'Doctor: When did you notice the blurry vision?',
      'Patient: Reading has become difficult over the past few months.',
      'Doctor: Any flashes or floaters?',
      'Patient: No, just the blurriness.',
    ],
    cardiology: [
      'Doctor: How long does the chest tightness last when walking?',
      'Patient: Usually about 5 minutes, then it goes away if I sit down.',
      'Doctor: Any swelling in your legs or shortness of breath at night?',
      'Patient: No swelling. I sleep on one pillow fine.',
    ],
    pediatrics: [
      'Doctor: Has Kavita had any fever or cough since last time?',
      'Mother: No, she has been completely fine and active.',
      'Doctor: Is she eating well?',
      'Mother: Yes, she loves fruits and plays outside every day.',
    ],
    orthopedics: [
      'Doctor: Which knee is hurting more?',
      'Patient: Definitely the right one. It clicks a lot when I stand up.',
      'Doctor: How long does the stiffness last in the morning?',
      'Patient: About 15 minutes, then it loosens up.',
    ],
    gynecology: [
      'Doctor: How is the morning sickness holding up?',
      'Patient: It is mostly gone now that I am in my second trimester.',
      'Doctor: Are you taking the prenatal iron supplements?',
      'Patient: Yes, every day with orange juice.',
    ],
    neurology: [
      'Doctor: Let\'s look at your hands. Do you notice the tremor at rest?',
      'Patient: Yes, especially when I am just sitting watching TV.',
      'Doctor: Have you had any falls recently?',
      'Patient: No falls, but my walking feels a bit stiff.',
    ],
    psychiatry: [
      'Doctor: How has your energy level been this past week?',
      'Patient: Very low. I find it hard to get out of bed.',
      'Doctor: Any thoughts of hurting yourself or others?',
      'Patient: No, I don\'t have those thoughts. Just very sad.',
    ],
    pulmonology: [
      'Doctor: How far can you walk before you feel short of breath?',
      'Patient: Maybe 100 meters, then I have to stop.',
      'Doctor: Are you coughing up any phlegm?',
      'Patient: Yes, yellow phlegm in the morning.',
    ],
    gastroenterology: [
      'Doctor: When does the heartburn feel worst?',
      'Patient: Right after dinner, especially if I lie down early.',
      'Doctor: How often do you have diarrhea?',
      'Patient: About 3-4 times a week, usually with cramps.',
    ],
    urology: [
      'Doctor: How many times do you wake up at night to urinate?',
      'Patient: Usually 2 to 3 times, and the stream feels very weak.',
      'Doctor: Any burning pain or blood in your urine?',
      'Patient: No, none of that.',
    ],
    endocrinology: [
      'Doctor: What have your home fingerstick readings been?',
      'Patient: Mostly between 160 and 200, fasting is around 140.',
      'Doctor: Any numbness or tingling in your toes?',
      'Patient: No, my feet feel normal.',
    ],
  };

  const soapTemplate = SOAP_TEMPLATES[code] ?? SOAP_TEMPLATES['general-medicine']!;

  const handleRecord = () => {
    if (isRecording) return;
    setIsRecording(true);
    setTranscript([]);
    setSoapGenerated(false);
    const lines = MOCK_TRANSCRIPTS[code] ?? MOCK_TRANSCRIPTS['general-medicine']!;
    if (!lines) return;
    lines.forEach((line, i) => {
      setTimeout(() => setTranscript(prev => [...prev, line]), (i + 1) * 1000);
    });
    setTimeout(() => setIsRecording(false), lines.length * 1000 + 500);
  };

  const handleGenerateSoap = () => {
    setSoapGenerated(true);
  };

  if (!activePatient) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Brain className="h-8 w-8 text-white/20 mb-3" />
        <p className="text-sm text-white/30 font-ui">Select a patient to activate AI Copilot</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <Brain className="h-4 w-4 text-[#8FD3D1]" />
        <span className="text-sm font-semibold text-white font-display">AI Copilot</span>
        {cdsAlerts.filter(a => a.type === 'critical').length > 0 && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-[#FF5A5A]/15 px-2 py-0.5 text-[9px] font-semibold text-[#FF5A5A] font-ui">
            <AlertTriangle className="h-2.5 w-2.5" />
            {cdsAlerts.filter(a => a.type === 'critical').length} critical
          </span>
        )}
        <Sparkles className="h-3 w-3 text-[#FFD84D]" />
      </div>

      <div className="flex items-center gap-0.5 mx-3 mt-2 bg-white/[0.02] rounded-[10px] p-0.5">
        <button
          onClick={() => setTab('insights')}
          className={cn(
            'flex-1 rounded-[8px] px-2.5 py-1.5 text-[10px] font-medium font-ui transition-all text-center',
            tab === 'insights' ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : 'text-white/40 hover:text-white/60',
          )}
        >
          <TrendingUp className="h-3 w-3 inline mr-1 -mt-0.5" />
          Insights
        </button>
        <button
          onClick={() => setTab('scribe')}
          className={cn(
            'flex-1 rounded-[8px] px-2.5 py-1.5 text-[10px] font-medium font-ui transition-all text-center',
            tab === 'scribe' ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : 'text-white/40 hover:text-white/60',
          )}
        >
          <Lightbulb className="h-3 w-3 inline mr-1 -mt-0.5" />
          AI Scribe
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tab === 'insights' && (
          <>
            {/* CDS Alerts */}
            {cdsAlerts.length > 0 && (
              <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
                <button onClick={() => setCustomCdsOpen(!customCdsOpen)} className="w-full flex items-center gap-2 text-[11px] font-semibold text-white/50 font-ui mb-2">
                  <Activity className="h-3.5 w-3.5" />
                  CDS Alerts
                  <span className="ml-auto text-[9px] text-white/30 font-ui">{cdsAlerts.length}</span>
                </button>
                {customCdsOpen && (
                  <div className="space-y-2">
                    {cdsAlerts.map((alert, i) => (
                      <div key={i} className={cn(
                        'rounded-[10px] px-2.5 py-2 text-[10px] font-ui leading-relaxed border',
                        alert.type === 'critical' ? 'bg-[#FF5A5A]/8 border-[#FF5A5A]/15 text-[#FF5A5A]' : '',
                        alert.type === 'warning' ? 'bg-[#FFD84D]/8 border-[#FFD84D]/15 text-[#FFD84D]' : '',
                        alert.type === 'info' ? 'bg-[#8FD3D1]/8 border-[#8FD3D1]/15 text-[#8FD3D1]' : '',
                      )}>
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className={cn('h-3 w-3 shrink-0 mt-0.5', alert.type === 'critical' ? 'text-[#FF5A5A]' : alert.type === 'warning' ? 'text-[#FFD84D]' : 'text-[#8FD3D1]')} />
                          {alert.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!customCdsOpen && (
                  <div className="flex flex-wrap gap-1">
                    {cdsAlerts.slice(0, 2).map((alert, i) => (
                      <span key={i} className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-[8px] font-semibold font-ui',
                        alert.type === 'critical' ? 'bg-[#FF5A5A]/10 text-[#FF5A5A]' : '',
                        alert.type === 'warning' ? 'bg-[#FFD84D]/10 text-[#FFD84D]' : '',
                        alert.type === 'info' ? 'bg-[#8FD3D1]/10 text-[#8FD3D1]' : '',
                      )}>{alert.type === 'critical' ? 'CRITICAL' : alert.type === 'warning' ? 'WARNING' : 'INFO'}</span>
                    ))}
                    {cdsAlerts.length > 2 && <span className="text-[8px] text-white/30 font-ui">+{cdsAlerts.length - 2} more</span>}
                  </div>
                )}
              </div>
            )}

            {/* Risk Scores */}
            <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <h4 className="text-[11px] font-semibold text-white/50 font-ui mb-2">Clinical Insights</h4>
              <p className="text-[10px] text-white/30 font-ui mb-3">
                {code === 'general-medicine' ? 'Risk & response analysis' :
                 code === 'dental' ? 'Oral health risk assessment' :
                 code === 'ent' ? 'ENT risk analysis' :
                 code === 'dermatology' ? 'Dermatological risk assessment' :
                 code === 'ophthalmology' ? 'Ophthalmic risk analysis' : 'Clinical risk scores'}
              </p>
              <div className="space-y-2">
                {insights.riskScores.map((insight, i) => (
                  <div key={i} className="flex items-center justify-between rounded-[10px] bg-white/[0.02] px-2.5 py-2">
                    <span className="text-[10px] text-white/50 font-ui">{insight.label}</span>
                    <span className="text-[11px] font-semibold font-ui" style={{ color: insight.color }}>{insight.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <h4 className="text-[11px] font-semibold text-white/50 font-ui mb-2">Suggestions</h4>
              <div className="space-y-2">
                {insights.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] text-white/60 font-ui leading-relaxed">
                    <Lightbulb className="h-3 w-3 text-[#FFD84D] shrink-0 mt-0.5" />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Drug Interactions */}
            <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3">
              <h4 className="text-[11px] font-semibold text-white/50 font-ui mb-2">Drug Interactions</h4>
              {insights.drugInteractions.length > 0 ? (
                <div className="space-y-2">
                  {insights.drugInteractions.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] text-[#FFD84D] font-ui leading-relaxed">
                      <Pill className="h-3 w-3 text-[#FFD84D] shrink-0 mt-0.5" />
                      {d}
                    </div>
                  ))}
                  {activePatient && activePatient.medications.length > 0 && (
                    <div className="mt-2 rounded-[8px] bg-white/[0.02] px-2.5 py-1.5">
                      <span className="text-[9px] text-white/40 font-ui">Active Rx: {activePatient.medications.join(', ')}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[10px] text-[#2EE59D] font-ui">
                  <AlertOctagon className="h-3 w-3" />
                  No interactions detected
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'scribe' && (
          <div className="space-y-3">
            <button
              onClick={handleRecord}
              disabled={isRecording}
              className={cn(
                'w-full flex items-center justify-center gap-2 rounded-[14px] py-3 text-xs font-semibold font-ui transition-all border',
                isRecording
                  ? 'bg-[#FF5A5A]/15 text-[#FF5A5A] border-[#FF5A5A]/25 animate-pulse'
                  : 'bg-[#8FD3D1]/10 text-[#8FD3D1] border-[#8FD3D1]/20 hover:bg-[#8FD3D1]/20',
              )}
            >
              <span className={cn('h-3 w-3 rounded-full', isRecording ? 'bg-[#FF5A5A]' : 'bg-[#8FD3D1]')} />
              {isRecording ? 'Recording...' : 'Start Recording'}
            </button>

            {transcript.length > 0 && (
              <div className="rounded-[14px] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] p-3 space-y-2">
                <h4 className="text-[10px] font-semibold text-white/40 font-ui tracking-wider uppercase">Transcript</h4>
                {transcript.map((line, i) => (
                  <p key={i} className={cn(
                    'text-[10px] font-ui leading-relaxed',
                    line.startsWith('Doctor:') ? 'text-[#8FD3D1]' : 'text-white/60',
                  )}>{line}</p>
                ))}
              </div>
            )}

            {transcript.length > 0 && !soapGenerated && (
              <button
                onClick={handleGenerateSoap}
                className="w-full rounded-[14px] bg-gradient-to-r from-[#8FD3D1] to-[#2EE59D] text-[#0B0D10] py-3 text-xs font-bold font-ui hover:opacity-90 transition-all"
              >
                Generate {
                  {
                    'general-medicine': 'SOAP Note',
                    dental: 'Dental Note',
                    ent: 'ENT Note',
                    dermatology: 'Dermatology Note',
                    ophthalmology: 'Ophthalmology Note',
                    cardiology: 'Cardiology Note',
                    pediatrics: 'Pediatric Note',
                    orthopedics: 'Orthopedic Note',
                    gynecology: 'Gynecological Note',
                    neurology: 'Neurological Note',
                    psychiatry: 'Psychiatric Note',
                    pulmonology: 'Pulmonological Note',
                    gastroenterology: 'Gastroenterology Note',
                    urology: 'Urological Note',
                    endocrinology: 'Endocrine Note',
                  }[code] ?? 'SOAP Note'
                }
              </button>
            )}

            {soapGenerated && (
              <div className="rounded-[14px] bg-[#2EE59D]/8 border border-[#2EE59D]/15 p-3">
                <h4 className="text-[10px] font-semibold text-[#2EE59D] font-ui mb-2">
                  {'\u2713'} {
                    {
                      'general-medicine': 'SOAP Note',
                      dental: 'Dental Note',
                      ent: 'ENT Note',
                      dermatology: 'Dermatology Note',
                      ophthalmology: 'Ophthalmology Note',
                      cardiology: 'Cardiology Note',
                      pediatrics: 'Pediatric Note',
                      orthopedics: 'Orthopedic Note',
                      gynecology: 'Gynecological Note',
                      neurology: 'Neurological Note',
                      psychiatry: 'Psychiatric Note',
                      pulmonology: 'Pulmonological Note',
                      gastroenterology: 'Gastroenterology Note',
                      urology: 'Urological Note',
                      endocrinology: 'Endocrine Note',
                    }[code] ?? 'SOAP Note'
                  } Generated
                </h4>
                <div className="space-y-1.5 text-[10px] text-white/60 font-ui">
                  <p><span className="text-white/40">S:</span> {soapTemplate.S}</p>
                  <p><span className="text-white/40">O:</span> {soapTemplate.O}</p>
                  <p><span className="text-white/40">A:</span> {soapTemplate.A}</p>
                  <p><span className="text-white/40">P:</span> {soapTemplate.P}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
