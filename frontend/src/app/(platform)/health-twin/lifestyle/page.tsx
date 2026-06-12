/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/health-twin/lifestyle/page.tsx
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
 - frontend/src/hooks/use-emergency.ts
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - react-query
 - card
 - react
 - skeleton
 - api-client
 - button
 - lucide-react
 - framer-motion
 *
 * Dependencies:
 - react-query
 - card
 - react
 - skeleton
 - api-client
 - button
 - lucide-react
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
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Moon, Sun, Activity, Apple, Droplets, Brain, Monitor, Ban, Wine, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { api } from '@/lib/api-client';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const userId = 'current';

const fields = [
  { key: 'sleepHours', label: 'Sleep Hours', icon: Moon, type: 'number', suffix: ' hrs' },
  { key: 'sleepQuality', label: 'Sleep Quality', icon: Moon, type: 'select', options: ['Poor', 'Fair', 'Good', 'Excellent'] },
  { key: 'activityLevel', label: 'Activity Level', icon: Activity, type: 'select', options: ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'] },
  { key: 'exerciseDays', label: 'Exercise Days/Week', icon: Sun, type: 'number', suffix: ' days' },
  { key: 'dietType', label: 'Diet Type', icon: Apple, type: 'select', options: ['Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Mediterranean'] },
  { key: 'waterIntake', label: 'Water Intake', icon: Droplets, type: 'number', suffix: ' cups' },
  { key: 'stressLevel', label: 'Stress Level', icon: Brain, type: 'select', options: ['Low', 'Moderate', 'High', 'Very High'] },
  { key: 'screenTime', label: 'Screen Time', icon: Monitor, type: 'number', suffix: ' hrs' },
  { key: 'smokingStatus', label: 'Smoking', icon: Ban, type: 'select', options: ['Never', 'Former', 'Occasional', 'Regular'] },
  { key: 'alcoholConsumption', label: 'Alcohol', icon: Wine, type: 'select', options: ['None', 'Occasional', 'Moderate', 'Heavy'] },
];

export default function LifestylePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['lifestyle', userId],
    queryFn: () => api.getLifestyle(userId),
  });
  const [form, setForm] = useState<Record<string, any>>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.updateLifestyle(userId, payload),
  });

  function handleChange(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 bg-white/5" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <motion.div variants={item}>
        <PageHeader title="Lifestyle" description="Track and manage your daily lifestyle habits" />
      </motion.div>
      <motion.div variants={item}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <Card key={field.key} className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Icon className="h-4 w-4 text-white/40" />
                    <CardTitle className="text-sm font-medium text-white/90">{field.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {field.type === 'number' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={form[field.key] ?? ''}
                          onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
                          className="w-20 rounded-lg border border-white/10 bg-[#1C2025] text-white/90 px-3 py-1.5 text-sm focus:border-[#8FD3D1] focus:outline-none"
                        />
                        <span className="text-xs text-white/40">{field.suffix}</span>
                      </div>
                    ) : (
                      <select
                        value={form[field.key] ?? ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#1C2025] text-white/90 px-3 py-1.5 text-sm focus:border-[#8FD3D1] focus:outline-none"
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
