/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/health-twin/family-history/page.tsx
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
 - badge
 - skeleton
 - api-client
 - button
 - lucide-react
 *
 * Dependencies:
 - react-query
 - card
 - react
 - badge
 - skeleton
 - api-client
 - button
 - lucide-react
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

import { useState } from 'react'
import { api } from '@/lib/api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Plus, Trash2 } from 'lucide-react'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function FamilyHistoryPage() {
  const queryClient = useQueryClient()
  const [relation, setRelation] = useState('')
  const [condition, setCondition] = useState('')
  const [diagnosisAge, setDiagnosisAge] = useState('')

  const { data: entries, isLoading } = useQuery({
    queryKey: ['family-history'],
    queryFn: () => api.listFamilyHistory('current'),
  })

  const addMutation = useMutation({
    mutationFn: (data: { relation: string; condition: string; diagnosisAge: number }) =>
      api.addFamilyHistory('current', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-history'] })
      setRelation('')
      setCondition('')
      setDiagnosisAge('')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.removeFamilyHistory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['family-history'] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!relation || !condition || !diagnosisAge) return
    addMutation.mutate({ relation, condition, diagnosisAge: Number(diagnosisAge) })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Family History" description="Loading..." />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-[#0B0D10] min-h-screen p-6 space-y-6">
      <PageHeader title="Family History" description="Track hereditary conditions" />

      <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
        <CardHeader><CardTitle className="flex items-center gap-2 text-white/90"><Plus className="h-5 w-5" /> Add Entry</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
            <select value={relation} onChange={(e) => setRelation(e.target.value)} className="flex h-10 rounded-md border border-white/10 bg-[#1C2025] text-white/90 px-3 py-2 text-sm">
              <option value="">Relation</option>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Sibling">Sibling</option>
              <option value="Grandparent">Grandparent</option>
              <option value="Aunt">Aunt</option>
              <option value="Uncle">Uncle</option>
              <option value="Cousin">Cousin</option>
            </select>
            <input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Condition" className="flex h-10 rounded-md border border-white/10 bg-[#1C2025] text-white/90 px-3 py-2 text-sm placeholder:text-white/30" />
            <input value={diagnosisAge} onChange={(e) => setDiagnosisAge(e.target.value)} type="number" placeholder="Age at diagnosis" className="flex h-10 w-36 rounded-md border border-white/10 bg-[#1C2025] text-white/90 px-3 py-2 text-sm placeholder:text-white/30" />
            <Button type="submit" disabled={addMutation.isPending}><Plus className="mr-1 h-4 w-4" /> Add</Button>
          </form>
        </CardContent>
      </Card>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {entries?.length === 0 && (
          <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]"><CardContent className="py-8 text-center text-white/50">No family history recorded yet.</CardContent></Card>
        )}
        {entries?.map((entry: any) => (
          <motion.div key={entry.id} variants={item}>
            <Card className="bg-[#15181D] border border-[rgba(255,255,255,0.06)]">
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary"><Heart className="mr-1 h-3 w-3" />{entry.relation}</Badge>
                    <span className="font-medium text-white/90">{entry.condition}</span>
                  </div>
                  <p className="text-sm text-white/50">Diagnosed at age {entry.diagnosisAge}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(entry.id)} disabled={removeMutation.isPending}>
                  <Trash2 className="h-4 w-4 text-[#FF5A5A]" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
