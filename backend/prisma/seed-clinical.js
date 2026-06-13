/**
 * ============================================================================
 * WYSHCARE PLATFORM — Clinical Seed Data Generator
 * ============================================================================
 *
 * Generates 500 patients with full clinical data across all 18 specialties.
 * Each specialty gets ~27-28 patients with encounters, conditions, vitals,
 * allergies, structured findings, and appointments.
 *
 * Usage:
 *   node prisma/seed-clinical.js                 # 500 patients, seed=42
 *   node prisma/seed-clinical.js --clear          # wipe syn-* data first
 *   node prisma/seed-clinical.js --patients=100   # test with fewer
 *   node prisma/seed-clinical.js --seed=123       # different RNG seed
 *
 * Flags:
 *   --patients=N    Patient count (default 500, max 5000)
 *   --seed=N        Random seed (default 42)
 *   --clear         Wipe all syn-* prefixed data before seeding
 *   --batch=N       Transaction batch size (default 50)
 *
 * Tables populated:
 *   User, UserRole, DoctorProfile, Clinic, DoctorClinic,
 *   StaffAssignment, Appointment, Encounter, Condition,
 *   VitalsRecord, Allergy, SpecialtyEncounterData, SpecialtyFinding
 * ============================================================================
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── CLI ─────────────────────────────────────────────────────────────────────

const args = {};
process.argv.slice(2).forEach((a) => {
  const m = a.match(/^--(\w+)=(.+)$/);
  if (m) args[m[1]] = isNaN(Number(m[2])) ? m[2] : Number(m[2]);
  if (a === '--clear') args.clear = true;
});

const PATIENT_COUNT = Math.min(args.patients ?? 500, 5000);
const SEED = args.seed ?? 42;
const BATCH_SIZE = args.batch ?? 50;

// ── SEEDED RNG ──────────────────────────────────────────────────────────────

let _seed = SEED;
function rng() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return _seed / 2147483647;
}
function randInt(min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
function pickWeighted(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
function bool(pct) { return rng() < pct / 100; }
function pickDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + rng() * (end - start));
}
function pickDateInRange(daysBack) {
  const now = Date.now();
  return new Date(now - rng() * daysBack * 86400000);
}
function pickSlotTime(date) {
  const d = new Date(date);
  d.setHours(randInt(9, 17), pick([0, 15, 30, 45]), 0, 0);
  return d;
}
function uniqueId(prefix, n) {
  return `${prefix}-${String(n).padStart(7, '0')}`;
}
function generatePhone(base) {
  return `+919${String(base).padStart(9, '0')}`;
}
function generateAadhaarLast4() {
  return String(randInt(1000, 9999));
}

// ── DATA POOLS (Indian-localized) ──────────────────────────────────────────

const MALE_NAMES = [
  'Aarav','Arjun','Vikram','Ravi','Rajesh','Suresh','Amit','Deepak','Manoj','Karthik',
  'Venkatesh','Srinivas','Naveen','Harsha','Pranav','Rohan','Aditya','Siddharth','Rahul','Sanjay',
  'Vijay','Anil','Sunil','Ganesh','Mahesh','Ramesh','Naresh','Kishore','Pavan','Satish',
  'Mohan','Chandra','Dinesh','Jai','Hemanth','Vishnu','Harish','Girish','Umesh','Sachin',
  'Murali','Bharat','Ashok','Lokesh','Kiran','Shashi','Prakash','Dev','Kumar',
  'Nikhil','Vinay','Ajay','Sai','Rohit','Akash','Varun','Dhruv','Yash','Tanmay',
];

const FEMALE_NAMES = [
  'Priya','Ananya','Sneha','Divya','Kavita','Lakshmi','Meera','Pooja','Neha','Ranjitha',
  'Shweta','Vidya','Anita','Sunita','Geeta','Asha','Nalini','Radha','Revathi','Shanti',
  'Deepa','Rekha','Mala','Sarita','Lalitha','Padma','Vani','Hema','Sita','Nirmala',
  'Bhargavi','Vaishnavi','Soundarya','Trisha','Amrutha','Bhavana','Chaitra','Deepthi','Esha','Gayatri',
  'Harini','Indira','Jyothi','Kavya','Lavanya','Manasa','Nandini','Pavithra','Rashmi','Sujatha',
];

const LAST_NAMES = [
  'Sharma','Verma','Patel','Reddy','Kumar','Singh','Gupta','Joshi','Iyer','Rao',
  'Nair','Menon','Das','Bose','Sen','Mukherjee','Banerjee','Chatterjee','Desai','Shah',
  'Mehta','Agarwal','Khanna','Kapoor','Malhotra','Chopra','Saxena','Trivedi','Dwivedi','Mishra',
  'Tiwari','Pandey','Dubey','Yadav','Jain','Pillai','Kurian','George','Philip','Thomas',
  'Naidu','Prasad','Murthy','Bhat','Kulkarni','Patil','Deshmukh','Pawar','More','Kadam',
];

const STREETS = [
  'MG Road','Gandhi Nagar','Nehru Street','Sardar Patel Marg','Ring Road','Lake View Road',
  'Temple Street','Market Road','Hospital Road','College Road','Station Road','Bus Stand Road',
  'Main Bazaar','Shankar Nagar','Raja Street','Cross Cut Road','Brigade Road','Commercial Street',
  'Jayanagar','Indiranagar','Koramangala','Whitefield','HSR Layout','BTM Layout',
  'Banjara Hills','Jubilee Hills','Hitech City','Gachibowli','Kondapur','Madhapur',
];

const SPECIALTIES = [
  { id: 'general-medicine', label: 'General Medicine' },
  { id: 'ent', label: 'ENT' },
  { id: 'dental', label: 'Dental' },
  { id: 'dermatology', label: 'Dermatology' },
  { id: 'ophthalmology', label: 'Ophthalmology' },
  { id: 'cardiology', label: 'Cardiology' },
  { id: 'pediatrics', label: 'Pediatrics' },
  { id: 'orthopedics', label: 'Orthopedics' },
  { id: 'gynecology', label: 'Gynecology' },
  { id: 'neurology', label: 'Neurology' },
  { id: 'psychiatry', label: 'Psychiatry' },
  { id: 'pulmonology', label: 'Pulmonology' },
  { id: 'gastroenterology', label: 'Gastroenterology' },
  { id: 'urology', label: 'Urology' },
  { id: 'endocrinology', label: 'Endocrinology' },
  { id: 'general-surgery', label: 'General Surgery' },
  { id: 'radiology', label: 'Radiology' },
  { id: 'anesthesiology', label: 'Anesthesiology' },
];

const QUALIFICATIONS_BY_SPEC = {
  'general-medicine': [['MBBS','MD General Medicine'], ['MBBS','DNB General Medicine']],
  'ent': [['MBBS','MS ENT'], ['MBBS','DNB ENT']],
  'dental': [['BDS','MDS Orthodontics'], ['BDS','MDS Oral Surgery'], ['BDS','MDS Periodontics']],
  'dermatology': [['MBBS','MD Dermatology'], ['MBBS','DNB Dermatology']],
  'ophthalmology': [['MBBS','MS Ophthalmology'], ['MBBS','DNB Ophthalmology']],
  'cardiology': [['MBBS','MD','DM Cardiology'], ['MBBS','DNB Cardiology']],
  'pediatrics': [['MBBS','MD Pediatrics'], ['MBBS','DNB Pediatrics']],
  'orthopedics': [['MBBS','MS Orthopedics'], ['MBBS','DNB Orthopedics']],
  'gynecology': [['MBBS','MS OBG'], ['MBBS','DNB OBG']],
  'neurology': [['MBBS','MD','DM Neurology'], ['MBBS','DNB Neurology']],
  'psychiatry': [['MBBS','MD Psychiatry'], ['MBBS','DNB Psychiatry']],
  'pulmonology': [['MBBS','MD Pulmonology'], ['MBBS','DNB Pulmonology']],
  'gastroenterology': [['MBBS','MD','DM Gastroenterology'], ['MBBS','DNB Gastroenterology']],
  'urology': [['MBBS','MS','MCh Urology'], ['MBBS','DNB Urology']],
  'endocrinology': [['MBBS','MD','DM Endocrinology'], ['MBBS','DNB Endocrinology']],
  'general-surgery': [['MBBS','MS General Surgery'], ['MBBS','DNB General Surgery']],
  'radiology': [['MBBS','MD Radiology'], ['MBBS','DNB Radiology']],
  'anesthesiology': [['MBBS','MD Anesthesiology'], ['MBBS','DNB Anesthesiology']],
};

// Specialty → conditions mapping for patient distribution
const CONDITIONS_BY_SPEC = {
  'general-medicine': [
    { name: 'Vitamin D Deficiency', icd: 'E55.9', minAge: 1, prevalence: 300 },
    { name: 'Iron Deficiency Anemia', icd: 'D50.9', minAge: 1, prevalence: 250 },
    { name: 'Dengue (Past Infection)', icd: 'Z86.19', minAge: 1, prevalence: 200 },
    { name: 'Dyslipidemia', icd: 'E78.5', minAge: 20, prevalence: 250 },
  ],
  'ent': [
    { name: 'Allergic Rhinitis', icd: 'J30.4', minAge: 3, prevalence: 400 },
    { name: 'Sinusitis', icd: 'J32', minAge: 5, prevalence: 300 },
    { name: 'Hearing Loss (Age-Related)', icd: 'H91.9', minAge: 55, prevalence: 200 },
    { name: 'Tonsillitis', icd: 'J03.9', minAge: 2, prevalence: 250 },
  ],
  'dental': [
    { name: 'Dental Caries', icd: 'K02.9', minAge: 3, prevalence: 500 },
    { name: 'Gingivitis', icd: 'K05.1', minAge: 10, prevalence: 350 },
    { name: 'Periodontitis', icd: 'K05.3', minAge: 20, prevalence: 200 },
    { name: 'Toothache', icd: 'K08.8', minAge: 5, prevalence: 300 },
  ],
  'dermatology': [
    { name: 'Acne Vulgaris', icd: 'L70.0', minAge: 12, prevalence: 350 },
    { name: 'Eczema', icd: 'L30.9', minAge: 1, prevalence: 200 },
    { name: 'Fungal Infection', icd: 'B35.9', minAge: 5, prevalence: 250 },
    { name: 'Psoriasis', icd: 'L40.0', minAge: 15, prevalence: 100 },
  ],
  'ophthalmology': [
    { name: 'Cataract', icd: 'H25', minAge: 50, prevalence: 350 },
    { name: 'Glaucoma', icd: 'H40', minAge: 40, prevalence: 200 },
    { name: 'Refractive Error', icd: 'H52.1', minAge: 5, prevalence: 400 },
    { name: 'Conjunctivitis', icd: 'H10.9', minAge: 1, prevalence: 250 },
  ],
  'cardiology': [
    { name: 'Hypertension', icd: 'I10', minAge: 25, prevalence: 400 },
    { name: 'Coronary Artery Disease', icd: 'I25', minAge: 35, prevalence: 200 },
    { name: 'Dyslipidemia', icd: 'E78.5', minAge: 20, prevalence: 300 },
    { name: 'Heart Failure', icd: 'I50', minAge: 50, prevalence: 80 },
  ],
  'pediatrics': [
    { name: 'Childhood Asthma', icd: 'J45', minAge: 1, prevalence: 250 },
    { name: 'Viral Fever', icd: 'J00', minAge: 0, prevalence: 400 },
    { name: 'Diarrheal Disease', icd: 'A09', minAge: 0, prevalence: 300 },
    { name: 'Vitamin D Deficiency', icd: 'E55.9', minAge: 1, prevalence: 350 },
  ],
  'orthopedics': [
    { name: 'Osteoarthritis', icd: 'M17', minAge: 40, prevalence: 300 },
    { name: 'Lumbar Spondylosis', icd: 'M47.9', minAge: 30, prevalence: 250 },
    { name: 'Fracture Healing', icd: 'S82', minAge: 10, prevalence: 150 },
    { name: 'Gout', icd: 'M10', minAge: 25, prevalence: 150 },
  ],
  'gynecology': [
    { name: 'PCOS', icd: 'E28.2', minAge: 15, gender: 'Female', prevalence: 350 },
    { name: 'UTI (Recurrent)', icd: 'N39.0', minAge: 15, gender: 'Female', prevalence: 250 },
    { name: 'Osteoporosis', icd: 'M81', minAge: 45, gender: 'Female', prevalence: 200 },
    { name: 'Iron Deficiency Anemia', icd: 'D50.9', minAge: 15, gender: 'Female', prevalence: 300 },
  ],
  'neurology': [
    { name: 'Migraine', icd: 'G43.9', minAge: 12, prevalence: 350 },
    { name: 'Cervical Spondylosis', icd: 'M47', minAge: 30, prevalence: 200 },
    { name: 'Epilepsy', icd: 'G40', minAge: 5, prevalence: 80 },
    { name: 'Neuropathy', icd: 'G60', minAge: 40, prevalence: 100 },
  ],
  'psychiatry': [
    { name: 'Anxiety Disorder', icd: 'F41.9', minAge: 15, prevalence: 350 },
    { name: 'Depression', icd: 'F32.9', minAge: 18, prevalence: 300 },
    { name: 'Insomnia', icd: 'G47.0', minAge: 20, prevalence: 250 },
    { name: 'Bipolar Disorder', icd: 'F31', minAge: 18, prevalence: 60 },
  ],
  'pulmonology': [
    { name: 'Bronchial Asthma', icd: 'J45', minAge: 1, prevalence: 300 },
    { name: 'COPD', icd: 'J44', minAge: 35, prevalence: 150 },
    { name: 'Tuberculosis (Treated)', icd: 'Z86.15', minAge: 10, prevalence: 80 },
    { name: 'Pneumonia', icd: 'J18', minAge: 1, prevalence: 150 },
  ],
  'gastroenterology': [
    { name: 'GERD', icd: 'K21.9', minAge: 15, prevalence: 350 },
    { name: 'IBS', icd: 'K58', minAge: 15, prevalence: 200 },
    { name: 'Peptic Ulcer', icd: 'K27', minAge: 20, prevalence: 150 },
    { name: 'Fatty Liver', icd: 'K76.0', minAge: 25, prevalence: 250 },
  ],
  'urology': [
    { name: 'BPH', icd: 'N40', minAge: 45, gender: 'Male', prevalence: 350 },
    { name: 'UTI', icd: 'N39.0', minAge: 15, prevalence: 200 },
    { name: 'Kidney Stone', icd: 'N20.0', minAge: 20, prevalence: 250 },
    { name: 'Chronic Kidney Disease', icd: 'N18', minAge: 30, prevalence: 100 },
  ],
  'endocrinology': [
    { name: 'Type 2 Diabetes', icd: 'E11', minAge: 20, prevalence: 400 },
    { name: 'Hypothyroidism', icd: 'E03.9', minAge: 10, prevalence: 300 },
    { name: 'PCOS', icd: 'E28.2', minAge: 15, gender: 'Female', prevalence: 200 },
    { name: 'Obesity', icd: 'E66', minAge: 10, prevalence: 250 },
  ],
  'general-surgery': [
    { name: 'Hernia', icd: 'K40', minAge: 15, prevalence: 200 },
    { name: 'Gallstones', icd: 'K80', minAge: 25, prevalence: 150 },
    { name: 'Appendicitis', icd: 'K35', minAge: 10, prevalence: 100 },
    { name: 'Hemorrhoids', icd: 'K64', minAge: 20, prevalence: 200 },
  ],
  'radiology': [
    { name: 'Lung Nodule', icd: 'R91.1', minAge: 30, prevalence: 100 },
    { name: 'Liver Hemangioma', icd: 'D18.03', minAge: 20, prevalence: 80 },
    { name: 'Renal Cyst', icd: 'N28.1', minAge: 25, prevalence: 120 },
    { name: 'Osteopenia', icd: 'M85.8', minAge: 40, prevalence: 150 },
  ],
  'anesthesiology': [
    { name: 'Pre-Op Clearance - ASA I', icd: 'Z01.81', minAge: 15, prevalence: 200 },
    { name: 'Pre-Op Clearance - ASA II', icd: 'Z01.81', minAge: 25, prevalence: 250 },
    { name: 'Pre-Op Clearance - ASA III', icd: 'Z01.81', minAge: 40, prevalence: 100 },
    { name: 'Chronic Pain', icd: 'G89.4', minAge: 25, prevalence: 150 },
  ],
};

const MEDICATIONS_BY_CONDITION = {
  'Hypertension': ['Amlodipine 5mg','Telmesartan 40mg','Metoprolol 25mg','Enalapril 5mg'],
  'Type 2 Diabetes': ['Metformin 500mg','Empagliflozin 10mg','Glimepiride 2mg','Insulin Glargine'],
  'Vitamin D Deficiency': ['Cholecalciferol 60K IU weekly','Calcitriol 0.25mcg'],
  'Iron Deficiency Anemia': ['Ferrous Sulphate 200mg','Folic Acid 5mg'],
  'Hypothyroidism': ['Levothyroxine 50mcg','Levothyroxine 100mcg'],
  'Dental Caries': ['Amoxicillin 500mg','Metronidazole 400mg','Ibuprofen 400mg','Chlorhexidine Mouthwash'],
  'Gingivitis': ['Chlorhexidine Mouthwash','Metronidazole 400mg'],
  'Periodontitis': ['Amoxicillin 500mg','Metronidazole 400mg','Chlorhexidine Mouthwash'],
  'Toothache': ['Ibuprofen 400mg','Paracetamol 500mg'],
  'GERD': ['Omeprazole 20mg','Pantoprazole 40mg','Domperidone 10mg'],
  'IBS': ['Mebeverine 135mg','Probiotics','Ondansetron 4mg'],
  'Peptic Ulcer': ['Omeprazole 20mg','Amoxicillin 500mg','Clarithromycin 500mg'],
  'Fatty Liver': ['Ursodeoxycholic Acid 300mg','Vitamin E 400mg'],
  'Migraine': ['Sumatriptan 50mg','Propranolol 40mg','Topiramate 25mg'],
  'Cervical Spondylosis': ['Paracetamol 500mg','Etoricoxib 60mg','Gabapentin 300mg'],
  'Epilepsy': ['Levetiracetam 500mg','Valproate 500mg','Carbamazepine 200mg'],
  'Neuropathy': ['Gabapentin 300mg','Pregabalin 75mg','Methylcobalamin 500mcg'],
  'Bronchial Asthma': ['Salbutamol Inhaler','Fluticasone Inhaler','Montelukast 10mg'],
  'COPD': ['Tiotropium Inhaler','Fluticasone/Salmeterol','Theophylline 200mg'],
  'Tuberculosis (Treated)': ['AKT 4 Kit','Rifampicin 450mg','Isoniazid 300mg'],
  'Pneumonia': ['Amoxicillin-Clavulanate 625mg','Azithromycin 500mg','Doxycycline 100mg'],
  'Osteoarthritis': ['Paracetamol 500mg','Etoricoxib 60mg','Glucosamine 1500mg'],
  'Lumbar Spondylosis': ['Paracetamol 500mg','Etoricoxib 60mg','Gabapentin 300mg'],
  'Fracture Healing': ['Calcium + Vitamin D','Etoricoxib 60mg'],
  'Gout': ['Allopurinol 300mg','Colchicine 0.5mg','Febuxostat 40mg'],
  'Anxiety Disorder': ['Sertraline 50mg','Clonazepam 0.5mg','Escitalopram 10mg'],
  'Depression': ['Fluoxetine 20mg','Sertraline 50mg','Mirtazapine 15mg'],
  'Insomnia': ['Zolpidem 10mg','Clonazepam 0.5mg','Melatonin 5mg'],
  'Bipolar Disorder': ['Lithium 300mg','Valproate 500mg','Olanzapine 5mg'],
  'Cataract': ['Latanoprost 0.005%','Timolol 0.5%','Nepafenac 0.1%'],
  'Glaucoma': ['Latanoprost 0.005%','Timolol 0.5%','Brinzolamide 1%'],
  'Refractive Error': ['Artificial Tears','Olopatadine 0.1%'],
  'Conjunctivitis': ['Moxifloxacin 0.5%','Olopatadine 0.1%','Artificial Tears'],
  'Acne Vulgaris': ['Adapalene 0.1%','Clindamycin 1%','Benzoyl Peroxide 2.5%'],
  'Eczema': ['Hydrocortisone 1%','Moisturizer','Tacrolimus 0.1%'],
  'Fungal Infection': ['Clotrimazole 1%','Fluconazole 150mg','Terbinafine 250mg'],
  'Psoriasis': ['Clobetasol 0.05%','Calcipotriol 0.005%','Methotrexate 7.5mg'],
  'Allergic Rhinitis': ['Cetirizine 10mg','Levocetirizine 5mg','Fluticasone Nasal Spray'],
  'Sinusitis': ['Amoxicillin-Clavulanate 625mg','Doxycycline 100mg','Fluticasone Nasal'],
  'Hearing Loss (Age-Related)': ['Ginkgo Biloba','Methylcobalamin 500mcg'],
  'Tonsillitis': ['Amoxicillin 500mg','Ibuprofen 400mg'],
  'Coronary Artery Disease': ['Atorvastatin 20mg','Aspirin 75mg','Clopidogrel 75mg'],
  'Heart Failure': ['Furosemide 40mg','Spironolactone 25mg','Carvedilol 6.25mg'],
  'PCOS': ['Metformin 500mg','Spironolactone 25mg','Combined OCP'],
  'UTI (Recurrent)': ['Nitrofurantoin 100mg','Cephalexin 500mg'],
  'Osteoporosis': ['Alendronate 70mg weekly','Calcium + Vitamin D','Denosumab 60mg'],
  'Childhood Asthma': ['Salbutamol Inhaler','Montelukast 10mg','Fluticasone Inhaler'],
  'Viral Fever': ['Paracetamol 500mg','Cetirizine 10mg'],
  'Diarrheal Disease': ['ORS','Zinc 20mg','Probiotics'],
  'BPH': ['Tamsulosin 0.4mg','Finasteride 5mg','Dutasteride 0.5mg'],
  'Kidney Stone': ['Tamsulosin 0.4mg','Potassium Citrate','Etoricoxib 60mg'],
  'Chronic Kidney Disease': ['Calcium Carbonate','Sodium Bicarbonate','Erythropoietin'],
  'Dyslipidemia': ['Atorvastatin 10mg','Rosuvastatin 10mg','Fenofibrate 160mg'],
  'Obesity': ['Metformin 500mg','Orlistat 120mg','Vitamin D 60K IU'],
  'Hernia': ['Paracetamol 500mg','Etoricoxib 60mg'],
  'Gallstones': ['Ursodeoxycholic Acid 300mg','Etoricoxib 60mg'],
  'Appendicitis': ['Ceftriaxone 1g IV','Metronidazole 500mg IV','Paracetamol 500mg'],
  'Hemorrhoids': ['Diosmin + Hesperidin','Lidocaine Gel','Lactulose 10ml'],
  'Lung Nodule': ['Annual CT Follow-up'],
  'Liver Hemangioma': ['Annual USG Follow-up'],
  'Renal Cyst': ['Annual USG Follow-up'],
  'Osteopenia': ['Calcium + Vitamin D','Alendronate 70mg weekly'],
  'Pre-Op Clearance - ASA I': ['Nil'],
  'Pre-Op Clearance - ASA II': ['Optimize Comorbidities'],
  'Pre-Op Clearance - ASA III': ['Optimize Comorbidities','Cardiology Referral'],
  'Chronic Pain': ['Gabapentin 300mg','Pregabalin 75mg','Amitriptyline 10mg'],
  'UTI': ['Nitrofurantoin 100mg','Cephalexin 500mg'],
  'Diabetes': ['Metformin 500mg','Empagliflozin 10mg'],
};

const ALLERGENS = [
  { name: 'Penicillin', weight: 25 }, { name: 'Sulfa', weight: 15 },
  { name: 'Aspirin', weight: 10 }, { name: 'NSAIDs', weight: 12 },
  { name: 'Pollen', weight: 30 }, { name: 'Dust Mites', weight: 25 },
  { name: 'Latex', weight: 3 }, { name: 'Peanuts', weight: 8 },
  { name: 'Shellfish', weight: 5 }, { name: 'Milk', weight: 6 },
  { name: 'Eggs', weight: 4 }, { name: 'Iodine Contrast', weight: 3 },
  { name: 'Codeine', weight: 2 }, { name: 'Ciprofloxacin', weight: 5 },
];

const REACTIONS = ['Rash','Hives','Itching','Swelling','Anaphylaxis','Nausea','Dizziness'];

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const BLOOD_WEIGHTS = [30, 3, 25, 2, 8, 1, 28, 3];

const CLINIC_PREFIXES = ['Apollo','Max','Fortis','Medanta','AIIMS','Manipal','Narayana'];
const CLINIC_SUFFIXES = ['SuperSpecialty Hospital','Multi-Specialty Clinic','Medical Centre','Healthcare','Hospital','Nursing Home','Clinic'];

const STATES = [
  { code: 'TS', name: 'Telangana', weight: 15, cities: ['Hyderabad','Warangal','Karimnagar','Nizamabad','Khammam','Ramagundam'], langs: ['Telugu','Urdu'] },
  { code: 'AP', name: 'Andhra Pradesh', weight: 12, cities: ['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Kakinada'], langs: ['Telugu'] },
  { code: 'KA', name: 'Karnataka', weight: 15, cities: ['Bengaluru','Mysuru','Hubli','Mangaluru','Belagavi','Davangere'], langs: ['Kannada','English'] },
  { code: 'TN', name: 'Tamil Nadu', weight: 12, cities: ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli'], langs: ['Tamil','English'] },
  { code: 'MH', name: 'Maharashtra', weight: 18, cities: ['Mumbai','Pune','Nagpur','Thane','Nashik','Aurangabad'], langs: ['Marathi','Hindi'] },
  { code: 'DL', name: 'Delhi', weight: 10, cities: ['New Delhi','Dwarka','Rohini','Saket','Lajpat Nagar','Karol Bagh'], langs: ['Hindi','English'] },
  { code: 'GJ', name: 'Gujarat', weight: 8, cities: ['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar'], langs: ['Gujarati','Hindi'] },
  { code: 'WB', name: 'West Bengal', weight: 10, cities: ['Kolkata','Howrah','Durgapur','Siliguri','Asansol','Bardhaman'], langs: ['Bengali','Hindi'] },
];

function pickName(gender) {
  const first = gender === 'Male' ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
  const last = pick(LAST_NAMES);
  return `${first} ${last}`;
}

function generateAge(specId) {
  if (specId === 'pediatrics') return randInt(0, 14);
  if (specId === 'gynecology') return randInt(15, 65);
  const r = rng();
  if (r < 0.18) return randInt(18, 30);
  if (r < 0.45) return randInt(31, 45);
  if (r < 0.70) return randInt(46, 60);
  return randInt(61, 85);
}

function generateDOB(age) {
  const now = new Date();
  return new Date(now.getFullYear() - age, randInt(0, 11), randInt(1, 28));
}

function pickState() {
  const weights = STATES.map(s => s.weight);
  return pickWeighted(STATES, weights);
}

function pickCity(state) { return pick(state.cities); }

function pickPincode() { return String(randInt(500001, 560100)); }

function generateAddress(state, city) {
  return `${randInt(1, 999)}, ${pick(STREETS)}, ${city}, ${state.name} ${pickPincode()}`;
}

function generateSlug(name, idx) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) + '-' + idx;
}

// ── GENERATORS ──────────────────────────────────────────────────────────────

function generateClinic(idx) {
  const state = pickState();
  const city = pickCity(state);
  const prefix = pick(CLINIC_PREFIXES);
  const suffix = pick(CLINIC_SUFFIXES);
  const name = `${prefix} ${city} ${suffix}`;
  const langs = [...new Set([...state.langs, 'English'])];
  return {
    id: `syn-clinic-${String(idx).padStart(4, '0')}`,
    name,
    slug: generateSlug(prefix, idx),
    description: `${name} — multi-specialty healthcare in ${city}`,
    phoneNumber: generatePhone(100000 + idx),
    addressLine1: `${randInt(1, 999)}, ${pick(STREETS)}`,
    city,
    state: state.name,
    pincode: pickPincode(),
    languages: langs,
    timezone: 'Asia/Kolkata',
    verificationStatus: 'VERIFIED',
    facilities: pick([['Pharmacy','Lab','X-Ray','ECG'], ['Pharmacy','Lab','Dental','Physiotherapy'], ['Pharmacy','Lab','X-Ray','ECG','Ambulance']]),
    services: ['OPD','Teleconsultation','Health Checkup'],
    operatingHours: { weekdays: '09:00-19:00', saturday: '09:00-14:00', sunday: 'CLOSED' },
  };
}

function generateDoctor(idx, spec) {
  const gender = pick(['Male','Female']);
  const name = pickName(gender);
  const quals = pick(QUALIFICATIONS_BY_SPEC[spec.id]);
  const state = pickState();
  const city = pickCity(state);
  const fee = pickWeighted([500,600,700,800,1000,1200], [15,20,25,15,15,10]);
  const lang = [...new Set([...state.langs, 'English'])];
  return {
    id: `syn-doctor-${String(idx).padStart(4, '0')}`,
    wyshId: `WYSH-DOC-${String(idx).padStart(4, '0')}`,
    phoneNumber: generatePhone(200000 + idx),
    fullName: name,
    gender,
    preferredLanguage: 'English',
    isPhoneVerified: true,
    dateOfBirth: generateDOB(randInt(30, 60)),
    chronicConditions: [],
    allergiesSummary: [],
    specialization: spec.label,
    specialtyId: spec.id,
    subSpecializations: [],
    qualifications: quals,
    yearsOfExperience: randInt(5, 30),
    registrationNumber: `MC-${String(randInt(100000, 999999))}`,
    languages: lang,
    consultationFee: fee,
    approvalStatus: 'VERIFIED',
  };
}

function generatePatient(ageGroup, gender) {
  const name = pickName(gender);
  const age = typeof ageGroup === 'number' ? ageGroup : generateAge();
  const dob = generateDOB(age);
  const state = pickState();
  const city = pickCity(state);
  const lang = pick([...new Set([...state.langs, 'English'])]);
  return {
    name,
    age,
    dateOfBirth: dob,
    gender,
    bloodGroup: pickWeighted(BLOOD_GROUPS, BLOOD_WEIGHTS),
    language: lang,
    state,
    city,
    address: `${randInt(1, 999)}, ${pick(STREETS)}`,
    pincode: pickPincode(),
    aadhaarLast4: generateAadhaarLast4(),
  };
}

function generateAllergies() {
  const count = Math.max(0, pickWeighted([0, 0, 1, 1, 2], [35, 25, 20, 12, 8]));
  const selected = [];
  for (let i = 0; i < count; i++) {
    const a = pickWeighted(ALLERGENS, ALLERGENS.map(x => x.weight));
    if (!selected.includes(a.name)) selected.push(a);
  }
  return selected;
}

function generateVitals() {
  return {
    bpSystolic: randInt(100, 160),
    bpDiastolic: randInt(60, 100),
    heartRate: randInt(60, 100),
    temperature: parseFloat((96 + rng() * 6).toFixed(1)),
    spo2: randInt(94, 100),
    respiratoryRate: randInt(12, 20),
    weight: parseFloat((50 + rng() * 40).toFixed(1)),
    height: parseFloat((150 + rng() * 30).toFixed(1)),
    bmi: 0,
    painScore: pickWeighted([0, 1, 2, 3, 4, 5, 6], [30, 20, 15, 12, 10, 8, 5]),
  };
}

// ── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  WYSHCARE Clinical Seed Generator`);
  console.log(`  Patients: ${PATIENT_COUNT} across ${SPECIALTIES.length} specialties`);
  console.log(`  Seed:     ${SEED}`);
  console.log(`══════════════════════════════════════════════════\n`);

  const startAll = Date.now();

  // ── CLEAR ────────────────────────────────────────────────────────────────
  if (args.clear) {
    console.log('Clearing existing synthea data...');
    await prisma.$transaction([
      prisma.specialtyFinding.deleteMany({ where: { specialtyCode: { startsWith: 'syn-' } } }),
    ]);
    await prisma.$transaction([
      prisma.specialtyFinding.deleteMany({ where: { id: { startsWith: 'syn-finding-' } } }),
      prisma.specialtyEncounterData.deleteMany({ where: { id: { startsWith: 'syn-enc-data-' } } }),
      prisma.vitalsRecord.deleteMany({ where: { id: { startsWith: 'syn-vital-' } } }),
      prisma.allergy.deleteMany({ where: { id: { startsWith: 'syn-allergy-' } } }),
      prisma.encounter.deleteMany({ where: { id: { startsWith: 'syn-enc-' } } }),
      prisma.condition.deleteMany({ where: { id: { startsWith: 'syn-cond-' } } }),
      prisma.appointment.deleteMany({ where: { id: { startsWith: 'syn-appt-' } } }),
      prisma.staffAssignment.deleteMany({ where: { id: { startsWith: 'syn-staff-' } } }),
      prisma.doctorClinic.deleteMany({ where: { doctorId: { startsWith: 'syn-doctor-' } } }),
      prisma.doctorProfile.deleteMany({ where: { userId: { startsWith: 'syn-doctor-' } } }),
      prisma.userRole.deleteMany({ where: { userId: { startsWith: 'syn-' } } }),
      prisma.user.deleteMany({ where: { id: { startsWith: 'syn-' } } }),
      prisma.clinic.deleteMany({ where: { id: { startsWith: 'syn-clinic-' } } }),
    ]);
    console.log('  Done.\n');
  }

  // ── 1. CLINICS ──────────────────────────────────────────────────────────
  const CLINIC_COUNT = 3;
  console.log(`Creating ${CLINIC_COUNT} clinics...`);
  const clinicIds = [];
  for (let i = 0; i < CLINIC_COUNT; i++) {
    const data = generateClinic(i + 1);
    const clinic = await prisma.clinic.create({ data });
    clinicIds.push(clinic.id);
    console.log(`  ✅ ${data.name}`);
  }

  // ── 2. DOCTORS (1 per specialty = 18) ──────────────────────────────────
  console.log(`\nCreating ${SPECIALTIES.length} doctors (one per specialty)...`);
  const doctorMap = {}; // specialtyId → {user, profile}
  const doctorsBySpec = {};

  for (let i = 0; i < SPECIALTIES.length; i++) {
    const spec = SPECIALTIES[i];
    const doc = generateDoctor(i + 1, spec);

    const user = await prisma.user.create({
      data: {
        id: doc.id,
        wyshId: doc.wyshId,
        phoneNumber: doc.phoneNumber,
        fullName: doc.fullName,
        gender: doc.gender,
        preferredLanguage: doc.preferredLanguage,
        isPhoneVerified: doc.isPhoneVerified,
        dateOfBirth: doc.dateOfBirth,
        chronicConditions: [],
        allergiesSummary: [],
        roles: { create: { role: 'DOCTOR' } },
        doctorProfile: {
          create: {
            specialization: doc.specialization,
            subSpecializations: doc.subSpecializations,
            qualifications: doc.qualifications,
            yearsOfExperience: doc.yearsOfExperience,
            registrationNumber: doc.registrationNumber,
            languages: doc.languages,
            consultationFee: doc.consultationFee,
            approvalStatus: doc.approvalStatus,
            clinicMappings: {
              create: clinicIds.map((cid, ci) => ({
                clinicId: cid,
                isPrimary: ci === 0,
                consultationFee: doc.consultationFee + (ci > 0 ? randInt(-100, 100) : 0),
              })),
            },
          },
        },
      },
      include: { doctorProfile: true },
    });

    doctorMap[spec.id] = { user, profile: user.doctorProfile };
    doctorsBySpec[spec.id] = { user, profile: user.doctorProfile };
    console.log(`  ✅ ${doc.fullName} → ${spec.label}`);
  }

  // ── 3. CLINIC STAFF ────────────────────────────────────────────────────
  console.log(`\nCreating clinic staff...`);
  let staffCount = 0;
  const STAFF_ROLES = ['NURSE','BILLING','RECEPTION','COORDINATOR','ADMIN','PHARMACY','DIAGNOSTICS'];
  const STAFF_ROLE_WEIGHTS = [25, 15, 20, 10, 5, 15, 10];
  for (let ci = 0; ci < clinicIds.length; ci++) {
    const numStaff = randInt(3, 6);
    for (let si = 0; si < numStaff; si++) {
      staffCount++;
      const role = pickWeighted(STAFF_ROLES, STAFF_ROLE_WEIGHTS);
      const gender = pick(['Male','Female']);
      const name = pickName(gender);
      const roleEnum = role === 'NURSE' ? 'NURSE' : role === 'PHARMACY' ? 'PHARMACY_PARTNER' : role === 'DIAGNOSTICS' ? 'LAB_PARTNER' : 'ADMIN';
      await prisma.user.create({
        data: {
          id: `syn-staff-user-${String(staffCount).padStart(4, '0')}`,
          wyshId: `WYSH-STAFF-${String(staffCount).padStart(4, '0')}`,
          phoneNumber: generatePhone(300000 + staffCount),
          fullName: name,
          gender,
          preferredLanguage: 'English',
          isPhoneVerified: true,
          chronicConditions: [],
          allergiesSummary: [],
          roles: { create: { role: roleEnum } },
          StaffAssignment: {
            create: {
              id: `syn-staff-${String(staffCount).padStart(4, '0')}`,
              clinicId: clinicIds[ci],
              role,
              isActive: true,
              updatedAt: new Date(),
            },
          },
        },
      });
    }
    console.log(`  Clinic ${ci + 1}: ${numStaff} staff`);
  }

  // ── 4. PATIENTS ─────────────────────────────────────────────────────────
  const PATIENTS_PER_SPEC = Math.ceil(PATIENT_COUNT / SPECIALTIES.length);
  console.log(`\nCreating ${PATIENT_COUNT} patients (~${PATIENTS_PER_SPEC} per specialty)...`);
  const patientStart = Date.now();
  let patientIdx = 0;

  for (let si = 0; si < SPECIALTIES.length; si++) {
    const spec = SPECIALTIES[si];
    const specConditions = CONDITIONS_BY_SPEC[spec.id] || [];
    const doctorInfo = doctorsBySpec[spec.id];
    if (!doctorInfo) continue;

    const count = si < SPECIALTIES.length - 1
      ? PATIENTS_PER_SPEC
      : PATIENT_COUNT - patientIdx;

    const batchPatients = [];

    for (let pi = 0; pi < count; pi++) {
      patientIdx++;
      const pk = patientIdx;
      const specDefaultGender = spec.id === 'gynecology' ? 'Female' : pick(['Male','Female']);
      const pat = generatePatient(spec.id, specDefaultGender);
      const userId = `syn-patient-${String(pk).padStart(7, '0')}`;
      const wyshId = `WYSH-PAT-${String(pk).padStart(6, '0')}`;
      const phone = generatePhone(40000000 + pk);

      // Pick 1-2 conditions for this patient from their specialty
      const patientConditions = [];
      const patientMedNames = [];
      for (const c of specConditions) {
        if (pat.age < c.minAge) continue;
        if (c.gender && c.gender !== pat.gender) continue;
        if (rng() < c.prevalence / 1000) {
          const diagnosed = pickDateInRange(randInt(30, 1095));
          const status = pickWeighted(['ACTIVE','ACTIVE','ACTIVE','RESOLVED'], [70, 15, 10, 5]);
          patientConditions.push({ name: c.name, icd: c.icd, diagnosedAt: diagnosed, status });
          const meds = MEDICATIONS_BY_CONDITION[c.name];
          if (meds && status === 'ACTIVE') {
            for (const m of meds) {
              if (!patientMedNames.includes(m)) patientMedNames.push(m);
            }
          }
        }
      }

      // Ensure at least 1 condition
      if (patientConditions.length === 0) {
        const defaultCond = specConditions[0];
        if (defaultCond) {
          patientConditions.push({
            name: defaultCond.name,
            icd: defaultCond.icd,
            diagnosedAt: pickDateInRange(randInt(30, 365)),
            status: 'ACTIVE',
          });
          const meds = MEDICATIONS_BY_CONDITION[defaultCond.name];
          if (meds) {
            for (const m of meds) {
              if (!patientMedNames.includes(m)) patientMedNames.push(m);
            }
          }
        }
      }

      // Generate allergies
      const allergies = generateAllergies();
      const allergyNames = allergies.map(a => a.name);

      batchPatients.push({
        id: userId,
        wyshId,
        phoneNumber: phone,
        fullName: pat.name,
        gender: pat.gender,
        dateOfBirth: pat.dateOfBirth,
        bloodGroup: pat.bloodGroup,
        preferredLanguage: pat.language,
        isPhoneVerified: true,
        chronicConditions: patientConditions.filter(c => c.status === 'ACTIVE').map(c => c.name),
        allergiesSummary: allergyNames,
        aadhaarLast4: pat.aadhaarLast4,
        conditions: patientConditions,
        meds: patientMedNames,
        allergies,
        specId: spec.id,
        doctorId: doctorInfo.user.id,
        doctorProfileId: doctorInfo.profile.id,
      });
    }

    // Insert patients in batches
    for (let bi = 0; bi < batchPatients.length; bi += BATCH_SIZE) {
      const batch = batchPatients.slice(bi, bi + BATCH_SIZE);
      await prisma.$transaction(
        batch.map(p =>
          prisma.user.create({
            data: {
              id: p.id,
              wyshId: p.wyshId,
              phoneNumber: p.phoneNumber,
              fullName: p.fullName,
              gender: p.gender,
              dateOfBirth: p.dateOfBirth,
              bloodGroup: p.bloodGroup,
              preferredLanguage: p.preferredLanguage,
              isPhoneVerified: p.isPhoneVerified,
              chronicConditions: p.chronicConditions,
              allergiesSummary: p.allergiesSummary,
              aadhaarLast4: p.aadhaarLast4,
              roles: { create: { role: 'PATIENT' } },
            },
          })
        )
      );
    }

    // Now for each patient in this specialty batch, create clinical data
    let clinicalBatch = [];

    for (const p of batchPatients) {
      const encCount = randInt(2, 4);

      for (let ei = 0; ei < encCount; ei++) {
        const encId = `syn-enc-${p.id}-${ei}`;
        const visitDate = pickDateInRange(randInt(1, 120));
        const startAt = pickSlotTime(visitDate);
        const endAt = new Date(startAt.getTime() + randInt(15, 45) * 60000);
        const reason = pick(['Routine follow-up','New symptoms evaluation','Medication refill','Investigation review','Acute visit']);

        const visitConditions = p.conditions.filter(() => bool(60));
        const primaryCond = visitConditions[0] || p.conditions[0];

        // Encounter
        clinicalBatch.push(
          prisma.encounter.create({
            data: {
              id: encId,
              patientId: p.id,
              encounterClass: 'OUTPATIENT',
              status: 'FINISHED',
              periodStart: startAt,
              periodEnd: endAt,
              reason,
              reasonCode: primaryCond?.icd || 'Z00.00',
              providerId: p.doctorId,
              updatedAt: new Date(),
            },
          })
        );

        // Vitals
        const vitals = generateVitals();
        vitals.bmi = parseFloat((vitals.weight / ((vitals.height / 100) * (vitals.height / 100))).toFixed(1));
        clinicalBatch.push(
          prisma.vitalsRecord.create({
            data: {
              id: `syn-vital-${encId}`,
              patientId: p.id,
              recordedById: p.doctorId,
              recordedAt: startAt,
              ...vitals,
              updatedAt: new Date(),
            },
          })
        );

        // SpecialtyEncounterData
        const templateData = { chiefComplaint: reason, assessment: primaryCond?.name || 'General assessment', plan: 'Continue medication, review in 2 weeks' };
        clinicalBatch.push(
          prisma.specialtyEncounterData.create({
            data: {
              id: `syn-enc-data-${encId}`,
              specialtyCode: p.specId,
              encounterId: encId,
              patientId: p.id,
              providerId: p.doctorId,
              templateId: p.specId === 'general-surgery' ? 'surgery-pre-op' : p.specId === 'radiology' ? 'radiology-xray' : p.specId === 'anesthesiology' ? 'anesthesia-pre-op' : 'assessment',
              data: templateData,
            },
          })
        );

        // SpecialtyFinding (1-2 per encounter)
        const findingCategories = {
          'general-medicine': ['vitals_assessment','diagnosis'],
          'ent': ['ent_exam','hearing_assessment'],
          'dental': ['tooth_charting','periodontal_assessment'],
          'dermatology': ['skin_exam','lesion_assessment'],
          'ophthalmology': ['vision_test','retinal_exam'],
          'cardiology': ['cardiac_exam','ecg_assessment'],
          'pediatrics': ['growth_assessment','immunization_check'],
          'orthopedics': ['joint_exam','range_of_motion'],
          'gynecology': ['pelvic_exam','prenatal_assessment'],
          'neurology': ['neuro_exam','reflex_assessment'],
          'psychiatry': ['mental_state','risk_assessment'],
          'pulmonology': ['respiratory_exam','pft_assessment'],
          'gastroenterology': ['gi_exam','endoscopy_findings'],
          'urology': ['urological_exam','prostate_assessment'],
          'endocrinology': ['hormone_assessment','diabetes_review'],
          'general-surgery': ['pre_op_assessment','surgical_plan'],
          'radiology': ['imaging_findings','radiology_impression'],
          'anesthesiology': ['airway_assessment','anesthesia_plan'],
        };

        const cats = findingCategories[p.specId] || ['general_assessment'];
        const cat = pick(cats);
        clinicalBatch.push(
          prisma.specialtyFinding.create({
            data: {
              id: `syn-finding-${encId}-0`,
              specialtyCode: p.specId,
              encounterId: encId,
              patientId: p.id,
              providerId: p.doctorId,
              category: cat,
              findingKey: pick(['assessment','exam_findings','status']),
              findingValue: { summary: `${primaryCond?.name || 'General'} evaluation completed`, status: 'stable' },
              severity: pickWeighted(['mild','moderate','severe','critical'], [40, 35, 15, 10]),
              status: 'completed',
            },
          })
        );

        if (ei === 0) {
          clinicalBatch.push(
            prisma.specialtyFinding.create({
              data: {
                id: `syn-finding-${encId}-1`,
                specialtyCode: p.specId,
                encounterId: encId,
                patientId: p.id,
                providerId: p.doctorId,
                category: pick(['diagnosis','assessment','plan']),
                findingKey: pick(['primary_diagnosis','treatment_plan','recommendations']),
                findingValue: { diagnosis: primaryCond?.name || 'Under evaluation', plan: 'Follow-up in 2 weeks' },
                status: 'active',
              },
            })
          );
        }
      }

      // Allergies
      for (let ai = 0; ai < p.allergies.length; ai++) {
        const a = p.allergies[ai];
        clinicalBatch.push(
          prisma.allergy.create({
            data: {
              id: `syn-allergy-${p.id}-${ai}`,
              patientId: p.id,
              allergen: a.name,
              reaction: pick(REACTIONS),
              severity: pickWeighted(['MILD','MODERATE','SEVERE'], [50, 35, 15]),
              onsetDate: pickDateInRange(365 * 5),
              status: 'ACTIVE',
              updatedAt: new Date(),
            },
          })
        );
      }

      // Conditions
      for (let ci = 0; ci < p.conditions.length; ci++) {
        const cond = p.conditions[ci];
        clinicalBatch.push(
          prisma.condition.create({
            data: {
              id: `syn-cond-${p.id}-${ci}`,
              patientId: p.id,
              icdCode: cond.icd,
              displayName: cond.name,
              onsetDate: cond.diagnosedAt,
              status: cond.status,
              clinicalStatus: cond.status,
              updatedAt: new Date(),
            },
          })
        );
      }
    }

    // Execute clinical data in batches
    for (let bi = 0; bi < clinicalBatch.length; bi += BATCH_SIZE) {
      const batch = clinicalBatch.slice(bi, bi + BATCH_SIZE);
      await prisma.$transaction(batch);
    }

    process.stdout.write(`  ${spec.label}: ${count} patients created\r`);
    console.log(`\n  ✅ ${spec.label}: ${count} patients`);
  }

  const patientTime = ((Date.now() - patientStart) / 1000).toFixed(1);

  // ── 5. APPOINTMENTS ────────────────────────────────────────────────────
  const APPT_COUNT = Math.min(PATIENT_COUNT * 2, 5000);
  console.log(`\nCreating ${APPT_COUNT} appointments...`);
  const apptStart = Date.now();
  let apptCreated = 0;

  for (let si = 0; si < SPECIALTIES.length; si++) {
    const spec = SPECIALTIES[si];
    const doctorInfo = doctorsBySpec[spec.id];
    if (!doctorInfo) continue;

    const specPatientStart = si * PATIENTS_PER_SPEC + 1;
    const specPatientEnd = Math.min(specPatientStart + PATIENTS_PER_SPEC - 1, PATIENT_COUNT);

    for (let pk = specPatientStart; pk <= specPatientEnd; pk++) {
      apptCreated++;
      if (apptCreated > APPT_COUNT) break;

      const patientId = `syn-patient-${String(pk).padStart(7, '0')}`;
      const clinicId = pick(clinicIds);
      const daysBack = randInt(1, 90);
      const date = new Date(Date.now() - daysBack * 86400000);
      const slotStartAt = pickSlotTime(date);
      const slotEndAt = new Date(slotStartAt.getTime() + randInt(15, 45) * 60000);
      const status = pickWeighted(['COMPLETED','COMPLETED','COMPLETED','CONFIRMED','CANCELLED'], [40, 25, 15, 15, 5]);
      const mode = pickWeighted(['IN_PERSON','VIDEO','AUDIO'], [70, 20, 10]);
      const reasons = ['Routine checkup','Follow-up visit','Medication refill','Investigation review','Symptoms evaluation','Chronic disease management'];

      await prisma.appointment.create({
        data: {
          id: `syn-appt-${String(apptCreated).padStart(7, '0')}`,
          patientUserId: patientId,
          doctorProfileId: doctorInfo.profile.id,
          doctorUserId: doctorInfo.user.id,
          clinicId,
          status,
          consultationMode: mode,
          reason: pick(reasons),
          slotStartAt,
          slotEndAt,
        },
      });
    }
    if (apptCreated >= APPT_COUNT) break;
  }

  const apptTime = ((Date.now() - apptStart) / 1000).toFixed(1);

  // ── SUMMARY ────────────────────────────────────────────────────────────
  const totalTime = ((Date.now() - startAll) / 1000).toFixed(1);
  const totals = await prisma.$transaction([
    prisma.user.count({ where: { id: { startsWith: 'syn-patient-' } } }),
    prisma.user.count({ where: { id: { startsWith: 'syn-doctor-' } } }),
    prisma.encounter.count({ where: { id: { startsWith: 'syn-enc-' } } }),
    prisma.condition.count({ where: { id: { startsWith: 'syn-cond-' } } }),
    prisma.vitalsRecord.count({ where: { id: { startsWith: 'syn-vital-' } } }),
    prisma.allergy.count({ where: { id: { startsWith: 'syn-allergy-' } } }),
    prisma.specialtyFinding.count({ where: { id: { startsWith: 'syn-finding-' } } }),
    prisma.specialtyEncounterData.count({ where: { id: { startsWith: 'syn-enc-data-' } } }),
    prisma.appointment.count({ where: { id: { startsWith: 'syn-appt-' } } }),
    prisma.clinic.count({ where: { id: { startsWith: 'syn-clinic-' } } }),
    prisma.doctorProfile.count({ where: { userId: { startsWith: 'syn-doctor-' } } }),
  ]);

  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  ✅ GENERATION COMPLETE`);
  console.log(`  ══════════════════════════════════════════════════`);
  console.log(`  Clinics:              ${totals[9]}`);
  console.log(`  Doctors:              ${totals[1]} (${SPECIALTIES.length} specialties)`);
  console.log(`  Patients:             ${totals[0]} (${PATIENTS_PER_SPEC}/specialty avg)`);
  console.log(`  Encounters:           ${totals[2]}`);
  console.log(`  Conditions:           ${totals[3]}`);
  console.log(`  Vitals:               ${totals[4]}`);
  console.log(`  Allergies:            ${totals[5]}`);
  console.log(`  Specialty Findings:   ${totals[6]}`);
  console.log(`  Specialty Enc Data:   ${totals[7]}`);
  console.log(`  Appointments:         ${totals[8]}`);
  console.log(`  Duration:             ${totalTime}s`);
  console.log(`══════════════════════════════════════════════════\n`);
}

main()
  .catch((error) => {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
