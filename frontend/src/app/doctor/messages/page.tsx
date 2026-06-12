/**
 * ============================================================================
 * WYSHCARE PLATFORM
 * ============================================================================
 *
 * File: frontend/src/app/doctor/messages/page.tsx
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
 - frontend/src/components/ui/glass-card.tsx
 - frontend/src/app/admin/page.tsx
 - frontend/src/app/admin/ehr/encounters/page.tsx
 - frontend/src/app/insurance/copilot/page.tsx
 - frontend/src/features/general-medicine/components/diagnosis-tools.tsx
 - frontend/src/app/(auth)/reset-password/page.tsx
 *
 * Calls:
 - utils
 - lucide-react
 - react
 *
 * Dependencies:
 - utils
 - lucide-react
 - react
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

import { useState, useMemo } from 'react';
import { Send, Search, Phone, Video, Info, User, CheckCheck, Paperclip, MoreVertical, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const accentColor = '#8FD3D1';
const glassCard = 'rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[#15181D]/80 backdrop-blur-xl';

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient' | 'system';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatRoom {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
  role: string;
  patientDetails?: {
    age: string;
    gender: string;
    bloodGroup: string;
    allergies: string[];
    medications: string[];
  };
  messages: ChatMessage[];
}

const INITIAL_CHATS: ChatRoom[] = [
  {
    id: '1',
    name: 'Rahul Verma',
    role: 'Patient (Post-Op Check)',
    lastMessage: 'The swelling in my gums has went down significantly. Thanks doctor.',
    time: '2 mins ago',
    unreadCount: 2,
    online: true,
    patientDetails: {
      age: '34',
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      medications: ['Amoxicillin 500mg', 'Paracetamol 650mg']
    },
    messages: [
      { id: '1a', sender: 'patient', text: 'Hello doctor, I had some mild bleeding this morning.', timestamp: '10:00 AM' },
      { id: '1b', sender: 'doctor', text: 'Hi Rahul, that can be normal for the first 24 hours. Keep applying light pressure with gauze.', timestamp: '10:05 AM', status: 'read' },
      { id: '1c', sender: 'patient', text: 'The swelling in my gums has went down significantly. Thanks doctor.', timestamp: '10:30 AM' }
    ]
  },
  {
    id: '2',
    name: 'Dr. Priya Patel',
    role: 'Cardiologist (Colleague)',
    lastMessage: 'Please review the ECG for room 204 when you have a moment.',
    time: '1 hour ago',
    unreadCount: 0,
    online: true,
    messages: [
      { id: '2a', sender: 'patient', text: 'Hi Dr. Sharma, did you see the report for patient Malhotra?', timestamp: 'Yesterday' },
      { id: '2b', sender: 'doctor', text: 'Yes Priya, looks like minor ST elevation. I have referred him for Echo.', timestamp: 'Yesterday', status: 'read' },
      { id: '2c', sender: 'patient', text: 'Please review the ECG for room 204 when you have a moment.', timestamp: '9:15 AM' }
    ]
  },
  {
    id: '3',
    name: 'Sneha Rao',
    role: 'Patient (Chronic Care)',
    lastMessage: 'Should I continue the metformin if my fasting sugar is 110?',
    time: '3 hours ago',
    unreadCount: 1,
    online: false,
    patientDetails: {
      age: '56',
      gender: 'Female',
      bloodGroup: 'A-',
      allergies: ['Sulfa drugs'],
      medications: ['Metformin 500mg', 'Atorvastatin 10mg']
    },
    messages: [
      { id: '3a', sender: 'patient', text: 'Hi doctor, my sugar log is attached.', timestamp: 'Yesterday' },
      { id: '3b', sender: 'doctor', text: 'Excellent trends Sneha. Keep up the low-carb diet.', timestamp: 'Yesterday', status: 'read' },
      { id: '3c', sender: 'patient', text: 'Should I continue the metformin if my fasting sugar is 110?', timestamp: '2:30 PM' }
    ]
  }
];

export default function MessagesPage() {
  const [chats, setChats] = useState<ChatRoom[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);

  const filteredChats = useMemo(() => {
    return chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [chats, searchQuery]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChat) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'doctor',
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: newMsg.text,
          time: 'Just now',
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    }));

    setMessageInput('');
  };

  return (
    <div className="flex h-full gap-4 p-4 text-white">
      {/* Left List Pane */}
      <div className={cn(glassCard, 'w-[320px] flex flex-col p-4 shrink-0')}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold font-display">Inbox</h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#8FD3D1]/10 text-[#8FD3D1]">
            {chats.reduce((acc, curr) => acc + curr.unreadCount, 0)} New
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search patients or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[#0B0D10]/50 p-2 pl-9 text-xs text-white focus:outline-none focus:border-[#8FD3D1]/30 transition-all placeholder:text-white/20"
          />
        </div>

        {/* Chats Queue */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredChats.map(chat => {
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  // Mark as read mock
                  setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
                }}
                className={cn(
                  'w-full flex gap-3 p-3 rounded-[16px] transition-all duration-300 text-left border border-transparent',
                  isActive 
                    ? 'bg-white/[0.05] border-white/[0.08] shadow-lg' 
                    : 'hover:bg-white/[0.02]'
                )}
              >
                {/* Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="h-9 w-9 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                    <User className="h-4.5 w-4.5 text-white/40" />
                  </div>
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#2EE59D] border border-[#15181D]" />
                  )}
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-xs font-semibold text-white truncate">{chat.name}</h4>
                    <span className="text-[8px] text-white/30 shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-[10px] text-white/50 truncate mb-1">{chat.role}</p>
                  <p className="text-[10px] text-white/45 truncate leading-tight font-ui">{chat.lastMessage}</p>
                </div>

                {/* Unread badge */}
                {chat.unreadCount > 0 && (
                  <div className="shrink-0 flex items-center self-center justify-center h-4 min-w-4 rounded-full bg-[#8FD3D1] text-[#0B0D10] text-[8px] font-bold px-1">
                    {chat.unreadCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(glassCard, 'flex-1 flex flex-col min-w-0 overflow-hidden')}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)] bg-[#15181D]/30">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                  <User className="h-4.5 w-4.5 text-white/40" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white font-display">{activeChat.name}</h3>
                  <p className="text-[9px] text-white/40 font-ui">{activeChat.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="h-8 w-8 rounded-[10px] bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all flex items-center justify-center">
                  <Phone className="h-3.5 w-3.5 text-white/70" />
                </button>
                <button className="h-8 w-8 rounded-[10px] bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all flex items-center justify-center">
                  <Video className="h-3.5 w-3.5 text-white/70" />
                </button>
                <button className="h-8 w-8 rounded-[10px] bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all flex items-center justify-center">
                  <MoreVertical className="h-3.5 w-3.5 text-white/70" />
                </button>
              </div>
            </div>

            {/* Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B0D10]/20">
              {activeChat.messages.map(msg => {
                const isDoc = msg.sender === 'doctor';
                return (
                  <div key={msg.id} className={cn('flex flex-col max-w-[70%]', isDoc ? 'ml-auto items-end' : 'mr-auto items-start')}>
                    <div className={cn(
                      'rounded-[18px] p-3 text-xs leading-relaxed font-ui',
                      isDoc 
                        ? 'bg-[#8FD3D1] text-[#0B0D10] font-medium rounded-tr-[4px]' 
                        : 'bg-white/[0.04] border border-white/[0.06] text-white/90 rounded-tl-[4px]'
                    )}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[8px] text-white/30 font-mono">
                      <span>{msg.timestamp}</span>
                      {isDoc && <CheckCheck className="h-2.5 w-2.5 text-[#8FD3D1]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-[rgba(255,255,255,0.06)] bg-[#15181D]/30 flex items-center gap-2">
              <button className="h-9 w-9 rounded-[12px] bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all flex items-center justify-center shrink-0">
                <Paperclip className="h-4 w-4 text-white/50" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your clinical instruction or response..."
                className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-[12px] p-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#8FD3D1]/30 transition-all font-ui"
              />
              <button 
                onClick={handleSendMessage}
                className="h-9 w-9 rounded-[12px] bg-[#8FD3D1] text-[#0B0D10] hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-2 font-ui">
            <User className="h-8 w-8 opacity-25" />
            <p className="text-xs">Select a conversation to begin care communication</p>
          </div>
        )}
      </div>

      {/* Right Details Panel */}
      {activeChat && activeChat.patientDetails && (
        <div className={cn(glassCard, 'w-[280px] flex flex-col p-4 shrink-0 font-ui')}>
          <div className="flex items-center gap-1.5 mb-4 text-[#8FD3D1]">
            <Info className="h-4 w-4" />
            <h3 className="text-xs font-bold font-display uppercase tracking-wider">Patient Summary</h3>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Vitals */}
            <div className="rounded-[16px] bg-[#0B0D10]/40 border border-white/[0.04] p-3 text-center">
              <span className="text-[9px] text-white/30 block uppercase font-semibold">Active Care Profile</span>
              <p className="text-sm font-bold text-white mt-1">{activeChat.name}</p>
              <p className="text-[10px] text-white/40">{activeChat.patientDetails.age}y · {activeChat.patientDetails.gender} · Blood {activeChat.patientDetails.bloodGroup}</p>
            </div>

            {/* Allergies */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-white/30 block uppercase font-semibold flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-[#FF5A5A]" />
                Allergies
              </span>
              <div className="flex flex-wrap gap-1">
                {activeChat.patientDetails.allergies.map(a => (
                  <span key={a} className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-[#FF5A5A]/15 text-[#FF5A5A] border border-[#FF5A5A]/25">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-white/30 block uppercase font-semibold">Current Medications</span>
              <div className="space-y-1">
                {activeChat.patientDetails.medications.map(m => (
                  <div key={m} className="text-[10px] text-white/60 bg-white/[0.02] border border-white/[0.04] rounded-[8px] px-2 py-1 flex items-center justify-between font-mono">
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2 border-t border-white/[0.04]">
              <button className="w-full text-center rounded-[12px] bg-[#8FD3D1]/10 hover:bg-[#8FD3D1]/15 text-[#8FD3D1] border border-[#8FD3D1]/20 p-2 text-[10px] font-semibold transition-all">
                Launch Telemedicine Call
              </button>
              <button className="w-full text-center rounded-[12px] bg-white/[0.02] hover:bg-white/[0.04] text-white/80 border border-white/[0.06] p-2 text-[10px] font-semibold transition-all">
                Open Patient EMR Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
