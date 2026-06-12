/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/components/marketing/product-ecosystem.tsx
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
 * React component: product-ecosystem
 *
 * Responsibilities:
 * - Render UI components for Frontend
 * - Handle user interactions and state management
 *
 * Used By:
 - frontend/src/app/insurance/claims/page.tsx
 - frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 - frontend/src/components/marketing/health-twin-demo.tsx
 - frontend/src/app/(auth)/login/page.tsx
 *
 * Calls:
 - link
 - framer-motion
 *
 * Dependencies:
 - link
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

import Link from 'next/link';
import {
  Activity,
  Building,
  Heart,
  ScanLine,
  Shield,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

const PRODUCTS: {
  label: string;
  subtitle: string;
  description: string;
  tags: string[];
  href: string;
  icon: LucideIcon;
  accent: string;
  source: string;
}[] = [
  {
    label: 'WyshID',
    subtitle: 'Health Identity Platform',
    description: 'Your life-long health identity. One profile, one timeline, one AI assistant — connected across every provider, hospital, and pharmacy in India.',
    tags: ['Unified Profile', 'Health Timeline', 'AI Assistant', 'Cross-Provider'],
    href: '/wysh',
    icon: Heart,
    accent: '#8FD3D1',
    source: 'app/wysh/identity',
  },
  {
    label: 'WyshCare App',
    subtitle: 'Consumer Health OS',
    description: 'The central nervous system of your health. Track everything, understand everything, act on everything — from one beautifully simple dashboard.',
    tags: ['Health Score', 'Records', 'Family', 'Insights'],
    href: '/app',
    icon: Activity,
    accent: '#A8E6CF',
    source: 'app/dashboard',
  },
  {
    label: 'WyshCare OS',
    subtitle: 'Workspace & API Platform',
    description: 'The operating system for health builders. Manage patients, power AI workflows, integrate with any system through open APIs and webhooks.',
    tags: ['Workspace', 'Portal', 'AI Agents', 'Marketplace'],
    href: '/os',
    icon: ScanLine,
    accent: '#F0E68C',
    source: 'app/os/overview',
  },
  {
    label: 'WyshCare Clinic',
    subtitle: 'Clinic Management System',
    description: 'The purpose-built EHR for Indian clinics. Smart scheduling, AI-assisted SOAP notes, and integrated payments — designed for the way you practice.',
    tags: ['Clinic Management', 'EHR', 'Telemedicine', 'Billing'],
    href: '/clinic',
    icon: Stethoscope,
    accent: '#FFB4A2',
    source: 'app/clinic/dashboard',
  },
  {
    label: 'WyshCare Insurance',
    subtitle: 'Insurance Operating System',
    description: 'AI-powered underwriting, claims processing, and member management. Built for the next generation of Indian health insurance.',
    tags: ['Underwriting', 'Claims', 'Provider Network', 'Fraud Detection'],
    href: '/insurance',
    icon: Shield,
    accent: '#B4A0FF',
    source: 'app/insurance/overview',
  },
  {
    label: 'WyshCare Enterprise',
    subtitle: 'Enterprise Health Platform',
    description: 'White-label health infrastructure for hospitals, labs, pharmacies, and enterprises. Deploy WyshCare as your own branded health platform.',
    tags: ['Hospitals', 'Labs', 'Pharmacy', 'Enterprise'],
    href: '/enterprise',
    icon: Building,
    accent: '#FFD93D',
    source: 'app/enterprise/overview',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function ProductEcosystem() {
  return (
    <section className="py-24 md:py-32 overflow-hidden bg-[#0B0D10]">
      <style>{`
        .product-section {
          position: relative;
        }
        .product-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 600px 300px at 50% 0%, rgba(143,211,209,0.06) 0%, transparent 100%),
            radial-gradient(ellipse 400px 200px at 80% 60%, rgba(180,160,255,0.04) 0%, transparent 100%),
            radial-gradient(ellipse 300px 200px at 20% 40%, rgba(168,230,207,0.04) 0%, transparent 100%);
          pointer-events: none;
        }
        .product-card {
          background: #15181D;
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .product-card:hover {
          border-color: var(--accent);
          box-shadow: 0 0 30px rgba(143,211,209,0.06);
        }
        .product-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent);
          opacity: 0.4;
          transition: opacity 0.3s ease;
        }
        .product-card:hover::after {
          opacity: 1;
        }
      `}</style>

      <div className="product-section max-w-7xl mx-auto lg:px-8 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-4"
        >
          The WyshCare Ecosystem
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center mb-16 text-base md:text-lg max-w-2xl mx-auto text-white/60"
        >
          Six integrated products. One unified health platform. One identity that connects them all.
        </motion.p>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {PRODUCTS.map((product) => {
            const Icon = product.icon;
            return (
              <motion.div key={product.label} variants={cardVariants}>
                <Link href={product.href} className="block group h-full">
                  <div
                    className="product-card h-full rounded-2xl p-6 md:p-8 flex flex-col"
                    style={{ '--accent': product.accent } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{
                          background: `${product.accent}15`,
                          border: `1px solid ${product.accent}20`,
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: product.accent }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono"
                        style={{ color: 'rgba(255,255,255,0.25)' }}
                      >
                        0{PRODUCTS.indexOf(product) + 1}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                      {product.label}
                    </h3>
                    <p
                      className="text-xs md:text-sm font-medium mb-3"
                      style={{ color: product.accent }}
                    >
                      {product.subtitle}
                    </p>
                    <p className="text-sm leading-relaxed mb-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {product.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-xs rounded-full"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.55)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
