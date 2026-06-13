/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: backend/prisma/seed-synthea.js
 *
 * Synthea-inspired synthetic data generator for WyshCare.
 * Generates Indian-localized patients, doctors, clinics with
 * realistic disease prevalence, naming, addresses, and workflows.
 *
 * Usage:
 *   node prisma/seed-synthea.js                         # defaults (1k patients, 100 doctors, 10 clinics)
 *   node prisma/seed-synthea.js --patients=50000 --doctors=5000 --clinics=500
 *   node prisma/seed-synthea.js --patients=1000 --doctors=100 --clinics=20 --appointments=5000
 *
 * Flags:
 *   --patients=N       Number of patient users (default 1000)
 *   --doctors=N        Number of doctor users (default 100)
 *   --clinics=N        Number of clinics (default 10)
 *   --appointments=N   Number of appointments (default patients * 2)
 *   --batch=N          Transaction batch size (default 100)
 *   --seed=N           Random seed for reproducibility (default 42)
 *   --clear            Clear existing synthea data before seeding
 * ============================================================================
 * (c) Wysh Technologies
 * Built for Vimarshak Prudhvi
 * All Rights Reserved
 * ============================================================================
 */

const { PrismaClient } = require('@prisma/client');
const { createHash } = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// CLI PARSING
// ─────────────────────────────────────────────────────────────────────────────

const args = {};
process.argv.slice(2).forEach((a) => {
  const m = a.match(/^--(\w+)=(.+)$/);
  if (m) args[m[1]] = isNaN(Number(m[2])) ? m[2] : Number(m[2]);
  if (a === '--clear') args.clear = true;
});

const PATIENT_COUNT = args.patients ?? 1000;
const DOCTOR_COUNT = args.doctors ?? 100;
const CLINIC_COUNT = args.clinics ?? 10;
const BATCH_SIZE = args.batch ?? 100;
const SEED = args.seed ?? 42;

// ─────────────────────────────────────────────────────────────────────────────
// SEEDED RANDOM (deterministic, reproducible)
// ─────────────────────────────────────────────────────────────────────────────

let _seed = SEED;
function rng() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return _seed / 2147483647;
}
function setRngSeed(s) { _seed = s; }
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
function uniqueId(prefix, n) {
  return `${prefix}-${String(n).padStart(6, '0')}`;
}
function generatePhone(base) {
  return `+919${String(base).padStart(9, '0')}`;
}
function pickDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + rng() * (end - start));
}
function generateAadhaarLast4() {
  return String(randInt(1000, 9999));
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA POOLS — Indian-localized
// ─────────────────────────────────────────────────────────────────────────────

const MALE_NAMES = [
  'Aarav','Arjun','Vikram','Ravi','Rajesh','Suresh','Amit','Deepak','Manoj','Karthik',
  'Venkatesh','Srinivas','Naveen','Harsha','Pranav','Rohan','Aditya','Siddharth','Rahul','Sanjay',
  'Vijay','Anil','Sunil','Ganesh','Mahesh','Ramesh','Naresh','Kishore','Pavan','Satish',
  'Mohan','Chandra','Dinesh','Jai','Hemanth','Vishnu','Harish','Girish','Umesh','Sachin',
  'Murali','Bharat','Ashok','Lokesh','Kiran','Ravi','Shashi','Prakash','Dev','Kumar',
  'Nikhil','Vinay','Ajay','Sai','Rohit','Akash','Varun','Dhruv','Yash','Tanmay',
  'Shubham','Omkar','Abhishek','Gaurav','Ankur','Piyush','Nitin','Chetan','Hitesh','Dhaval',
  'Chirag','Ruchir','Tushar','Harsh','Vivek','Jatin','Kunal','Mayank','Rajat','Mohit',
  'Divyansh','Aviral','Yug','Vansh','Rehan','Krishna','Govind','Madhav','Lakshman','Bharath',
  'Pradyumna','Raghav','Seenu','Eashwar','Dharma','Kapil','Shankar','Prasad','Tejas','Rishi',
];

const FEMALE_NAMES = [
  'Lakshmi','Priya','Ananya','Kavita','Sunita','Meera','Neha','Pooja','Divya','Swathi',
  'Anjali','Shreya','Aishwarya','Radha','Sita','Geeta','Rekha','Asha','Nalini','Uma',
  'Vandana','Sneha','Deepa','Ranjitha','Bhavana','Chaithra','Keerthi','Sahana','Shwetha','Varsha',
  'Padma','Mamatha','Saraswathi','Indira','Lalitha','Gayatri','Kalyani','Shanthi','Nirmala','Anitha',
  'Soumya','Bhavya','Chandrika','Esha','Hema','Isha','Jaya','Kriti','Manasa','Nandini',
  'Arpita','Bina','Damayanti','Mala','Pavithra','Rachana','Savita','Tanvi','Usha','Vaishali',
  'Yamini','Kiran','Smita','Tara','Medha','Ritu','Sharmila','Alka','Bindiya','Charvi',
  'Lavanya','Mahi','Ojaswi','Pankaja','Suchitra','Tejaswini','Vidya','Amrita','Bhargavi','Harshini',
  'Triveni','Sushma','Sangita','Rohini','Pallavi','Nitya','Mythili','Lathika','Gowri','Bhanumati',
];

const LAST_NAMES = [
  'Reddy','Kumar','Sharma','Patel','Singh','Verma','Nair','Iyer','Rao','Gupta',
  'Joshi','Mehta','Desai','Kapoor','Choudhury','Malhotra','Srinivasan','Mukherjee','Banerjee','Das',
  'Acharya','Menon','Pillai','Naidu','Shetty','Hegde','Gowda','Murthy','Shastri','Bhat',
  'Prasad','Mishra','Tiwari','Pandey','Dubey','Trivedi','Thakur','Yadav','Jha','Sinha',
  'Agarwal','Jain','Bansal','Goel','Saxena','Sethi','Chopra','Kohli','Ahuja','Bhatia',
  'Purohit','Deshmukh','Kulkarni','Patil','Jadhav','Pawar','More','Shinde','Chavan','Gaikwad',
  'Venkatesh','Subramanian','Krishnan','Rajan','Ganesan','Sundaram','Ramaswamy','Sivan','Balaji','Narayanan',
  'Swamy','Aiyar','Rangarajan','Vishwanath','Shankar','Prabhu','Moorthy','Sridhar','Ravichandran','Venugopal',
];

const STATES = [
  { name: 'Telangana', code: 'TS', cities: ['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam','Ramagundam','Mahbubnagar','Adilabad','Siddipet','Jangaon'],
    langs: ['Telugu','Urdu'], weight: 20 },
  { name: 'Andhra Pradesh', code: 'AP', cities: ['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Tirupati','Kakinada','Rajahmundry','Anantapur','Ongole'],
    langs: ['Telugu'], weight: 18 },
  { name: 'Karnataka', code: 'KA', cities: ['Bengaluru','Mysuru','Hubli','Mangaluru','Belagavi','Davanagere','Ballari','Gulbarga','Shivamogga','Tumkur'],
    langs: ['Kannada','English','Tamil'], weight: 18 },
  { name: 'Tamil Nadu', code: 'TN', cities: ['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Erode','Vellore','Thoothukudi','Dindigul'],
    langs: ['Tamil','English'], weight: 17 },
  { name: 'Maharashtra', code: 'MH', cities: ['Mumbai','Pune','Nagpur','Thane','Nashik','Aurangabad','Solapur','Kolhapur','Amravati','Navi Mumbai'],
    langs: ['Marathi','Hindi','English'], weight: 15 },
  { name: 'Delhi', code: 'DL', cities: ['New Delhi','Dwarka','Rohini','Saket','Lajpat Nagar','Karol Bagh','Pitampura','Janakpuri','Connaught Place','Hauz Khas'],
    langs: ['Hindi','English','Punjabi'], weight: 12 },
];

const STREETS = [
  'Main Road','Gandhi Nagar','MG Road','BR Ambedkar Road','Nehru Street','Sardar Patel Marg',
  'Srinagar Colony','Banjara Hills','Jubilee Hills','Koramangala','Indiranagar','HSR Layout',
  'Adyar','Besant Nagar','Velachery','Anna Nagar','Borivali','Andheri','Powai','Bandra',
  'Connaught Place','Hauz Khas','Saket','Lajpat Nagar','Majestic','Malleswaram','JP Nagar',
  'Gachibowli','Hitech City','Madhapur','Kondapur','Ameerpet','Somajiguda','Shivaji Nagar',
  'Kothrud','Baner','Hinjewadi','Viman Nagar','Dilsukhnagar','Kukatpally','Miyapur',
];

const BLOOD_GROUPS = ['B+','O+','A+','AB+','B-','O-','A-','AB-'];
const BLOOD_WEIGHTS = [35, 30, 20, 5, 3, 3, 3, 1];

const LANGUAGES = ['English','Hindi','Telugu','Tamil','Kannada','Marathi','Urdu','Gujarati','Punjabi','Bengali','Malayalam','Odia'];

const CLINIC_PREFIXES = [
  'Care','Prime','Elite','City','Rainbow','Sunrise','Life','Trinity','Nova','Apex',
  'Zen','Viva','Pulse','Sparsh','Heal','Medi','Swasthya','Jeevan','Aarogya','Navya',
];

const CLINIC_SUFFIXES = [
  'Healthcare','Multispecialty Clinic','Medical Center','Hospital','Clinic','Wellness Centre',
  'Medical Hub','Diagnostics & Polyclinic','Super Specialty Centre','Health Point',
];

const DOCTOR_SPECIALTIES = [
  { id: 'general-medicine', label: 'General Medicine' },
  { id: 'cardiology', label: 'Cardiology' },
  { id: 'dermatology', label: 'Dermatology' },
  { id: 'ent', label: 'ENT' },
  { id: 'ophthalmology', label: 'Ophthalmology' },
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

const SPECIALTY_WEIGHTS = [20, 8, 6, 6, 6, 10, 6, 6, 4, 3, 4, 4, 3, 3, 6, 3, 4];

const QUALIFICATIONS_BY_SPEC = {
  'general-medicine': [['MBBS','MD General Medicine'], ['MBBS','DNB General Medicine']],
  'cardiology': [['MBBS','MD','DM Cardiology'], ['MBBS','DNB Cardiology']],
  'dermatology': [['MBBS','MD Dermatology'], ['MBBS','DNB Dermatology']],
  'ent': [['MBBS','MS ENT'], ['MBBS','DNB ENT']],
  'ophthalmology': [['MBBS','MS Ophthalmology','FRCS'], ['MBBS','DNB Ophthalmology']],
  'pediatrics': [['MBBS','MD Pediatrics'], ['MBBS','DNB Pediatrics']],
  'orthopedics': [['MBBS','MS Orthopedics'], ['MBBS','DNB Orthopedics','Fellowship']],
  'gynecology': [['MBBS','MD Obstetrics & Gynecology'], ['MBBS','DNB OBG']],
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

// Condition mapping from Western/WHO categories to Indian clinical context
// prevalence per 1000 for Indian population
const CONDITIONS = [
  { name: 'Hypertension', icd: 'I10', prevalence: 280, minAge: 25 },
  { name: 'Type 2 Diabetes Mellitus', icd: 'E11', prevalence: 220, minAge: 20 },
  { name: 'Vitamin D Deficiency', icd: 'E55.9', prevalence: 180, minAge: 1 },
  { name: 'Iron Deficiency Anemia', icd: 'D50.9', prevalence: 150, minAge: 1 },
  { name: 'Hypothyroidism', icd: 'E03.9', prevalence: 110, minAge: 10 },
  { name: 'Dental Caries', icd: 'K02.9', prevalence: 200, minAge: 3 },
  { name: 'GERD', icd: 'K21.9', prevalence: 90, minAge: 15 },
  { name: 'Migraine', icd: 'G43.9', prevalence: 120, minAge: 12 },
  { name: 'Bronchial Asthma', icd: 'J45', prevalence: 60, minAge: 1 },
  { name: 'Osteoarthritis', icd: 'M17', prevalence: 80, minAge: 40 },
  { name: 'Cataract', icd: 'H25', prevalence: 70, minAge: 50 },
  { name: 'Coronary Artery Disease', icd: 'I25', prevalence: 55, minAge: 35 },
  { name: 'Chronic Kidney Disease', icd: 'N18', prevalence: 30, minAge: 30 },
  { name: 'Gout', icd: 'M10', prevalence: 25, minAge: 25 },
  { name: 'Tuberculosis (Treated)', icd: 'Z86.15', prevalence: 15, minAge: 5 },
  { name: 'Dengue (Past Infection)', icd: 'Z86.19', prevalence: 40, minAge: 1 },
  { name: 'Dyslipidemia', icd: 'E78.5', prevalence: 160, minAge: 20 },
  { name: 'Anxiety Disorder', icd: 'F41.9', prevalence: 65, minAge: 10 },
  { name: 'Depression', icd: 'F32.9', prevalence: 55, minAge: 12 },
  { name: 'Cervical Spondylosis', icd: 'M47', prevalence: 45, minAge: 30 },
  { name: 'Lumbar Spondylosis', icd: 'M47.9', prevalence: 40, minAge: 30 },
  { name: 'Allergic Rhinitis', icd: 'J30.4', prevalence: 85, minAge: 3 },
  { name: 'Sinusitis', icd: 'J32', prevalence: 50, minAge: 5 },
  { name: 'Glaucoma', icd: 'H40', prevalence: 25, minAge: 40 },
  { name: 'Benign Prostatic Hyperplasia', icd: 'N40', prevalence: 35, minAge: 45, gender: 'Male' },
  { name: 'PCOS', icd: 'E28.2', prevalence: 45, minAge: 15, gender: 'Female' },
  { name: 'Chronic Obstructive Pulmonary Disease', icd: 'J44', prevalence: 25, minAge: 35 },
  { name: 'Urinary Tract Infection (Recurrent)', icd: 'N39.0', prevalence: 40, minAge: 1, gender: 'Female' },
  { name: 'Osteoporosis', icd: 'M81', prevalence: 30, minAge: 45, gender: 'Female' },
  { name: 'Hearing Loss (Age-Related)', icd: 'H91.9', prevalence: 35, minAge: 55 },
];

const ALLERGIES = [
  'Penicillin','Sulfa drugs','Aspirin','NSAIDs','Doxycycline','Ciprofloxacin',
  'Pollen','Dust Mites','Latex','Peanuts','Shellfish','Milk','Eggs',
  'Sunscreen','Nickel','Iodine contrast','Codeine','Morphine',
];

const ALLERGY_WEIGHTS = [25, 15, 10, 12, 5, 5, 30, 25, 3, 8, 5, 6, 4, 2, 4, 3, 2, 2];

const MEDICATIONS_BY_CONDITION = {
  'Hypertension': ['Amlodipine 5mg','Telmesartan 40mg','Metoprolol 25mg','Enalapril 5mg','Chlorthalidone 12.5mg'],
  'Type 2 Diabetes Mellitus': ['Metformin 500mg','Empagliflozin 10mg','Glimepiride 2mg','Insulin Glargine','Dapagliflozin 10mg'],
  'Vitamin D Deficiency': ['Cholecalciferol 60K IU weekly','Calcitriol 0.25mcg'],
  'Iron Deficiency Anemia': ['Ferrous Sulphate 200mg','Iron Sucrose IV','Folic Acid 5mg'],
  'Hypothyroidism': ['Levothyroxine 50mcg','Levothyroxine 100mcg','Levothyroxine 25mcg'],
  'Dental Caries': ['Amoxicillin 500mg','Metronidazole 400mg','Ibuprofen 400mg','Chlorhexidine Mouthwash'],
  'GERD': ['Omeprazole 20mg','Pantoprazole 40mg','Domperidone 10mg','Ranitidine 150mg'],
  'Migraine': ['Sumatriptan 50mg','Propranolol 40mg','Topiramate 25mg','Naproxen 500mg'],
  'Bronchial Asthma': ['Salbutamol Inhaler','Fluticasone Inhaler','Montelukast 10mg','Formoterol/Budesonide'],
  'Osteoarthritis': ['Paracetamol 500mg','Glucosamine 1500mg','Etoricoxib 60mg','Calcium + Vitamin D'],
  'Cataract': ['Latanoprost 0.005%','Timolol 0.5%','Tropicamide 1%','Nepafenac 0.1%'],
  'Coronary Artery Disease': ['Atorvastatin 20mg','Aspirin 75mg','Clopidogrel 75mg','Metoprolol 25mg'],
  'Chronic Kidney Disease': ['Calcium Carbonate','Sodium Bicarbonate','Erythropoietin','Furosemide 40mg'],
  'Gout': ['Allopurinol 300mg','Colchicine 0.5mg','Febuxostat 40mg'],
  'Dyslipidemia': ['Atorvastatin 10mg','Rosuvastatin 10mg','Fenofibrate 160mg'],
  'Anxiety Disorder': ['Sertraline 50mg','Clonazepam 0.5mg','Escitalopram 10mg','Buspirone 5mg'],
  'Depression': ['Fluoxetine 20mg','Sertraline 50mg','Mirtazapine 15mg','Venlafaxine 75mg'],
  'Allergic Rhinitis': ['Cetirizine 10mg','Levocetirizine 5mg','Fluticasone Nasal Spray','Montelukast 10mg'],
  'Sinusitis': ['Amoxicillin-Clavulanate 625mg','Doxycycline 100mg','Fluticasone Nasal','Pseudoephedrine 60mg'],
  'Glaucoma': ['Latanoprost 0.005%','Timolol 0.5%','Brinzolamide 1%','Bimatoprost 0.03%'],
  'Benign Prostatic Hyperplasia': ['Tamsulosin 0.4mg','Finasteride 5mg','Dutasteride 0.5mg'],
  'PCOS': ['Metformin 500mg','Spironolactone 25mg','Combined OCP','Myo-Inositol'],
  'COPD': ['Tiotropium Inhaler','Fluticasone/Salmeterol','Theophylline 200mg','Salbutamol PRN'],
  'UTI': ['Nitrofurantoin 100mg','Cephalexin 500mg','Fosfomycin 3g','Ciprofloxacin 250mg'],
  'Osteoporosis': ['Alendronate 70mg weekly','Calcium + Vitamin D','Denosumab 60mg','Raloxifene 60mg'],
};

const STAFF_ROLES = ['NURSE','BILLING','RECEPTION','COORDINATOR','ADMIN','PHARMACY','DIAGNOSTICS'];
const STAFF_ROLE_WEIGHTS = [25, 15, 20, 10, 5, 15, 10];

const APPOINTMENT_STATUSES = ['SCHEDULED','CONFIRMED','CHECKED_IN','WAITING','WITH_DOCTOR','COMPLETED','CANCELLED','NO_SHOW'];
const APPOINTMENT_WEIGHTS = [15, 25, 10, 5, 5, 25, 10, 5];
const CONSULT_MODES = ['VIDEO','IN_CLINIC','PHONE'];
const CONSULT_WEIGHTS = [20, 70, 10];

// Indian postal codes by state
const PINCODES = {
  'TS': ['500001','500034','506001','505001','507001','503001','509001','504001','502001','508001'],
  'AP': ['530001','520001','522001','524001','518001','517501','533001','533101','515001','516001'],
  'KA': ['560001','570001','580001','575001','590001','577001','583101','585101','577201','572101'],
  'TN': ['600001','641001','625001','620001','636001','627001','638001','632001','628001','624001'],
  'MH': ['400001','411001','440001','400601','422001','431001','413001','416001','444601','400701'],
  'DL': ['110001','110075','110085','110017','110024','110061','110088','110058','110001','110016'],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function generateAge() {
  // Indian age distribution (young-skewed)
  const r = rng();
  if (r < 0.25) return randInt(0, 12);       // children
  if (r < 0.45) return randInt(13, 24);       // young adults
  if (r < 0.70) return randInt(25, 45);       // adults
  if (r < 0.88) return randInt(46, 60);       // middle-aged
  return randInt(61, 90);                       // seniors
}

function generateDOB(age) {
  const now = new Date();
  const year = now.getFullYear() - age;
  const month = randInt(0, 11);
  const day = randInt(1, 28);
  return new Date(year, month, day);
}

function pickState() {
  return pickWeighted(STATES, STATES.map(s => s.weight));
}

function pickCity(state) {
  return pick(state.cities);
}

function pickLanguage(state) {
  return pick(state.langs);
}

function pickPincode(state) {
  return pick(PINCODES[state.code] || ['500001']);
}

function generateAddress(state, city) {
  const street = pick(STREETS);
  const houseNo = randInt(1, 999);
  const pincode = pickPincode(state);
  return `${houseNo}, ${street}, ${city}, ${state.name} ${pincode}`;
}

function pickName(gender) {
  const first = gender === 'Male' ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
  const last = pick(LAST_NAMES);
  return `${first} ${last}`;
}

function pickDateInRange(daysBack) {
  const now = Date.now();
  const offset = rng() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - offset);
}

function pickSlotTime(date) {
  const d = new Date(date);
  const hour = randInt(9, 17);
  const min = pick([0, 15, 30, 45]);
  d.setHours(hour, min, 0, 0);
  return d;
}

function generateSlug(name, city, idx) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
    + '-' + city.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
    + '-' + idx;
}

function hashPhone(phone) {
  return createHash('sha256').update(phone).digest('hex').slice(0, 12);
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

function generateClinic(idx) {
  const state = pickState();
  const city = pickCity(state);
  const prefix = pick(CLINIC_PREFIXES);
  const suffix = pick(CLINIC_SUFFIXES);
  const name = `${prefix} ${city} ${suffix}`;
  const langs = state.langs.slice();
  if (!langs.includes('English')) langs.push('English');
  return {
    name,
    slug: generateSlug(prefix, city, idx),
    description: `${name} — providing quality healthcare in ${city}, ${state.name}.`,
    phoneNumber: generatePhone(20000000 + idx),
    addressLine1: `${randInt(1, 999)}, ${pick(STREETS)}`,
    city,
    state: state.name,
    pincode: pickPincode(state),
    languages: langs,
    timezone: 'Asia/Kolkata',
    facilities: pick(['Pharmacy','Lab','X-Ray','ECG','Ambulance','Physiotherapy','Dental'], randInt(2, 5)),
    services: pick(['OPD','IPD','Daycare','Teleconsultation','Health Checkup'], randInt(2, 4)),
    verificationStatus: pickWeighted(['VERIFIED','VERIFIED','VERIFIED','PENDING'], [70, 20, 5, 5]),
    operatingHours: {
      weekdays: '09:00-19:00', saturday: '09:00-14:00', sunday: 'CLOSED',
    },
  };
}

function generateDoctor(idx, clinicIds) {
  const gender = pick(['Male','Female']);
  const name = pickName(gender);
  const spec = pickWeighted(DOCTOR_SPECIALTIES, SPECIALTY_WEIGHTS);
  const quals = pick(QUALIFICATIONS_BY_SPEC[spec.id]);
  const state = pickState();
  const city = pickCity(state);
  const fee = pickWeighted([500,600,700,800,900,1000,1200,1500], [15,15,20,15,10,10,8,7]);
  const lang = state.langs.slice();
  if (!lang.includes('English')) lang.push('English');
  // assign 1-3 clinics
  const numClinics = randInt(1, Math.min(3, clinicIds.length));
  const assignedClinicIds = [];
  const shuffledIds = [...clinicIds].sort(() => rng() - 0.5);
  for (let i = 0; i < numClinics; i++) {
    assignedClinicIds.push(shuffledIds[i % shuffledIds.length]);
  }
  return {
    name,
    phone: generatePhone(10000000 + idx),
    wyshId: uniqueId('WYSH-DOCTOR', idx),
    gender,
    specialization: spec.label,
    specialtyId: spec.id,
    subSpecializations: [],
    qualifications: quals,
    yearsOfExperience: randInt(3, 35),
    registrationNumber: `TSMC-${String(randInt(100000, 999999))}`,
    languages: lang,
    consultationFee: fee,
    approvalStatus: 'VERIFIED',
    clinicIds: assignedClinicIds,
  };
}

function generatePatient(idx) {
  const gender = pick(['Male','Female']);
  const name = pickName(gender);
  const age = generateAge();
  const dob = generateDOB(age);
  const state = pickState();
  const city = pickCity(state);
  const bloodGroup = pickWeighted(BLOOD_GROUPS, BLOOD_WEIGHTS);
  const langs = state.langs.slice();
  if (!langs.includes('English')) langs.push('English');
  const language = pick(langs);

  // Determine conditions based on age and gender
  const conditions = [];
  const conditionObjs = [];
  for (const c of CONDITIONS) {
    if (age < c.minAge) continue;
    if (c.gender && c.gender !== gender) continue;
    // Use prevalence to determine if patient has this condition
    if (rng() < c.prevalence / 1000) {
      const diagnosed = pickDateInRange(randInt(30, 3650));
      conditions.push({
        condition: c.name,
        icdCode: c.icd,
        diagnosedAt: diagnosed,
        status: pickWeighted(['ACTIVE','ACTIVE','ACTIVE','RESOLVED'], [70, 15, 10, 5]),
      });
      conditionObjs.push(c);
    }
  }

  // Allergies
  const patientAllergies = [];
  const allergyCount = Math.max(0, pickWeighted([0, 0, 1, 1, 2, 3], [40, 20, 20, 10, 5, 5]));
  for (let i = 0; i < allergyCount; i++) {
    const a = pickWeighted(ALLERGIES, ALLERGY_WEIGHTS);
    if (!patientAllergies.includes(a)) patientAllergies.push(a);
  }

  // Medications derived from conditions
  const medications = [];
  const medNames = [];
  for (const c of conditions) {
    if (c.status === 'ACTIVE') {
      const meds = MEDICATIONS_BY_CONDITION[c.condition];
      if (meds) {
        const med = pick(meds);
        if (!medNames.includes(med)) {
          medNames.push(med);
          medications.push(med);
        }
      }
    }
  }

  return {
    name,
    phone: generatePhone(30000000 + idx),
    wyshId: uniqueId('WYSH-PATIENT', idx),
    gender,
    age,
    dateOfBirth: dob,
    bloodGroup,
    language,
    state,
    city,
    addressLine1: `${randInt(1, 999)}, ${pick(STREETS)}`,
    pincode: pickPincode(state),
    chronicConditions: conditions.filter(c => c.status === 'ACTIVE').map(c => c.condition),
    allergiesSummary: patientAllergies,
    conditions,
    medications,
    isPhoneVerified: true,
  };
}

function generateAppointment(patient, doctorIdx, doctorUser, clinicId, idx) {
  const daysBack = randInt(1, 120);
  const date = new Date(Date.now() - daysBack * 86400000);
  const startAt = pickSlotTime(date);
  const endAt = new Date(startAt.getTime() + randInt(15, 45) * 60000);
  const status = pickWeighted(APPOINTMENT_STATUSES, APPOINTMENT_WEIGHTS);
  const mode = pickWeighted(CONSULT_MODES, CONSULT_WEIGHTS);
  const reasons = [
    'Routine checkup','Follow-up','Medication refill','Lab review','Symptoms evaluation',
    'Vaccination','Referral review','Chronic disease management','Acute illness','Preventive screening',
  ];
  return {
    id: `syn-appt-${idx}`,
    patientUserId: patient.id,
    doctorProfileId: doctorUser.doctorProfile.id,
    doctorUserId: doctorUser.doctorProfile.userId,
    clinicId,
    status,
    consultationMode: mode,
    reason: pick(reasons),
    slotStartAt: startAt,
    slotEndAt: endAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient();

async function main() {
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  WYSHCARE Synthea-style Data Generator`);
  console.log(`  Patients: ${PATIENT_COUNT.toLocaleString()}`);
  console.log(`  Doctors:  ${DOCTOR_COUNT.toLocaleString()}`);
  console.log(`  Clinics:  ${CLINIC_COUNT.toLocaleString()}`);
  console.log(`  Seed:     ${SEED}`);
  console.log(`══════════════════════════════════════════════════\n`);

  const startAll = Date.now();

  // ── CLEAR ────────────────────────────────────────────────────────────────

  if (args.clear) {
    console.log('🗑️  Clearing existing synthea data...');
    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { id: { startsWith: 'syn-' } } }),
      prisma.staffAssignment.deleteMany({ where: { id: { startsWith: 'syn-staff-' } } }),
      prisma.doctorClinic.deleteMany({ where: { doctor: { userId: { startsWith: 'syn-' } } } }),
      prisma.doctorProfile.deleteMany({ where: { userId: { startsWith: 'syn-' } } }),
      prisma.userRole.deleteMany({ where: { userId: { startsWith: 'syn-' } } }),
      prisma.user.deleteMany({ where: { id: { startsWith: 'syn-' } } }),
      prisma.clinic.deleteMany({ where: { id: { startsWith: 'syn-clinic-' } } }),
    ]);
    // Reset the user ID counter
    console.log('  Done.\n');
  }

  // ── CLINICS ──────────────────────────────────────────────────────────────

  console.log(`Creating ${CLINIC_COUNT} clinics...`);
  const clinicStart = Date.now();
  const clinicIds = [];

  for (let i = 0; i < CLINIC_COUNT; i += BATCH_SIZE) {
    const batch = [];
    const end = Math.min(i + BATCH_SIZE, CLINIC_COUNT);
    for (let j = i; j < end; j++) {
      const data = generateClinic(j + 1);
      batch.push({
        id: `syn-clinic-${String(j + 1).padStart(5, '0')}`,
        name: data.name,
        slug: data.slug,
        description: data.description,
        phoneNumber: data.phoneNumber,
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        languages: data.languages,
        timezone: data.timezone,
        facilities: data.facilities,
        services: data.services,
        verificationStatus: data.verificationStatus,
        operatingHours: data.operatingHours,
      });
    }
    const results = await prisma.$transaction(
      batch.map((d) => prisma.clinic.create({ data: d }))
    );
    results.forEach((c) => clinicIds.push(c.id));
    process.stdout.write(`  ${end}/${CLINIC_COUNT} clinics\r`);
  }
  console.log(`  ✅ ${CLINIC_COUNT} clinics in ${((Date.now() - clinicStart) / 1000).toFixed(1)}s`);

  // ── DOCTORS ──────────────────────────────────────────────────────────────

  console.log(`\nCreating ${DOCTOR_COUNT} doctors...`);
  const doctorStart = Date.now();
  const doctorUsers = [];

  for (let i = 0; i < DOCTOR_COUNT; i += BATCH_SIZE) {
    const batchData = [];
    const end = Math.min(i + BATCH_SIZE, DOCTOR_COUNT);
    for (let j = i; j < end; j++) {
      const d = generateDoctor(j + 1, clinicIds);
      const userId = `syn-doctor-user-${String(j + 1).padStart(6, '0')}`;
      batchData.push({
        id: userId,
        wyshId: d.wyshId,
        phoneNumber: d.phone,
        fullName: d.name,
        gender: d.gender,
        preferredLanguage: 'English',
        isPhoneVerified: true,
        chronicConditions: [],
        allergiesSummary: [],
        roles: { create: { role: 'DOCTOR' } },
        doctorProfile: {
          create: {
            specialization: d.specialization,
            subSpecializations: d.subSpecializations,
            qualifications: d.qualifications,
            yearsOfExperience: d.yearsOfExperience,
            registrationNumber: d.registrationNumber,
            languages: d.languages,
            consultationFee: d.consultationFee,
            approvalStatus: d.approvalStatus,
            clinicMappings: {
              create: d.clinicIds.map((cid, ci) => ({
                clinicId: cid,
                isPrimary: ci === 0,
                consultationFee: d.consultationFee + (ci > 0 ? randInt(-100, 200) : 0),
              })),
            },
          },
        },
      });
    }
    const users = await prisma.$transaction(
      batchData.map((data) => prisma.user.create({ data, include: { doctorProfile: true } }))
    );
    users.forEach((u) => doctorUsers.push(u));
    process.stdout.write(`  ${end}/${DOCTOR_COUNT} doctors\r`);
  }
  console.log(`  ✅ ${DOCTOR_COUNT} doctors in ${((Date.now() - doctorStart) / 1000).toFixed(1)}s`);

  // ── STAFF (clinic staff per clinic) ─────────────────────────────────────

  console.log(`\nCreating clinic staff...`);
  const staffStart = Date.now();
  let staffCount = 0;

  for (let ci = 0; ci < clinicIds.length; ci++) {
    const numStaff = randInt(2, 8);
    const staffBatch = [];
    for (let si = 0; si < numStaff; si++) {
      staffCount++;
      const staffRole = pickWeighted(STAFF_ROLES, STAFF_ROLE_WEIGHTS);
      const gender = pick(['Male','Female']);
      const name = pickName(gender);
      const phone = generatePhone(50000000 + staffCount);
      const userId = `syn-staff-${String(staffCount).padStart(6, '0')}`;

      let roleEnum;
      if (staffRole === 'NURSE') roleEnum = 'NURSE';
      else if (staffRole === 'PHARMACY') roleEnum = 'PHARMACY_PARTNER';
      else if (staffRole === 'DIAGNOSTICS') roleEnum = 'LAB_PARTNER';
      else roleEnum = 'ADMIN';

      staffBatch.push(
        prisma.user.create({
          data: {
            id: userId,
            wyshId: uniqueId('WYSH-STAFF', staffCount),
            phoneNumber: phone,
            fullName: name,
            preferredLanguage: 'English',
            isPhoneVerified: true,
            chronicConditions: [],
            allergiesSummary: [],
            roles: { create: { role: roleEnum } },
            staffAssignments: {
              create: {
                id: `syn-staff-${String(staffCount).padStart(6, '0')}`,
                clinicId: clinicIds[ci],
                role: staffRole,
                isActive: true,
              },
            },
          },
        })
      );
    }
    await prisma.$transaction(staffBatch);
    process.stdout.write(`  Clinic ${ci + 1}/${clinicIds.length} staff\r`);
  }
  console.log(`  ✅ ${staffCount} staff created in ${((Date.now() - staffStart) / 1000).toFixed(1)}s`);

  // ── PATIENTS ─────────────────────────────────────────────────────────────

  console.log(`\nCreating ${PATIENT_COUNT.toLocaleString()} patients...`);
  const patientStart = Date.now();
  const patientData = [];

  for (let i = 0; i < PATIENT_COUNT; i += BATCH_SIZE) {
    const batch = [];
    const end = Math.min(i + BATCH_SIZE, PATIENT_COUNT);
    for (let j = i; j < end; j++) {
      const p = generatePatient(j + 1);
      const userId = `syn-patient-${String(j + 1).padStart(7, '0')}`;
      // Store conditions + meds alongside ID for health record generation
      const snapshot = { id: userId, conditions: p.conditions, medications: p.medications };
      patientData.push(snapshot);
      batch.push(
        prisma.user.create({
          data: {
            id: userId,
            wyshId: p.wyshId,
            phoneNumber: p.phone,
            fullName: p.name,
            dateOfBirth: p.dateOfBirth,
            gender: p.gender,
            bloodGroup: p.bloodGroup,
            preferredLanguage: p.language,
            isPhoneVerified: p.isPhoneVerified,
            chronicConditions: p.chronicConditions,
            allergiesSummary: p.allergiesSummary,
            roles: { create: { role: 'PATIENT' } },
          },
        })
      );
    }
    await prisma.$transaction(batch);
    process.stdout.write(`  ${end.toLocaleString()}/${PATIENT_COUNT.toLocaleString()} patients\r`);
  }
  console.log(`\n  ✅ ${PATIENT_COUNT.toLocaleString()} patients in ${((Date.now() - patientStart) / 1000).toFixed(1)}s`);

  // ── CONDITIONS + HEALTH RECORDS ─────────────────────────────────────────

  console.log(`\nGenerating health conditions & records...`);
  const healthStart = Date.now();
  let healthCount = 0;
  let medAdminCount = 0;

  for (let i = 0; i < PATIENT_COUNT; i += Math.min(BATCH_SIZE, 20)) {
    const batch = [];
    const end = Math.min(i + 20, PATIENT_COUNT);
    for (let j = i; j < end; j++) {
      const pd = patientData[j];
      if (!pd) continue;

      for (const c of pd.conditions) {
        healthCount++;
        const hrId = `syn-hr-${String(healthCount).padStart(8, '0')}`;
        batch.push(
          prisma.healthRecord.create({
            data: {
              id: hrId,
              userId: pd.id,
              recordType: 'DIAGNOSTIC_REPORT',
              title: `${c.condition} - Diagnosis`,
              description: `Diagnosed with ${c.condition} (${c.icdCode}) on ${c.diagnosedAt.toISOString().slice(0, 10)}`,
              source: 'MANUAL_UPLOAD',
              storageKey: `synthea/records/${hrId}.pdf`,
              mimeType: 'application/pdf',
              fileSize: randInt(50000, 500000),
              extractedText: `${c.condition}: ${c.status} condition, ICD code ${c.icdCode}`,
              recordedAt: c.diagnosedAt,
            },
          })
        );
      }

      for (const med of pd.medications) {
        medAdminCount++;
        const hrId = `syn-hr-med-${String(medAdminCount).padStart(8, '0')}`;
        batch.push(
          prisma.healthRecord.create({
            data: {
              id: hrId,
              userId: pd.id,
              recordType: 'PRESCRIPTION',
              title: med,
              description: `Prescribed ${med}`,
              source: 'TELEMEDICINE',
              storageKey: `synthea/records/${hrId}.pdf`,
              mimeType: 'application/pdf',
              fileSize: randInt(30000, 200000),
              extractedText: `${med} - as prescribed`,
              recordedAt: pickDateInRange(randInt(7, 120)),
            },
          })
        );
      }
    }
    if (batch.length > 0) {
      await prisma.$transaction(batch);
    }
    process.stdout.write(`  ${Math.min(healthCount + medAdminCount).toLocaleString()} health records\r`);
  }
  console.log(`\n  ✅ ${healthCount} conditions + ${medAdminCount} medications in ${((Date.now() - healthStart) / 1000).toFixed(1)}s`);

  // ── APPOINTMENTS ─────────────────────────────────────────────────────────

  const APPT_COUNT = args.appointments ?? Math.min(PATIENT_COUNT * 2, 100000);
  console.log(`\nCreating ${APPT_COUNT.toLocaleString()} appointments...`);
  const apptStart = Date.now();
  let apptCreated = 0;

  for (let i = 0; i < APPT_COUNT; i += BATCH_SIZE) {
    const batch = [];
    const end = Math.min(i + BATCH_SIZE, APPT_COUNT);
    for (let j = i; j < end; j++) {
      apptCreated++;
      const patientIdx = j % patientIds.length;
      const doctorUser = doctorUsers[j % doctorUsers.length];
      const clinicId = pick(clinicIds);
      const appt = generateAppointment(
        { id: patientIds[patientIdx] },
        j,
        { doctorProfile: { id: doctorUser.doctorProfile.id, userId: doctorUser.id } },
        clinicId,
        apptCreated
      );
      batch.push(prisma.appointment.create({ data: appt }));
    }
    await prisma.$transaction(batch);
    process.stdout.write(`  ${end.toLocaleString()}/${APPT_COUNT.toLocaleString()} appointments\r`);
  }
  console.log(`\n  ✅ ${APPT_COUNT.toLocaleString()} appointments in ${((Date.now() - apptStart) / 1000).toFixed(1)}s`);

  // ── SUMMARY ──────────────────────────────────────────────────────────────

  const totalTime = ((Date.now() - startAll) / 1000).toFixed(1);
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  ✅ GENERATION COMPLETE`);
  console.log(`  ══════════════════════════════════════════════════`);
  console.log(`  Clinics:     ${CLINIC_COUNT}`);
  console.log(`  Doctors:     ${DOCTOR_COUNT}`);
  console.log(`  Staff:       ${staffCount}`);
  console.log(`  Patients:    ${PATIENT_COUNT.toLocaleString()}`);
  console.log(`  Conditions:  ${healthCount}`);
  console.log(`  Medications: ${medAdminCount}`);
  console.log(`  Appointments: ${APPT_COUNT.toLocaleString()}`);
  console.log(`  Duration:    ${totalTime}s`);
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
