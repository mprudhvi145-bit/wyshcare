/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/(platform)/app/ai-navigator/page.tsx
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

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Send, User, Bot, MessageSquare, Stethoscope, Pill, Heart,
  Lightbulb, History, Trash2, Loader2, Sparkles,
} from 'lucide-react';

const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D] backdrop-blur-xl';
const glassCardCompact = 'rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02]';
const inputStyle = 'rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 font-ui outline-none focus:border-[#8FD3D1]/40 focus:bg-white/[0.05] transition-all';

type Message = {
  id: string; role: 'user' | 'assistant'; content: string; timestamp: Date;
};

const suggestedPrompts = [
  { icon: Lightbulb, text: 'I have a headache', color: '#8FD3D1' },
  { icon: Stethoscope, text: 'Find me a cardiologist', color: '#2EE59D' },
  { icon: Pill, text: 'What medications am I on?', color: '#FFD84D' },
  { icon: Heart, text: 'How is my heart health?', color: '#FF5A5A' },
];

const welcomeMessage: Message = {
  id: 'welcome', role: 'assistant',
  content: 'Hello! I\'m your AI Care Navigator. I can help you understand your health data, find doctors, check medication information, and provide personalized health insights. How can I help you today?',
  timestamp: new Date(),
};

const sampleConversations = [
  { id: 'c1', title: 'Headache relief options', date: new Date(Date.now() - 86400000), messageCount: 5 },
  { id: 'c2', title: 'Cardiologist recommendation', date: new Date(Date.now() - 172800000), messageCount: 3 },
  { id: 'c3', title: 'Medication schedule review', date: new Date(Date.now() - 604800000), messageCount: 7 },
];

function generateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('headache') || lower.includes('head pain')) {
    return 'I understand you\'re experiencing a headache. Here are some suggestions:\n\n1. **Rest in a dark, quiet room** — Light and noise can worsen headaches\n2. **Stay hydrated** — Dehydration is a common trigger\n3. **Over-the-counter relief** — Paracetamol 650mg or Ibuprofen 400mg may help\n4. **Track your headaches** — Note triggers, frequency, and severity\n\n⚠️ **Seek immediate care if:** You experience sudden severe headache, vision changes, confusion, or numbness.\n\nWould you like me to help you book a consultation with a neurologist?';
  }
  if (lower.includes('cardiologist') || lower.includes('heart doctor')) {
    return 'I can help you find a cardiologist! Based on your location (Hyderabad), here are top-rated options:\n\n1. **Dr. Kavya Nair** — PulseHeart Clinic\n   ⭐ 4.8 · ₹850 · Telemedicine available\n\n2. **Dr. Rajesh Kumar** — Care Heart Institute\n   ⭐ 4.7 · ₹1000 · Available today\n\nWould you like to book an appointment with either of them?';
  }
  if (lower.includes('medication') || lower.includes('medicine') || lower.includes('prescription')) {
    return 'Here are your current active medications:\n\n1. **Telmisartan 40mg** — Once daily\n   - Purpose: Blood pressure control\n   - Adherence: 85%\n   - Refill due: In 2 days\n\n2. **Aspirin 75mg** — Once daily\n   - Purpose: Preventive (cardiac)\n   - Adherence: 90%\n\n3. **Vitamin D3 60K IU** — Once weekly\n   - Adherence: 70%\n\n💡 Tip: Your Telmisartan refill is due soon. Would you like me to place a refill order?';
  }
  if (lower.includes('heart health') || lower.includes('cardiac') || lower.includes('bp') || lower.includes('blood pressure')) {
    return 'Based on your recent health data:\n\n**Blood Pressure Trends (Last 6 months):**\n- Current: 126/80 mmHg ✅ (Improving)\n- 6 months ago: 138/88 mmHg\n- Improvement: 8.7%\n\n**Risk Assessment:**\n- Cardiovascular (10yr risk): 8% (Low)\n- Current medications are working well.\n\n✅ Your BP is now in the normal range. Continue with your current regimen and monthly monitoring.\n\nWould you like me to schedule your next BP check-up?';
  }
  return 'Thank you for your question. I\'m analyzing your health data to provide the most relevant information.\n\nHere\'s what I found based on your health profile:\n\n1. Your recent health metrics are generally stable\n2. All scheduled medications are on track\n3. No critical alerts detected\n\nIs there a specific area of your health you\'d like to explore further? I can help with:\n- 🩺 Symptom assessment\n- 💊 Medication information\n- 🏥 Doctor recommendations\n- 📊 Health data analysis';
}

export default function AiNavigatorPage() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(content: string) {
    if (!content.trim() || isTyping) return;

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: content.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(userMsg.content);
      const assistantMsg: Message = { id: `ai-${Date.now()}`, role: 'assistant', content: response, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1200);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0D10' }}>
      <div className="mx-auto" style={{ maxWidth: 1600 }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h1 className="text-xl font-bold text-white font-display">AI Care Navigator</h1>
            <p className="text-sm text-white/40 font-ui mt-0.5">Your intelligent health assistant</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 font-ui hover:bg-white/[0.06] hover:text-white transition-all"
          >
            <History className="h-3.5 w-3.5" />
            History
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={glassCard + ' flex flex-col h-[600px]'}
            >
              <div className="flex items-center gap-3 p-5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8FD3D1] to-[#2EE59D]">
                  <Brain className="h-5 w-5 text-black" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white font-ui">AI Care Navigator</p>
                  <p className="text-xs text-[#2EE59D] flex items-center gap-1 font-ui">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2EE59D]" />
                    Online
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      msg.role === 'user' ? 'bg-[#8FD3D1]/10' : 'bg-gradient-to-br from-[#8FD3D1] to-[#2EE59D]'
                    }`}>
                      {msg.role === 'user' ? <User className="h-4 w-4 text-[#8FD3D1]" /> : <Bot className="h-4 w-4 text-black" />}
                    </div>
                    <div className={`max-w-[80%] rounded-[16px] px-4 py-3 ${
                      msg.role === 'user' ? 'bg-[#8FD3D1] text-black' : 'bg-white/[0.04] text-white/80'
                    }`}>
                      <p className="text-sm whitespace-pre-line font-ui">{msg.content}</p>
                      <p className={`text-[10px] mt-2 font-ui ${msg.role === 'user' ? 'text-black/50' : 'text-white/30'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8FD3D1] to-[#2EE59D]">
                      <Bot className="h-4 w-4 text-black" />
                    </div>
                    <div className="rounded-[16px] bg-white/[0.04] px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2 p-5 border-t border-[rgba(255,255,255,0.06)]">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your health..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                  className={inputStyle + ' flex-1'}
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isTyping}
                  className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#8FD3D1] text-black hover:bg-[#8FD3D1]/90 transition-all disabled:opacity-50"
                >
                  {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>

            {showHistory && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                <div className={glassCard}>
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-white font-display flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-white/40" />
                      Recent Conversations
                    </h3>
                    <div className="space-y-2">
                      {sampleConversations.map((conv) => (
                        <button
                          key={conv.id}
                          className="w-full rounded-[14px] border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-3 text-left transition-all hover:bg-white/[0.04]"
                        >
                          <p className="text-sm font-medium text-white font-ui truncate">{conv.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-white/40 font-ui">
                            <span>{conv.date.toLocaleDateString()}</span>
                            <span>· {conv.messageCount} msgs</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button className="flex items-center gap-1.5 w-full mt-3 rounded-[12px] border border-[rgba(255,255,255,0.08)] text-white/50 font-ui px-3 py-2 text-xs hover:bg-white/[0.03] hover:text-white/70 transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear History
                    </button>
                  </div>
                </div>

                <div className={glassCardCompact + ' p-4 bg-gradient-to-br from-[#8FD3D1]/5 to-transparent border-[#8FD3D1]/10'}>
                  <p className="text-xs font-semibold text-[#8FD3D1] font-ui flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Pro Tip
                  </p>
                  <p className="text-xs text-white/50 font-ui">Ask specific questions about your symptoms, medications, or lab results for the most accurate guidance.</p>
                </div>
              </motion.div>
            )}

            {!showHistory && messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <p className="text-xs font-medium text-white/40 font-ui">Suggested questions</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt.text}
                      onClick={() => handleSend(prompt.text)}
                      className="flex items-center gap-2 rounded-[14px] p-3 text-sm font-medium text-left transition-all hover:opacity-80 font-ui"
                      style={{ backgroundColor: `${prompt.color}10`, color: prompt.color, border: `1px solid ${prompt.color}20` }}
                    >
                      <prompt.icon className="h-4 w-4 shrink-0" />
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
