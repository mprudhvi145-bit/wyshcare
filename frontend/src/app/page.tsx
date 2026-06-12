/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/page.tsx
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
 - Standalone (not imported by other source files)
 *
 * Calls:
 - ai-intelligence
 - health-twin-demo
 - future-section
 - doctor-experience
 - how-it-works
 - product-ecosystem
 - hero
 - social-proof
 *
 * Dependencies:
 - ai-intelligence
 - health-twin-demo
 - future-section
 - doctor-experience
 - how-it-works
 - product-ecosystem
 - hero
 - social-proof
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

import { Hero } from '@/components/marketing/hero';
import { TrustStrip } from '@/components/marketing/trust-strip';
import { ProblemSection } from '@/components/marketing/problem-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { ProductEcosystem } from '@/components/marketing/product-ecosystem';
import { HealthTwinDemo } from '@/components/marketing/health-twin-demo';
import { EmergencyReadiness } from '@/components/marketing/emergency-readiness';
import { AiIntelligence } from '@/components/marketing/ai-intelligence';
import { DoctorExperience } from '@/components/marketing/doctor-experience';
import { OsDashboardPreview } from '@/components/marketing/os-dashboard-preview';
import { HealthTimeline } from '@/components/marketing/health-timeline';
import { SocialProof } from '@/components/marketing/social-proof';
import { FutureSection } from '@/components/marketing/future-section';
import { FinalCTA } from '@/components/marketing/final-cta';
import { Footer } from '@/components/marketing/footer';

export default function LandingPage() {
  return (
    <div className="bg-[#0B0D10] min-h-screen">
      <Hero />
      <TrustStrip />
      <ProblemSection />
      <HowItWorks />
      <ProductEcosystem />
      <HealthTwinDemo />
      <EmergencyReadiness />
      <AiIntelligence />
      <DoctorExperience />
      <OsDashboardPreview />
      <HealthTimeline />
      <SocialProof />
      <FutureSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
