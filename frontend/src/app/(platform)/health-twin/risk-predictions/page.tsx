/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/health-twin/risk-predictions/page.tsx
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
 - badge
 - skeleton
 - api-client
 - button
 - lucide-react
 - progress
 *
 * Dependencies:
 - react-query
 - card
 - badge
 - skeleton
 - api-client
 - button
 - lucide-react
 - progress
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

'use client'

import { api } from '@/lib/api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Activity, AlertTriangle, Shield, Brain, Heart, RefreshCw } from 'lucide-react'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const riskTypeIcons: Record<string, typeof Activity> = {
  CARDIOVASCULAR: Heart, DIABETES: Activity, NEUROLOGICAL: Brain,
  RESPIRATORY: Activity, CANCER: AlertTriangle, GENERAL: Shield,
}

const riskLevelColors: Record<string, string> = {
  CRITICAL: 'bg-red-500 hover:bg-red-500',
  HIGH: 'bg-orange-500 hover:bg-orange-500',
  MODERATE: 'bg-yellow-500 hover:bg-yellow-500',
  LOW: 'bg-green-500 hover:bg-green-500',
}

function formatLabel(str: string) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function RiskPredictionsPage() {
  const queryClient = useQueryClient()

  const { data: history, isLoading } = useQuery({
    queryKey: ['risk-history'],
    queryFn: () => api.getRiskHistory('current'),
  })

  const assessMutation = useMutation({
    mutationFn: () => api.assessRisk('current'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['risk-history'] }),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Risk Predictions" description="Loading..." />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  const sorted = [...(history || [])].sort(
    (a: any, b: any) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
  )

  return (
    <div className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader
        title="Risk Predictions"
        description="AI-powered health risk assessment"
      >
        <Button onClick={() => assessMutation.mutate()} disabled={assessMutation.isPending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${assessMutation.isPending ? 'animate-spin' : ''}`} />
          Run Full Assessment
        </Button>
      </PageHeader>

      {sorted.length === 0 && (
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardContent className="py-8 text-center text-white/50">No risk predictions yet. Run an assessment to get started.</CardContent></Card>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {sorted.map((prediction: any) => {
          const Icon = riskTypeIcons[prediction.riskType] || Shield
          return (
            <motion.div key={prediction.id} variants={item}>
              <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white/90">
                    <span className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-[#8FD3D1]" />
                      {formatLabel(prediction.riskType)}
                    </span>
                    <Badge className={riskLevelColors[prediction.riskLevel] || ''}>
                      {prediction.riskLevel}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">Risk Score</span>
                      <span className="font-medium">{Math.round(prediction.riskScore)}%</span>
                    </div>
                    <Progress value={prediction.riskScore} className="h-2" />
                  </div>

                  {prediction.drivers?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white/60">Key Drivers</p>
                      <ul className="list-disc pl-5 text-sm text-white/50 space-y-0.5">
                        {prediction.drivers.map((d: string, i: number) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {prediction.recommendedActions?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white/60">Recommended Actions</p>
                      <ul className="list-disc pl-5 text-sm text-white/50 space-y-0.5">
                        {prediction.recommendedActions.map((a: string, i: number) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-white/40">
                    Assessed {new Date(prediction.calculatedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
