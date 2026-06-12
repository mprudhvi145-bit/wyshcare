/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/design/page.tsx
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
 * React component: page
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/doctor/emr/dermatology/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/ui/progress.tsx
 *
 * Calls:
 - react
 - framer-motion
 *
 * Dependencies:
 - react
 - framer-motion
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

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse,
  Activity,
  Brain,
  Video,
  Shield,
  FlaskConical,
  Pill,
  DollarSign,
  Stethoscope,
  Settings,
  Search,
  Sparkles,
  Sliders,
  Check,
  Clock,
  Droplets,
  Copy,
  Heart,
  AlertTriangle,
  Upload
} from 'lucide-react';

// Unified colors for display
const COLOR_PALETTE = [
  { name: 'Deep Graphite', hex: '#080A0D', description: 'Main background and canvas surface' },
  { name: 'Soft Black', hex: '#020304', description: 'Solid structure cards and header panels' },
  { name: 'AI Teal', hex: '#00E5FF', description: 'Active paths, AI intelligence focus' },
  { name: 'Mint', hex: '#00E676', description: 'Healthy status, verified entries, success' },
  { name: 'Warm White', hex: '#FFFFFF', description: 'Primary typography and high contrast reads' },
  { name: 'Health Amber', hex: '#FFB300', description: 'Attention required, alerts, warning' },
  { name: 'Critical Coral', hex: '#FF3D00', description: 'Emergency profile indicators, allergies' },
];

const MODULES = [
  {
    id: 'wyshid',
    name: 'WyshID Dashboard',
    icon: HeartPulse,
    color: '#00E5FF',
    tagline: 'Biological Identity Pass',
    vision: 'A digital biological identity passport replacing fragmented patient credentials, insurance slips, and login prompts. It acts as the user\'s sovereign medical root key, linking physical presence with digital health records instantly.',
    strategy: 'Leverage physical wallet card aesthetics (inspired by Apple Wallet Passes) combined with high-contrast credentials, interactive biometric verification, and immediate scanner compatibility.',
    ia: 'WyshID Sovereign Card (Full Name, unique WyshID, ABHA state, QR code) -> Real-time Vitals Triage Stats -> Active Insurance Coverage & Emergency Badges.',
    flow: 'User taps WyshID on locking screen -> Auths via FaceID/biometrics -> Full wallet pass slides forward with active QR and critical medical flags -> Receptionist scans QR to securely mount patient context in EMR.',
    layout: 'Oversized glass-morphic ID card dominates top viewport. Secondary grid displays primary emergency metrics (blood type, critical allergies, active ICE contacts) with immediate tap targets.',
    components: 'GlassCard (blur 24px, subtle border), VerifiedBadge (mint badge, breathing pulse anim), SecureQRNode (dynamic high-contrast QR display container).',
    responsive: 'Mobile displays single-column card with 100% viewport width. Desktop maps card to a sticky side panel alongside live logs and system options.',
    motion: 'Flip transition: Card rotates 180 degrees using a spring-loaded transform to reveal authorization logs and ABHA status.',
    accessibility: 'Color contrast ratio > 4.5:1 on ID codes, support for text magnification settings, and label mappings for screen readers on the QR block.',
    empty: 'Display a ghost outline card with the label: "Sovereign Biological ID Unlinked. Tap to generate WyshID using ABHA details."',
    error: 'Auth Fail: ID card outline glows coral, triggers haptic shake animation, and displays: "Biometric authentication failed. Verify PIN to proceed."',
    ai: 'AI automatically updates QR payloads in the background to reflect changes in active allergies or emergency medical conditions.',
    ideas: 'Integrate directly with iOS Apple Wallet APIs (.pkpass creation) and utilize secure local NFC nodes to tap-and-share profile at registered hospital entries.'
  },
  {
    id: 'timeline',
    name: 'Health Timeline',
    icon: Activity,
    color: '#00E676',
    tagline: 'My Health Story',
    vision: 'Reinvent records logs into a cohesive narrative stream. Instead of folders of reports, the user visualizes their health story, explaining what happened, why it happened, what changes were made, and what to watch next.',
    strategy: 'Chronological timeline layout inspired by Google Maps and photos timeline. Entries group related factors (consultation -> medication update -> vitals changes) together.',
    ia: 'Search & Filters -> Chronological Timeline Track -> Nested Event Cards -> Context Action Buttons.',
    flow: 'User scrolls timeline -> Clicks Consultation Event -> Card expands to show Doctor, SOAP Summary, Prescribed Pill, and subsequent heart rate trend lines.',
    layout: 'Left-aligned chronological axis connecting event nodes. Right panel displays the active event detail view with metrics graphs and doctors notes.',
    components: 'TimelineAxisLine, EventNode (styled by event type: Consultation, Lab, Pill), DetailExpansionPanel.',
    responsive: 'Mobile collapses to a single story track. Desktop renders dual columns: scrollable timeline list on the left, full rich content view on the right.',
    motion: 'Connecting axis line draws downward as the page scrolls; event details expand outward with framer-motion layout transitions.',
    accessibility: 'Timeline items are grouped into semantic chronological sections. Date labels are read aloud, and color-coded status states include text fallbacks.',
    empty: 'Welcome: "No medical history recorded yet. Sync your wearable or upload a diagnostic file to start your health story."',
    error: 'Network Timeout: "Could not sync latest health events. Displaying cached local copy. Retrying in background..."',
    ai: 'AI highlights causal links on the timeline: e.g. "We observed an 8% drop in resting heart rate after you adjusted your dosage on May 12."',
    ideas: 'Generative interactive map showing geographic coordinates of consultations, lab visits, and allergy triggers over time.'
  },
  {
    id: 'ai-insights',
    name: 'AI Health Insights',
    icon: Brain,
    color: '#00E5FF',
    tagline: 'Personal Health Intelligence',
    vision: 'Provide users with a proactive, simulated understanding of their health trajectory. Rather than simple graphs, it simulates the long-term impact of changes to their routine.',
    strategy: 'Tesla-style predictive dashboards. Interactive sliders let users modify lifestyle variables (sleep, activity, nutrition) and see projected changes to risk profiles.',
    ia: 'Overall Health Index Ring -> Predictive Sliders Panel -> Risk Forecast Graph -> AI Medical Explainer.',
    flow: 'User opens Insights -> Swipes to Health Twin -> Drags sleep slider up by 1.5 hours -> Simulated twin shows projected life expectancy gains and cardiovascular risk drops.',
    layout: 'Top: Health Score Ring. Middle: Lifestyle variable sliders. Bottom: Double risk gauge widget and scientific references.',
    components: 'RadialScoreRing, SimulationSlider, RiskForecastGauge, ReferenceChip.',
    responsive: 'Mobile places sliders and risk gauges in a tabbed vertical workspace. Desktop presents side-by-side controls and interactive charts.',
    motion: 'Risk forecast gauges slide and morph in real-time as user interacts with sliders. Score count digits roll like an odometer.',
    accessibility: 'Sliders are fully keyboard controllable with explicit ARIA value labels. Color changes indicating risk are paired with clear text status alerts.',
    empty: 'Tracking Required: "Personal Health Twin is offline. Log 3 days of wearable data to activate simulation mode."',
    error: 'Data Anomaly: "Sliders disabled. Wearable sensor telemetry is inconsistent. Review connection before testing simulations."',
    ai: 'AI runs outcome simulations using deep predictive modeling, presenting insights with clear logic ("What it means", "What to do next").',
    ideas: 'Simulated Twin scenario uploads: test the hypothetical impact of starting a new running plan or switching to a low-sodium diet.'
  },
  {
    id: 'telemedicine',
    name: 'Telemedicine',
    icon: Video,
    color: '#0A84FF',
    tagline: 'Digital Care Room',
    vision: 'A virtual consultation room. It moves beyond video calls, showing the doctor and patient a shared timeline, medical records, and AI summaries in a single workspace.',
    strategy: 'Design a dashboard layout with video feed alongside interactive clinical timelines, shared medical memories, and real-time summaries.',
    ia: 'Video Canvas Panel -> Patient Record Panel (Shared) -> Active Chat & File Drops -> Doctor\'s Order Board.',
    flow: 'User joins consultation -> Doctor references the timeline on the side -> Doctor drafts a prescription -> Patient sees and approves it directly in the room.',
    layout: 'Grid view: left pane is the video stream, right pane is the interactive patient history, and bottom section shows live transcript and diagnostic plans.',
    components: 'VideoPortal, SharedTimelineCard, LivePrescriptionBuilder, TriageStatusBar.',
    responsive: 'Mobile scales video to full width and floats patient timeline as a swipe-up sheet. Desktop runs a side-by-side workspace.',
    motion: 'Sidebar tabs slide open and shut. Resizing the video box triggers smooth layout transitions.',
    accessibility: 'Real-time transcript captions displayed in high-contrast text overlay, screen readers announce when the physician updates orders.',
    empty: 'Lobby: "Waiting for the clinical provider to connect. Your camera, mic, and health feed are connected and ready."',
    error: 'Disconnect: "Video connection disrupted. Reconnecting. Vitals monitoring and chat remain online."',
    ai: 'AI listens to call audio, updates the shared timeline, and drafts the clinical SOAP note in real-time.',
    ideas: 'Simultaneous translation for cross-border consultations, translating doctor summaries in real-time to the patient\'s language.'
  },
  {
    id: 'emergency',
    name: 'Emergency Profile',
    icon: Shield,
    color: '#FFB300',
    tagline: 'Digital Medical Passport',
    vision: 'A high-contrast passport for responders, designed to be read in under 10 seconds. In an emergency, it displays vital data without requiring device authentication.',
    strategy: 'Maximum contrast, minimal screen complexity. Bold color blocks (Red/Yellow/Green) display blood type, allergies, conditions, and contacts.',
    ia: 'Critical Flag Banner -> Demographics & Blood Type -> Allergies & Conditions -> ICE Contacts (Fast Call).',
    flow: 'Responder triggers Emergency bypass on phone -> Profile page displays -> Responder views blood type and penicillin allergy -> Tap Sarah Vance to call.',
    layout: 'Single-panel layout. Top displays high-contrast medical conditions, middle highlights active medications, bottom displays ICE tap-to-call links.',
    components: 'EmergencyPassCard, CriticalBadge (coral background), ICEContactChip.',
    responsive: 'Oversized text and buttons on mobile for rapid access. Desktop provides detailed editor fields alongside the passport view.',
    motion: 'ICE contacts trigger a call countdown overlay when tapped, allowing the action to be cancelled within 3 seconds.',
    accessibility: 'Meets WCAG AAA contrast requirements (>7:1). Font resizing supports maximum system text sizes.',
    empty: 'Pass Incomplete: "Emergency Profile is unpopulated. Enter your blood type and ICE contacts to create your pass."',
    error: 'Encryption Error: "Unable to sync cloud profile changes. Local Emergency Passport is active and displays correct data."',
    ai: 'AI scans doctor notes and diagnostics files, flagging newly identified allergies or medications for the Emergency Profile.',
    ideas: 'Automatic alert dispatch to emergency contacts sharing the patient\'s live location when the emergency profile is accessed.'
  },
  {
    id: 'emr',
    name: 'EMR Dashboard',
    icon: FlaskConical,
    color: '#AF52DE',
    tagline: 'Clinical Intelligence Workspace',
    vision: 'A documentation workspace for physicians that turns traditional, complex EMR pages into a clean, visual tool focused on patient context and treatment decisions.',
    strategy: 'Provide a unified patient dashboard that keeps the SOAP note editor, patient timeline, diagnostic history, and AI assistance on a single screen.',
    ia: 'Active Patient Info -> SOAP Note Editor Panel -> Timeline & Diagnostic History -> Doctor Actions Panel.',
    flow: 'Doctor enters clinical room -> Reviews timeline on right -> Types notes on left -> AI drafts prescription and diagnostic orders.',
    layout: 'Left pane: SOAP note input. Right pane: active patient context, clinical history, and AI diagnostics. Bottom: action bar.',
    components: 'SOAPEditorNode, ClinicalTimeline, OrderGenerator, ClinicalSuggestionChip.',
    responsive: 'Mobile display features a condensed consultation queue and patient notes field. Desktop shows full workspace controls.',
    motion: 'Tapping an AI clinical recommendation slides it into the SOAP note editor smoothly.',
    accessibility: 'Keyboard-only navigation shortcuts (e.g. sign encounter, create prescription) to reduce wrist strain.',
    empty: 'Lobby: "Encounter queue is empty. Select a patient from the queue to open clinical workspace."',
    error: 'Auto-Save Error: "Failed to sync to database. Session stored locally in memory. Do not close tab."',
    ai: 'AI converts unstructured clinical conversations into structured ICD-10 medical codes.',
    ideas: 'Integrate automatic peer review checklists that compare draft prescriptions against the patient\'s genetic history.'
  },
  {
    id: 'family',
    name: 'Family Health',
    icon: Heart,
    color: '#FF3D00',
    tagline: 'Care Command Center',
    vision: 'A unified dashboard for parents and caregivers to track medical compliance, vaccinations, active risks, and emergencies for kids, parents, and elder relatives.',
    strategy: 'Clean cards show family members, highlighting who needs attention, upcoming appointments, and missing records.',
    ia: 'Family Grid -> Compliance & Schedule -> Shared Health Insurance -> Household Emergency Status.',
    flow: 'Parent opens Family Health -> Notices daughter\'s pending vaccination alert -> Taps alert -> Doctor\'s booking scheduler opens.',
    layout: 'Top: Family member profile selector. Bottom left: upcoming care tasks. Bottom right: compliance indicators and records status.',
    components: 'FamilyCardWidget, MemberProfileIcon, ComplianceProgressBar.',
    responsive: 'Mobile shows a swipeable horizontal list of family members. Desktop provides a multi-profile grid dashboard.',
    motion: 'Tapping a family member\'s profile expands the card to show their timeline and metrics details.',
    accessibility: 'All charts use distinct patterns alongside colors, screen readers describe health statuses for each family member.',
    empty: 'Circle Empty: "Care Circle is empty. Invite family members, dependents, or care circles to start tracking."',
    error: 'Invite Fail: "Invite link expired. Resend invitation to grandmother@wyshcare.com."',
    ai: 'AI identifies vaccine schedules, schedules appointments, and alerts the family caregiver to shared risks (e.g. seasonal asthma triggers).',
    ideas: 'Sync with smart home trackers to alert family members when air quality index degrades asthma symptoms.'
  },
  {
    id: 'locker',
    name: 'Health Locker',
    icon: FlaskConical,
    color: '#AF52DE',
    tagline: 'Personal Medical Memory',
    vision: 'A smart locker that indexes documents and processes them with OCR, allowing natural language search of medical records.',
    strategy: 'Google-style search dashboard with result chips. Tapping a result displays the document with OCR highlights.',
    ia: 'Search Input -> Result Category filter chips -> Scanned Document List -> Drag & Drop Upload Zone.',
    flow: 'User uploads a PDF lab report -> AI runs OCR -> AI generates summary and creates timeline link -> User searches and finds it.',
    layout: 'Top: Search bar. Middle: result folders. Bottom: Upload zone with status logs.',
    components: 'SearchBarWidget, DocumentRowCard, CategoryFilterChip, FileUploadProgress.',
    responsive: 'Mobile features a clean search interface with camera upload. Desktop displays search alongside document previews.',
    motion: 'Uploaded files animate into the list, and result details expand with a smooth slide transition.',
    accessibility: 'Upload drop zones are keyboard navigable. OCR output is converted to accessible screen-readable text.',
    empty: 'Locker Empty: "No health files found. Drag and drop health PDFs, reports, or prescription photos to begin."',
    error: 'Processing Error: "Unable to process PDF. File is password protected. Enter password to run OCR."',
    ai: 'AI processes PDF scans, creates summaries, translates medical terms, and links files to timeline events.',
    ideas: 'Secure auto-import from diagnostics labs and clinics when diagnostic orders are completed.'
  },
  {
    id: 'medcenter',
    name: 'Medication Center',
    icon: Pill,
    color: '#00E676',
    tagline: 'Intelligent Dispensing Log',
    vision: 'An organizer that tracks daily pill schedules, dosage directions, and inventory counts to help users stay on track.',
    strategy: 'Clean checklist with swipe actions (swipe right to log taken, left to skip) and prominent refill alerts.',
    ia: 'Daily Dose Checklist -> Refill & Pharmacy Tracker -> Medication Details -> Interaction Alert Banner.',
    flow: 'User gets notification -> Opens app -> Tap "Log Taken" -> Pill count decreases -> Compliance score increases.',
    layout: 'Left: Daily dose log. Right: active prescriptions details and pill inventory trackers.',
    components: 'PillCheckItem, RefillProgressGauge, MedicationConflictAlert.',
    responsive: 'Mobile features large tap targets for easy logging. Desktop displays a weekly calendar showing compliance trends.',
    motion: 'Checking a dose triggers a pill morphing animation. Interaction warnings pulse to draw attention.',
    accessibility: 'All medication cards display physical descriptions (e.g. round yellow pill) alongside instructions.',
    empty: 'Checklist Clean: "No medications scheduled for today. Tap the plus icon to add a prescription."',
    error: 'Interaction Alert: "Warning: Drug conflict detected between Albuterol and Metoprolol. Contact Dr. Chen."',
    ai: 'AI monitors compliance, notices delays, and suggests updates to the scheduling schedule.',
    ideas: 'Connected medicine cabinet compatibility to log doses automatically when the container is opened.'
  },
  {
    id: 'insurance',
    name: 'Insurance & Claims',
    icon: DollarSign,
    color: '#0A84FF',
    tagline: 'Sovereign Coverage Tracker',
    vision: 'Replace confusing insurance statements with simple visual bars tracking deductibles, claims, and coverage limits.',
    strategy: 'Clean visual overview showing deductible progress, co-pays, and claim approvals.',
    ia: 'Coverage Policy Card -> Deductible Progress Bar -> Claim Queue -> Pre-Auth Directory.',
    flow: 'User pays co-pay -> Clinic uploads bill -> Claim updates to "Processed" -> Reimbursement routes to wallet.',
    layout: 'Top: Digital insurance card and deductible progress. Bottom: Active claims list with filter options.',
    components: 'InsuranceCardWidget, CoverageBar, ClaimTimelineRow.',
    responsive: 'Mobile shows a clean insurance card interface. Desktop displays detailed tables with PDF download options.',
    motion: 'Claim cards expand to show step-by-step progress when clicked.',
    accessibility: 'High-contrast text labels for progress bars, and screen readers read claim values in a structured list format.',
    empty: 'No Insurance: "No active insurance coverage linked. Link your insurer network to track claims."',
    error: 'Claim Denied: "Claim rejected. Reason: Service out-of-network. Tap to start appeal process."',
    ai: 'AI scans clinical notes and diagnostic codes, pre-filling claim sheets to prevent rejections.',
    ideas: 'Automated instant claim approval at pharmacy checkout, eliminating out-of-pocket waiting periods.'
  },
  {
    id: 'doctor',
    name: 'Doctor Dashboard',
    icon: Stethoscope,
    color: '#00E5FF',
    tagline: 'Clinical Queue Console',
    vision: 'A unified view for doctors to manage patient queues, wait times, appointments, and overall clinic performance.',
    strategy: 'Multi-pane overview of patient queue states, wait-time details, and scheduled consultations.',
    ia: 'Clinic Queue Track -> Patient Status Summary -> Queue Performance Analytics -> Shared Messages Panel.',
    flow: 'Doctor opens dashboard -> Selects next patient -> Taps "Open Workspace" -> Launching Patient EMR view.',
    layout: 'Left column lists active patients. Right panel displays clinic analytics and messages.',
    components: 'QueueRowCard, AnalyticsBar, TriageStatusIcon.',
    responsive: 'Mobile features a queue tracker list. Desktop displays queue list, messages, and performance graphs side-by-side.',
    motion: 'Dragging a patient from "Waiting" to "Active" shifts the card with a smooth sliding transition.',
    accessibility: 'Keyboard shortcuts let doctors navigate queue items easily.',
    empty: 'Queue Empty: "No patient visits scheduled. All queue registers are empty."',
    error: 'Sync Offline: "Queue failed to refresh. Retrying connection..."',
    ai: 'AI reads triage reports and patient vitals to prioritize patients based on clinical urgency.',
    ideas: 'Predictive queue algorithms that suggest scheduling adjustments to minimize patient wait times.'
  },
  {
    id: 'admin',
    name: 'Admin Console',
    icon: Settings,
    color: '#FFB300',
    tagline: 'System Operations Control',
    vision: 'A central control panel for monitoring services, managing API integrations, and reviewing audit logs.',
    strategy: 'High-contrast dashboard showing service health, latency, active sessions, and integration details.',
    ia: 'Service Health Grid -> Live System Metrics -> User Access Management -> Integration Panel.',
    flow: 'Admin reviews server logs -> Identifies latency spike -> Checks integrations -> Toggles diagnostic services.',
    layout: 'Top: health metrics. Middle: service integration toggles. Bottom: live audit log stream.',
    components: 'SystemHealthIndicator, MetricChartWidget, LogListRow.',
    responsive: 'Mobile shows system health alerts. Desktop displays full analytics graphs and configuration controls.',
    motion: 'Metrics charts update in real-time, scrolling dynamically as data arrives.',
    accessibility: 'Full screen-reader description support for charts and metrics values.',
    empty: 'Logs Clean: "No warnings or system alerts recorded in the last 24 hours."',
    error: 'Database Alert: "Connection to replica databases lost. Core services remain active on primary nodes."',
    ai: 'AI flags anomalies in logs and suggests adjustments to server capacities.',
    ideas: 'Speech-based notifications to alert system administrators when critical service levels drop.'
  }
];

export default function DesignLabPage() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'explorer' | 'prototypes'>('tokens');
  const [selectedModule, setSelectedModule] = useState<(typeof MODULES)[number]>(MODULES[0]!);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Health Twin Simulation State
  const [cardio, setCardio] = useState(30); // minutes/day
  const [sleep, setSleep] = useState(7); // hours/night
  const [nutrition, setNutrition] = useState(70); // score 1-100
  const [hydration, setHydration] = useState(1.5); // liters/day

  // Memory Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Health Locker Upload Simulator
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Calculate simulated Health Twin parameters
  const calculateSimulatedStats = () => {
    // Baseline life expectancy: 78.4 years
    let lifeExpectancy = 78.4;
    
    // Cardio adjustment: +0.08 years per minute over 15m up to +3 years
    if (cardio > 15) {
      lifeExpectancy += Math.min(3, (cardio - 15) * 0.08);
    } else {
      lifeExpectancy -= (15 - cardio) * 0.15;
    }

    // Sleep adjustment: 7-8 hours is sweet spot. Deviation hurts.
    if (sleep >= 7 && sleep <= 9) {
      lifeExpectancy += (sleep - 7) * 0.5 + 1.0;
    } else if (sleep < 7) {
      lifeExpectancy -= (7 - sleep) * 1.2;
    } else {
      lifeExpectancy -= (sleep - 9) * 0.6;
    }

    // Nutrition: up to +2 years or -2.5 years
    lifeExpectancy += (nutrition - 60) * 0.08;

    // Hydration: sweet spot 2.5L.
    lifeExpectancy += Math.min(1.5, (hydration - 1.0) * 0.8);

    // Limit decimal points
    const finalAge = Math.min(92.0, Math.max(62.0, parseFloat(lifeExpectancy.toFixed(1))));

    // Cardiology risk indicator
    let cardioRisk = 'Normal';
    let riskColor = 'text-[#00E676]';
    let riskPct = 12;

    const riskScore = (100 - nutrition) * 0.4 + (8 - sleep) * 5 + (30 - cardio) * 0.8;
    if (riskScore > 35) {
      cardioRisk = 'High Risk';
      riskColor = 'text-[#FF3D00]';
      riskPct = Math.min(94, Math.round(riskScore * 1.5));
    } else if (riskScore > 18) {
      cardioRisk = 'Moderate Risk';
      riskColor = 'text-[#FFB300]';
      riskPct = Math.min(50, Math.round(riskScore * 1.8));
    } else {
      cardioRisk = 'Optimal';
      riskColor = 'text-[#00E676]';
      riskPct = Math.max(4, Math.round(riskScore * 0.8));
    }

    return { finalAge, cardioRisk, riskColor, riskPct };
  };

  const simulatedStats = calculateSimulatedStats();

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleSearchMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      if (query.includes('penicillin')) {
        setSearchResult({
          title: 'May 12, 2024 — Dr. Robert Chen',
          summary: 'Prescribed Penicillin V Potassium (250mg, Oral Tablet) for acute strep throat infection. Dosage: 1 tablet every 6 hours for 10 days.',
          tags: ['Prescription', 'Cardiology Alert Check', 'Timeline Linked'],
          status: 'Resolved',
          color: '#FF3D00'
        });
      } else if (query.includes('heart') || query.includes('cardio') || query.includes('arrhythmia')) {
        setSearchResult({
          title: 'May 14, 2024 — Dr. Robert Chen (Cardiology)',
          summary: 'Arrhythmia review. ECG readings indicated trace intervals of premature ventricular contractions. Metoprolol 25mg prescribed.',
          tags: ['Consultation', 'Wearable Alerts matched', 'Active Risk'],
          status: 'Monitored',
          color: '#00E5FF'
        });
      } else {
        setSearchResult({
          title: 'No Direct Prescription Match',
          summary: `No direct medical locker results for "${searchQuery}". AI Search scanned 14 connected clinical summaries and found no matching drug interactions or historical records.`,
          tags: ['System Scan Completed'],
          status: 'Clear',
          color: '#FFFFFF'
        });
      }
      setIsSearching(false);
    }, 800);
  };

  const handleUploadFile = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadedFiles((files) => [...files, `report_${Date.now().toString().slice(-4)}.pdf`]);
          setTimeout(() => setUploadProgress(-1), 1000);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#080A0D] text-white p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Block */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-[#00E5FF] to-[#0A84FF] rounded-xl shadow-lg shadow-[#00E5FF]/20">
                <HeartPulse className="h-6 w-6 text-black" />
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight font-display">WYSHCARE</h1>
                <p className="text-xs uppercase tracking-[0.25em] text-[#00E5FF] font-semibold mt-0.5">
                  Design & Reinvention Lab
                </p>
              </div>
            </div>
            <p className="text-sm text-white/50 mt-3 max-w-2xl font-light">
              Designing the future operating system for healthcare. Experiencing visual systems, responsive frameworks, and interactive biological simulators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-[#00E676]/10 px-3 py-1 text-xs text-[#00E676] font-medium border border-[#00E676]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E676] animate-pulse" />
              Visual Architecture: 10 Years Ahead
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-[#00E5FF]/10 px-3 py-1 text-xs text-[#00E5FF] font-medium border border-[#00E5FF]/20">
              <Sparkles className="h-3 w-3" />
              AI Synthesizer Active
            </span>
          </div>
        </header>

        {/* Tab Controls */}
        <div className="flex border-b border-white/5 p-1 bg-white/5 rounded-2xl max-w-md">
          {(['tokens', 'explorer', 'prototypes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 capitalise ${
                activeTab === tab
                  ? 'bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/20 font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'tokens' && 'Design System'}
              {tab === 'explorer' && 'Module Specs'}
              {tab === 'prototypes' && 'Live Prototypes'}
            </button>
          ))}
        </div>

        {/* Dynamic Panel View */}
        <AnimatePresence mode="wait">
          {activeTab === 'tokens' && (
            <motion.div
              key="tokens"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Color strategy Grid */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-white">Color Strategy & Palette</h2>
                  <p className="text-sm text-white/50 font-light mt-1">
                    Calibrated specifically to invoke feeling of reassurance, control, and absolute clarity.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {COLOR_PALETTE.map((color) => (
                    <div
                      key={color.name}
                      onClick={() => handleCopyColor(color.hex)}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 hover:border-white/20 hover:bg-white/10 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="h-10 w-10 rounded-xl shadow-lg border border-white/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs text-white/40 font-mono flex items-center gap-1 group-hover:text-[#00E5FF] transition-colors">
                          <Copy className="h-3 w-3" />
                          {color.hex}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">{color.name}</h3>
                      <p className="text-xs text-white/50 font-light leading-relaxed">{color.description}</p>

                      {copiedColor === color.hex && (
                        <div className="absolute inset-0 bg-[#00E5FF] text-black flex items-center justify-center font-bold text-sm">
                          Copied {color.hex}!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography hierarchy */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-display text-white">Typography Scale</h2>
                    <p className="text-sm text-white/50 font-light mt-1">
                      Calm, authoritative typography hierarchy tailored for accessibility and rapid legibility.
                    </p>
                  </div>

                  <div className="space-y-6 bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-[10px] text-white/40 font-mono block mb-1">Display (56px) - Tracking -0.03em</span>
                      <p className="text-5xl font-semibold tracking-tight text-white leading-none">92.4 Years</p>
                    </div>
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-[10px] text-white/40 font-mono block mb-1">H1 (40px) - Tracking -0.02em</span>
                      <p className="text-3xl font-semibold text-white leading-none">Personal Intelligence</p>
                    </div>
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-[10px] text-white/40 font-mono block mb-1">H2 (32px) - Tracking -0.015em</span>
                      <p className="text-2xl font-medium text-white leading-none">My Health Story Timeline</p>
                    </div>
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-[10px] text-white/40 font-mono block mb-1">H3 (24px) - Tracking -0.01em</span>
                      <p className="text-xl font-medium text-white leading-none">Alexander Vance WyshID</p>
                    </div>
                    <div className="border-b border-white/5 pb-4">
                      <span className="text-[10px] text-white/40 font-mono block mb-1">Body (16px) - Line Height 1.6</span>
                      <p className="text-sm text-white/70 font-light leading-relaxed">
                        Patient has record of sinus tachycardia under stress. Vitals checked and logged automatically by biological twin sensor.
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 font-mono block mb-1">Caption (14px) - Tracking 0.02em</span>
                      <p className="text-xs text-white/50 font-medium tracking-wider uppercase">Active Coverage Linked</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold font-display text-white">Motion Dynamics</h2>
                    <p className="text-sm text-white/50 font-light mt-1">
                      Meaningful feedback curves mimicking Apple Vision Pro and Tesla consoles.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6">
                    <div>
                      <span className="text-xs text-white/50 font-medium block mb-3">Custom Bezier Motion Spring</span>
                      <div className="flex gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className="px-6 py-3 bg-[#00E5FF] text-black font-bold rounded-xl text-sm shadow-lg shadow-[#00E5FF]/20"
                        >
                          Interactive Spring Button
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          className="px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl text-sm hover:bg-white/10"
                        >
                          Secondary Option
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-white/50 font-medium block">Radial Glow Pulse (AI state indication)</span>
                      <div className="h-24 rounded-2xl border border-[#00E5FF]/20 overflow-hidden relative flex items-center justify-center bg-black/40">
                        <motion.div
                          animate={{
                            opacity: [0.15, 0.45, 0.15],
                            scale: [0.98, 1.02, 0.98],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="absolute inset-0 bg-radial from-[#00E5FF]/20 via-transparent to-transparent pointer-events-none"
                        />
                        <span className="text-xs text-[#00E5FF] font-semibold flex items-center gap-1.5 z-10">
                          <Brain className="h-4 w-4 animate-bounce" />
                          AI Thinking Engine Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'explorer' && (
            <motion.div
              key="explorer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left sidebar: modules index */}
              <div className="lg:col-span-4 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">Select Core Module</h2>
                  <p className="text-xs text-white/50">Redesigned from first principles</p>
                </div>

                {MODULES.map((mod) => {
                  const IconComp = mod.icon;
                  const isSelected = selectedModule.id === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModule(mod)}
                      className={`w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-white/10 border-l-4 border-[#00E5FF] text-white'
                          : 'bg-white/5 hover:bg-white/10 border-l-4 border-transparent text-white/60 hover:text-white'
                      }`}
                    >
                      <div
                        className="p-2 rounded-xl text-black"
                        style={{ backgroundColor: mod.color }}
                      >
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{mod.name}</h4>
                        <p className="text-[11px] text-white/40 mt-0.5">{mod.tagline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right panel: Module details specs */}
              <div className="lg:col-span-8 bg-white/5 rounded-3xl p-6 border border-white/10 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                      <span
                        className="p-2.5 rounded-2xl text-black flex items-center justify-center"
                        style={{ backgroundColor: selectedModule.color }}
                      >
                        {(() => {
                          const Icon = selectedModule.icon;
                          return <Icon className="h-6 w-6" />;
                        })()}
                      </span>
                      {selectedModule.name}
                    </h2>
                    <p className="text-[#00E5FF] text-xs font-semibold tracking-wider uppercase mt-1">
                      {selectedModule.tagline}
                    </p>
                  </div>
                </div>

                {/* Specs list Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar text-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">1. Product Vision</h4>
                    <p className="text-white/70 font-light leading-relaxed">{selectedModule.vision}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">2. UX Strategy</h4>
                    <p className="text-white/70 font-light leading-relaxed">{selectedModule.strategy}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">3. Information Architecture</h4>
                    <p className="text-white/70 font-mono text-xs leading-relaxed">{selectedModule.ia}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">4. User Flows</h4>
                    <p className="text-white/70 font-light leading-relaxed">{selectedModule.flow}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">5. Screen Layouts</h4>
                    <p className="text-white/70 font-light leading-relaxed">{selectedModule.layout}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">6. Component System</h4>
                    <p className="text-white/70 font-mono text-xs leading-relaxed">{selectedModule.components}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">7. Responsive Behavior</h4>
                    <p className="text-white/70 font-light leading-relaxed">{selectedModule.responsive}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">8. Motion Design</h4>
                    <p className="text-white/70 font-light leading-relaxed">{selectedModule.motion}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">9. Accessibility</h4>
                    <p className="text-white/70 font-light leading-relaxed">{selectedModule.accessibility}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">10. Empty States</h4>
                    <p className="text-white/70 font-light leading-relaxed">{selectedModule.empty}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">11. Error States</h4>
                    <p className="text-[#FF3D00] font-light leading-relaxed">{selectedModule.error}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">12. AI Interactions</h4>
                    <p className="text-[#00E676] font-light leading-relaxed">{selectedModule.ai}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2 border-t border-white/5 pt-4 mt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5FF]">13. Future Expansion Ideas</h4>
                    <p className="text-[#00E5FF] font-medium leading-relaxed">{selectedModule.ideas}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'prototypes' && (
            <motion.div
              key="prototypes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Grid with 2 columns of Live Prototypes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. HEALTH TWIN SIMULATOR */}
                <div className="bg-[#020304]/80 rounded-3xl p-6 border border-white/10 space-y-6 flex flex-col relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#00E5FF]/20 rounded-xl text-[#00E5FF]">
                      <Brain className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold font-display">Health Twin Simulation Engine</h3>
                      <p className="text-xs text-white/50">Outcome simulation & Life expectancy adjustments</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-4 rounded-2xl border border-white/5">
                    {/* Ring Visualization */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="h-28 w-28 rounded-full border-4 border-dashed border-[#00E5FF]/30 flex flex-col items-center justify-center relative bg-radial from-[#00E5FF]/10 via-transparent to-transparent">
                        <span className="text-3xl font-bold font-display text-white">{simulatedStats.finalAge}</span>
                        <span className="text-[9px] uppercase tracking-widest text-[#00E5FF] font-semibold mt-1">Yrs Project</span>
                      </div>
                      <span className="text-xs text-white/40 mt-3 font-medium">Life Expectancy</span>
                    </div>

                    {/* Risk parameters */}
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Cardiovascular Risk</span>
                          <span className={`font-semibold ${simulatedStats.riskColor}`}>{simulatedStats.cardioRisk}</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${simulatedStats.riskPct}%`,
                              backgroundColor:
                                simulatedStats.riskPct > 55
                                  ? '#FF3D00'
                                  : simulatedStats.riskPct > 25
                                  ? '#FFB300'
                                  : '#00E676',
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">Diabetes Type 2 Risk</span>
                          <span className="font-semibold text-white">Normal</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#00E676] transition-all duration-300"
                            style={{ width: `${Math.max(8, 100 - nutrition)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sliders console */}
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60 flex items-center gap-1">
                          <Activity className="h-3 w-3 text-[#00E5FF]" />
                          Cardio Activity (daily)
                        </span>
                        <span className="font-semibold text-white">{cardio} mins</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        value={cardio}
                        onChange={(e) => setCardio(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#FFB300]" />
                          Sleep Duration
                        </span>
                        <span className="font-semibold text-white">{sleep} hours</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="12"
                        step="0.5"
                        value={sleep}
                        onChange={(e) => setSleep(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60 flex items-center gap-1">
                          <Sliders className="h-3 w-3 text-[#00E676]" />
                          Dietary Quality (score)
                        </span>
                        <span className="font-semibold text-white">{nutrition}/100</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={nutrition}
                        onChange={(e) => setNutrition(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60 flex items-center gap-1">
                          <Droplets className="h-3 w-3 text-[#00E5FF]" />
                          Daily Hydration (liters)
                        </span>
                        <span className="font-semibold text-white">{hydration}L</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.1"
                        value={hydration}
                        onChange={(e) => setHydration(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. EMERGENCY PROFILE PASSPORT */}
                <div className="bg-[#020304]/80 rounded-3xl p-6 border border-white/10 space-y-6 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#FF3D00]/20 rounded-xl text-[#FF3D00]">
                      <Shield className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold font-display">Emergency Pass (Lock-screen Overlay)</h3>
                      <p className="text-xs text-white/50">Zero-authentication medical credentials in 10s</p>
                    </div>
                  </div>

                  {/* Wallet Passport Mockup */}
                  <div className="bg-[#FF3D00] text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-white/20">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest bg-black/30 rounded-full px-2 py-0.5 font-bold">
                          WyshCare OS
                        </span>
                        <h4 className="text-lg font-bold mt-1 tracking-tight">EMERGENCY MEDICAL PASS</h4>
                      </div>
                      <Shield className="h-8 w-8 text-white opacity-80" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/20 p-3 rounded-xl">
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block">Blood Group</span>
                        <span className="text-lg font-bold tracking-tight">O Positive</span>
                      </div>

                      <div className="bg-black/20 p-3 rounded-xl border border-white/20">
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block">Allergies</span>
                        <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-white" />
                          Penicillin
                        </span>
                      </div>

                      <div className="bg-black/20 p-3 rounded-xl col-span-2">
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block">Active Conditions</span>
                        <span className="text-sm font-semibold">Chronic Asthma (Requires Inhaler)</span>
                      </div>
                    </div>

                    <div className="border-t border-white/20 pt-4 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/60 block">ICE Emergency Contact</span>
                        <span className="text-sm font-bold">Sarah Vance (Spouse)</span>
                      </div>
                      <a
                        href="tel:+15550192831"
                        className="px-4 py-2 bg-white text-black font-bold rounded-xl text-xs hover:bg-white/95 transition-colors"
                      >
                        Call ICE Contact
                      </a>
                    </div>
                  </div>

                  <p className="text-xs text-white/40 leading-relaxed font-light">
                    Responders tap the locked WyshCare icon, triggering FaceID bypass to instantly access this high-contrast profile card.
                  </p>
                </div>

                {/* 3. MEDICAL MEMORY SEARCH */}
                <div className="bg-[#020304]/80 rounded-3xl p-6 border border-white/10 space-y-6 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#AF52DE]/20 rounded-xl text-[#AF52DE]">
                      <Search className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold font-display">Medical Memory Search Console</h3>
                      <p className="text-xs text-white/50">Natural language search across medical records</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <form onSubmit={handleSearchMemory} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder='Search query (e.g. "penicillin" or "heart")'
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:border-[#00E5FF] transition-all"
                        />
                        <Search className="absolute right-3 top-3.5 h-4 w-4 text-white/40" />
                      </div>
                      <button
                        type="submit"
                        disabled={isSearching}
                        className="px-4 bg-[#00E5FF] text-black font-bold rounded-xl text-xs hover:bg-[#00E5FF]/90 transition-colors"
                      >
                        {isSearching ? 'Searching...' : 'Search'}
                      </button>
                    </form>

                    <AnimatePresence mode="wait">
                      {searchResult ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white/70">{searchResult.title}</h4>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${searchResult.color}15`, color: searchResult.color }}
                            >
                              {searchResult.status}
                            </span>
                          </div>
                          <p className="text-sm text-white/80 font-light leading-relaxed">{searchResult.summary}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {searchResult.tags.map((tag: string) => (
                              <span key={tag} className="text-[10px] bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full text-white/50">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <div className="text-center py-8 text-white/30 border border-dashed border-white/5 rounded-2xl">
                          <Sparkles className="h-6 w-6 mx-auto mb-2 text-white/20" />
                          <p className="text-xs">Search for "penicillin" or "heart" to simulate a natural language query.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="text-xs text-white/40 leading-relaxed font-light">
                    AI OCR engines parse uploaded medical paperwork, extracting dosing directives, allergies, and diagnoses into searchable memory indexes.
                  </p>
                </div>

                {/* 4. MY HEALTH STORY TIMELINE */}
                <div className="bg-[#020304]/80 rounded-3xl p-6 border border-white/10 space-y-6 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#00E676]/20 rounded-xl text-[#00E676]">
                      <Activity className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold font-display">"My Health Story" Chronologue</h3>
                      <p className="text-xs text-white/50">Chronological history with AI contextual bridges</p>
                    </div>
                  </div>

                  {/* Interactive timeline track */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Event 1 */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="h-7 w-7 rounded-full bg-[#FF3D00]/20 border border-[#FF3D00]/40 flex items-center justify-center text-[#FF3D00] text-xs font-bold shrink-0">
                          M
                        </span>
                        <div className="w-0.5 h-16 bg-white/10" />
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-white/40 font-mono">Today, 08:00</span>
                          <span className="text-[9px] uppercase tracking-wider text-[#FF3D00] font-semibold">Active Prescription</span>
                        </div>
                        <h4 className="text-sm font-bold">Metoprolol 25mg taken</h4>
                        <p className="text-xs text-white/60 font-light">Prescribed by Dr. Robert Chen for PVC Arrhythmia management.</p>
                      </div>
                    </div>

                    {/* AI Context Bridge */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-12 bg-white/10" />
                      </div>
                      <div className="bg-radial from-[#00E5FF]/5 to-transparent border border-[#00E5FF]/20 rounded-xl px-4 py-2 flex-1 flex items-center gap-2">
                        <Brain className="h-4.5 w-4.5 text-[#00E5FF] shrink-0" />
                        <p className="text-xs text-[#00E5FF] font-light">
                          Wearable telemetry logged standard PVC frequency drop 45 minutes after dose ingestion.
                        </p>
                      </div>
                    </div>

                    {/* Event 2 */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-0.5 h-2 bg-white/10" />
                        <span className="h-7 w-7 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] text-xs font-bold shrink-0">
                          C
                        </span>
                        <div className="w-0.5 h-8 bg-white/10" />
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-white/40 font-mono">May 14, 2024</span>
                          <span className="text-[9px] uppercase tracking-wider text-[#00E5FF] font-semibold">Cardiology Visit</span>
                        </div>
                        <h4 className="text-sm font-bold">Arrhythmia review (Robert Chen)</h4>
                        <p className="text-xs text-white/60 font-light">
                          Observed trace heart rate anomalies during exercise review. Prescription issued.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-white/40 leading-relaxed font-light">
                    The health timeline shows patients what occurred and the physiological cause and effect.
                  </p>
                </div>

                {/* 5. HEALTH LOCKER FILE UPLOAD AND OCR DEMONSTRATION */}
                <div className="bg-[#020304]/80 rounded-3xl p-6 border border-white/10 space-y-6 flex flex-col justify-between lg:col-span-2">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#00E5FF]/20 rounded-xl text-[#00E5FF]">
                      <Upload className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold font-display">Personal Medical Memory — Document Upload & OCR Analyzer</h3>
                      <p className="text-xs text-white/50">Processing clinical paperwork to enrich the biological story</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left dropzone */}
                    <div className="space-y-4">
                      <div
                        onClick={handleUploadFile}
                        className="border-2 border-dashed border-white/10 hover:border-[#00E5FF]/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-all"
                      >
                        <Upload className="h-10 w-10 text-white/30 mb-3" />
                        <h4 className="text-sm font-bold">Drag clinical files here</h4>
                        <p className="text-xs text-white/40 mt-1">Accepts PDF, JPG, PNG reports</p>
                        <button className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 font-semibold transition-colors">
                          Choose File
                        </button>
                      </div>

                      {uploadProgress >= 0 && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-[#00E5FF]">Running OCR and clinical indexing...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00E5FF] transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right files processed list */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                      <span className="text-xs font-bold text-white/50 uppercase tracking-wider block border-b border-white/5 pb-2">
                        Processed Records Memory ({uploadedFiles.length + 3})
                      </span>
                      
                      <div className="space-y-2">
                        {/* Static records */}
                        <div className="flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-xl border border-white/5">
                          <span className="font-mono text-white/70">blood_report_lipid.pdf</span>
                          <span className="text-[#00E676] font-semibold flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Timeline Updated
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-xl border border-white/5">
                          <span className="font-mono text-white/70">ecg_report_chen.pdf</span>
                          <span className="text-[#00E676] font-semibold flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Twin Calibrated
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-xl border border-white/5">
                          <span className="font-mono text-white/70">immunization_record.pdf</span>
                          <span className="text-[#00E676] font-semibold flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            ICE Ready
                          </span>
                        </div>

                        {/* Dynamically uploaded files */}
                        {uploadedFiles.map((file) => (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={file}
                            className="flex items-center justify-between text-xs bg-[#00E5FF]/10 p-2.5 rounded-xl border border-[#00E5FF]/20"
                          >
                            <span className="font-mono text-[#00E5FF] font-semibold">{file}</span>
                            <span className="text-[#00E676] font-semibold flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              AI Parsed
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
