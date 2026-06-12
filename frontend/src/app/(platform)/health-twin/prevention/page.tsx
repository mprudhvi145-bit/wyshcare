/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/health-twin/prevention/page.tsx
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
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, RefreshCw, Clock, AlertCircle } from 'lucide-react'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const statusConfig: Record<string, { variant: 'warning' | 'success' | 'secondary' | 'danger'; icon: typeof Clock }> = {
  PENDING: { variant: 'warning', icon: Clock },
  COMPLETED: { variant: 'success', icon: CheckCircle },
  DISMISSED: { variant: 'secondary', icon: XCircle },
  OVERDUE: { variant: 'danger', icon: AlertCircle },
}

export default function PreventionPage() {
  const queryClient = useQueryClient()

  const { data: preventions, isLoading } = useQuery({
    queryKey: ['preventions', 'current'],
    queryFn: () => api.listPreventions('current'),
  })

  const generateMutation = useMutation({
    mutationFn: () => api.generatePreventions('current'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['preventions', 'current'] }),
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.completePrevention(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['preventions', 'current'] }),
  })

  const dismissMutation = useMutation({
    mutationFn: (id: string) => api.dismissPrevention(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['preventions', 'current'] }),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Prevention" description="Loading..." />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader
        title="Prevention"
        description="Personalized health recommendations"
      >
        <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
          <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          Generate Recommendations
        </Button>
      </PageHeader>

      {(!preventions || preventions.length === 0) && (
        <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
          <CardContent className="py-8 text-center text-white/50">
            No recommendations yet. Generate one to get started.
          </CardContent>
        </Card>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {(preventions || []).map((rec: any) => {
          const status = (statusConfig as any)[rec.status] ?? statusConfig.PENDING
          const StatusIcon = status.icon as React.ComponentType<{ className?: string }>
          return (
            <motion.div key={rec.id} variants={item}>
              <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-medium text-white/90">{rec.recommendation}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge>{rec.category}</Badge>
                        {rec.dueDate && (
                          <span className="flex items-center gap-1 text-xs text-white/50">
                            <Clock className="h-3 w-3" />
                            {new Date(rec.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant={status.variant}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {rec.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {rec.progress !== undefined && (
                    <div className="mb-4 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50">Progress</span>
                        <span className="font-medium">{Math.round(rec.progress)}%</span>
                      </div>
                      <Progress value={rec.progress} className="h-2" />
                    </div>
                  )}
                  {rec.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => completeMutation.mutate(rec.id)}
                        disabled={completeMutation.isPending}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dismissMutation.mutate(rec.id)}
                        disabled={dismissMutation.isPending}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
