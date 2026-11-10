import React, { useState, useEffect, useMemo } from 'react';
import {
  Monitor,
  Smartphone,
  Code2,
  ExternalLink,
  Sparkles,
  Wifi,
  FileText
} from 'lucide-react';
import { SurveyResponse, SurveyStats } from './types';
import { STANDARD_QUESTIONS, getScoreInterpretation } from './constants';
import { ProjectorDashboard } from './components/ProjectorDashboard';
import { MobileSurvey } from './components/MobileSurvey';
import { CodeExportGuide } from './components/CodeExportGuide';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'survey' | 'guide'>('dashboard');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState('');

  // Determine current survey URL for QR codes and sharing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // Points directly to the mobile survey mode on this applet
      const fullUrl = `${origin}?mode=survey`;
      setSurveyUrl(fullUrl);

      // Check URL parameters or hash on initial load
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      if (params.get('mode') === 'survey' || hash === '#survey') {
        setView('survey');
      } else if (params.get('mode') === 'guide' || hash === '#guide') {
        setView('guide');
      }
    }
  }, []);

  // Connect to SSE for real-time live sync
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/events');
      
      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            setResponses(data);
          }
        } catch (err) {
          console.error('Error parsing SSE data', err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        // Fallback polling if SSE is momentarily dropped
        fetch('/api/responses')
          .then((res) => res.json())
          .then((res) => {
            if (res.data) setResponses(res.data);
          })
          .catch(() => {});
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Calculate live statistics
  const stats: SurveyStats = useMemo(() => {
    const total = responses.length;

    if (total === 0) {
      return {
        total: 0,
        overallAverage: 0,
        satisfactionPercent: 0,
        interpretation: getScoreInterpretation(0),
        questionAverages: { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 },
        questionDistributions: {},
        feedbackCount: 0,
      };
    }

    let sumQ1 = 0;
    let sumQ2 = 0;
    let sumQ3 = 0;
    let sumQ4 = 0;
    let sumQ5 = 0;
    let feedbackTotal = 0;

    const distributions: { [key: string]: { [star: number]: number } } = {
      q1: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      q2: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      q3: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      q4: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      q5: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    responses.forEach((r) => {
      sumQ1 += Number(r.q1) || 0;
      sumQ2 += Number(r.q2) || 0;
      sumQ3 += Number(r.q3) || 0;
      sumQ4 += Number(r.q4) || 0;
      sumQ5 += Number(r.q5) || 0;

      if (distributions.q1[r.q1] !== undefined) distributions.q1[r.q1]++;
      if (distributions.q2[r.q2] !== undefined) distributions.q2[r.q2]++;
      if (distributions.q3[r.q3] !== undefined) distributions.q3[r.q3]++;
      if (distributions.q4[r.q4] !== undefined) distributions.q4[r.q4]++;
      if (distributions.q5[r.q5] !== undefined) distributions.q5[r.q5]++;

      if (r.feedback && r.feedback.trim().length > 0) {
        feedbackTotal++;
      }
    });

    const avgQ1 = Number((sumQ1 / total).toFixed(2));
    const avgQ2 = Number((sumQ2 / total).toFixed(2));
    const avgQ3 = Number((sumQ3 / total).toFixed(2));
    const avgQ4 = Number((sumQ4 / total).toFixed(2));
    const avgQ5 = Number((sumQ5 / total).toFixed(2));

    const overallAvg = Number(((avgQ1 + avgQ2 + avgQ3 + avgQ4 + avgQ5) / 5).toFixed(2));
    const satisfactionPercent = Math.min(100, Math.round((overallAvg / 5) * 100));

    return {
      total,
      overallAverage: overallAvg,
      satisfactionPercent,
      interpretation: getScoreInterpretation(overallAvg),
      questionAverages: {
        q1: avgQ1,
        q2: avgQ2,
        q3: avgQ3,
        q4: avgQ4,
        q5: avgQ5,
      },
      questionDistributions: distributions,
      feedbackCount: feedbackTotal,
    };
  }, [responses]);

  // Simulate an attendee submission for testing
  const handleSimulateAttendee = async () => {
    const sampleFeedbacks = [
      'วิทยากรให้คำแนะนำดีมาก บรรยากาศเป็นกันเอง',
      'ได้เรียนรู้เทคนิคใหม่ๆ ที่ไม่เคยรู้มาก่อนเลยครับ',
      'เนื้อหาครอบคลุมดีมาก อยากให้มีหลักสูตรขั้นสูงต่อยอดครับ',
      'เอกสารประกอบเข้าใจง่าย สถานที่และอุปกรณ์สะดวกสบายมาก',
      'กิจกรรมกลุ่มสนุกและได้ฝึกปฏิบัติจริง ขอบคุณทีมงานค่ะ',
      'ประทับใจความตั้งใจของวิทยากร อธิบายจนเข้าใจครบถ้วน',
    ];

    // Generate random realistic high scores
    const randomScores = {
      q1: Math.floor(Math.random() * 2) + 4, // 4 or 5
      q2: Math.floor(Math.random() * 2) + 4,
      q3: Math.floor(Math.random() * 2) + 4,
      q4: Math.floor(Math.random() * 3) + 3, // 3, 4, or 5
      q5: Math.floor(Math.random() * 2) + 4,
      feedback: Math.random() > 0.3 ? sampleFeedbacks[Math.floor(Math.random() * sampleFeedbacks.length)] : '',
    };

    try {
      await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(randomScores),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Reset responses
  const handleResetData = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      setResponses([]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Application Bar */}
      <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & App Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 font-black text-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-tight hidden sm:inline">
                  ระบบประเมินความพึงพอใจการอบรม
                </span>
                <span className="font-bold text-sm text-white tracking-tight sm:hidden">
                  Survey Realtime
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Wifi className="w-2.5 h-2.5 animate-pulse" />
                  <span>Realtime Sync</span>
                </span>
              </div>
            </div>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs font-semibold">
            <button
              onClick={() => setView('dashboard')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                view === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>จอโปรเจกเตอร์</span>
            </button>

            <button
              onClick={() => setView('survey')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                view === 'survey'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>หน้าผู้ตอบ</span>
            </button>

            <button
              onClick={() => setView('guide')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                view === 'guide'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>ไฟล์แยก & คู่มือ Firebase</span>
            </button>
          </div>

          {/* Quick External Links to Raw Files */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <a
              href="/survey.html"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 flex items-center gap-1 transition-colors"
              title="เปิดไฟล์ standalone survey.html"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>survey.html</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="/dashboard.html"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 flex items-center gap-1 transition-colors"
              title="เปิดไฟล์ standalone dashboard.html"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>dashboard.html</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        {view === 'dashboard' && (
          <ProjectorDashboard
            responses={responses}
            stats={stats}
            surveyUrl={surveyUrl}
            onSimulateAttendee={handleSimulateAttendee}
            onResetData={handleResetData}
            onOpenMobileView={() => setView('survey')}
          />
        )}

        {view === 'survey' && (
          <MobileSurvey
            onSubmitted={() => {
              // Stay on survey or allow viewing
            }}
            onBackToDashboard={() => setView('dashboard')}
          />
        )}

        {view === 'guide' && <CodeExportGuide />}
      </main>

    </div>
  );
}
