import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Maximize2,
  Minimize2,
  QrCode as QrCodeIcon,
  MessageSquare,
  Sparkles,
  Users,
  Award,
  TrendingUp,
  Share2,
  Check,
  RefreshCw,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  PieChart,
  BarChart3
} from 'lucide-react';
import { SurveyResponse, SurveyStats } from '../types';
import { STANDARD_QUESTIONS, getScoreInterpretation } from '../constants';

interface ProjectorDashboardProps {
  responses: SurveyResponse[];
  stats: SurveyStats;
  surveyUrl: string;
  onSimulateAttendee: () => void;
  onResetData: () => void;
  onOpenMobileView: () => void;
}

export const ProjectorDashboard: React.FC<ProjectorDashboardProps> = ({
  responses,
  stats,
  surveyUrl,
  onSimulateAttendee,
  onResetData,
  onOpenMobileView,
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [chartType, setChartType] = useState<'circle' | 'bar'>('circle');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrModalCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code for small card
  useEffect(() => {
    if (qrCanvasRef.current && surveyUrl) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        surveyUrl,
        {
          width: 130,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err) => {
          if (err) console.error('QR code render error', err);
        }
      );
    }
  }, [surveyUrl]);

  // Generate QR code for big projector modal
  useEffect(() => {
    if (showQrModal && qrModalCanvasRef.current && surveyUrl) {
      QRCode.toCanvas(
        qrModalCanvasRef.current,
        surveyUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#020617',
            light: '#ffffff',
          },
        },
        (err) => {
          if (err) console.error('Big QR code render error', err);
        }
      );
    }
  }, [showQrModal, surveyUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleDownloadCSV = () => {
    if (responses.length === 0) {
      alert('ยังไม่มีข้อมูลการตอบแบบสอบถามสำหรับดาวน์โหลด');
      return;
    }

    const headers = [
      'ลำดับ',
      'วันเวลา',
      'ข้อ1_ความรู้ความเข้าใจเนื้อหา (คะแนน)',
      'ข้อ2_เทคนิคการถ่ายทอดวิทยากร (คะแนน)',
      'ข้อ3_ประโยชน์และการนำไปใช้ (คะแนน)',
      'ข้อ4_ความพร้อมของสื่อและเวลา (คะแนน)',
      'ข้อ5_ความพึงพอใจภาพรวม (คะแนน)',
      'คะแนนเฉลี่ยรวม',
      'ระดับความพึงพอใจ',
      'ข้อเสนอแนะเพิ่มเติม',
    ];

    const rows = responses.map((r, i) => {
      const timeStr = r.timestamp ? new Date(r.timestamp).toLocaleString('th-TH') : '';
      const interp = getScoreInterpretation(r.average).level;
      const cleanFeedback = (r.feedback || '').replace(/"/g, '""');
      return [
        i + 1,
        `"${timeStr}"`,
        r.q1,
        r.q2,
        r.q3,
        r.q4,
        r.q5,
        r.average,
        `"${interp}"`,
        `"${cleanFeedback}"`,
      ].join(',');
    });

    // Add UTF-8 BOM so Thai characters show up perfectly in Microsoft Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานผลประเมินความพึงพอใจ_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract feedbacks
  const feedbackList = responses
    .filter((r) => r.feedback && r.feedback.trim().length > 0)
    .sort((a, b) => b.timestamp - a.timestamp);

  const themeContainer = lightMode
    ? 'bg-slate-50 text-slate-900'
    : 'bg-slate-950 text-slate-100';

  const cardBg = lightMode
    ? 'bg-white border-slate-200 shadow-md'
    : 'bg-slate-900/90 border-slate-800 shadow-xl';

  const cardInnerBg = lightMode
    ? 'bg-slate-100/90 border-slate-200'
    : 'bg-slate-950/70 border-slate-800/80';

  const textMuted = lightMode ? 'text-slate-500' : 'text-slate-400';
  const textHeading = lightMode ? 'text-slate-900' : 'text-white';

  return (
    <div className={`transition-colors duration-300 min-h-screen p-4 sm:p-6 lg:p-8 ${themeContainer}`}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header & Projector Controls */}
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-700/50">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE REALTIME
              </span>
              <span className={`text-xs ${textMuted}`}>
                อัปเดตอัตโนมัติทันทีที่มีผู้ส่งแบบสอบถาม
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${textHeading}`}>
              Dashboard สรุปผลความพึงพอใจการอบรม
            </h1>
            <p className={`text-sm ${textMuted} mt-1`}>
              การประเมินผลโครงการแบบสเกล 1-5 พร้อมระบบวิเคราะห์ระดับความพึงพอใจมาตรฐาน
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              title="คัดลอกลิงก์สำหรับส่งให้ผู้เข้าอบรม"
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border flex items-center gap-2 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : `${cardBg} hover:border-blue-500 text-slate-300`
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-blue-400" />}
              <span>{copied ? 'คัดลอกลิงก์แล้ว!' : 'แชร์ลิงก์'}</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border ${cardBg} hover:border-blue-500 text-slate-300 flex items-center gap-2 transition-all`}
            >
              <QrCodeIcon className="w-4 h-4 text-indigo-400" />
              <span>ขยาย QR Code</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด CSV</span>
            </button>

            <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>

            <button
              onClick={() => setLightMode(!lightMode)}
              title={lightMode ? 'เปลี่ยนเป็นธีมมืด (Dark)' : 'เปลี่ยนเป็นธีมสว่าง (High Contrast Projector)'}
              className={`p-2 rounded-xl border ${cardBg} text-slate-300 hover:text-white transition-colors`}
            >
              {lightMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-300" />}
            </button>

            <button
              onClick={toggleFullscreen}
              title="โหมดเต็มจอสำหรับจอโปรเจกเตอร์"
              className={`p-2 rounded-xl border ${cardBg} text-slate-300 hover:text-white transition-colors`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Overall Average */}
          <div className={`p-6 rounded-3xl border ${cardBg} relative overflow-hidden flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                คะแนนเฉลี่ยรวม
              </span>
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Award className="w-4 h-4" />
              </span>
            </div>
            
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black font-mono ${textHeading}`}>
                  {stats.overallAverage.toFixed(2)}
                </span>
                <span className={`text-xl font-medium ${textMuted}`}>/ 5.00</span>
              </div>
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${stats.interpretation.badgeBg}`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  ระดับ: {stats.interpretation.level}
                </span>
              </div>
            </div>

            <div className={`text-xs ${textMuted} border-t border-slate-700/40 pt-3 flex items-center justify-between`}>
              <span>เกณฑ์มาตรฐาน 5 ระดับ</span>
              <span className="font-medium text-blue-400">เต็ม 5 คะแนน</span>
            </div>
          </div>

          {/* Card 2: Total Respondents */}
          <div className={`p-6 rounded-3xl border ${cardBg} relative overflow-hidden flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                จำนวนผู้เข้าอบรมที่ตอบ
              </span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-4 h-4" />
              </span>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono text-emerald-400">
                  {stats.total}
                </span>
                <span className={`text-xl font-medium ${textMuted}`}>คน</span>
              </div>
              <p className={`text-xs mt-3 flex items-center gap-1.5 ${textMuted}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                บันทึกแบบไม่ระบุชื่อ (Anonymous)
              </p>
            </div>

            <div className={`text-xs ${textMuted} border-t border-slate-700/40 pt-3 flex items-center justify-between`}>
              <span>ความเห็นเพิ่มเติม:</span>
              <span className="font-bold text-slate-200">{stats.feedbackCount} รายการ</span>
            </div>
          </div>

          {/* Card 3: Satisfaction Index % */}
          <div className={`p-6 rounded-3xl border ${cardBg} relative overflow-hidden flex flex-col justify-between`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>
                ดัชนีความพึงพอใจ
              </span>
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono text-purple-400">
                  {stats.satisfactionPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${stats.satisfactionPercent}%` }}
                />
              </div>
            </div>

            <div className={`text-xs ${textMuted} border-t border-slate-700/40 pt-3 flex items-center justify-between`}>
              <span>สูตรคำนวณ:</span>
              <span>(คะแนนเฉลี่ย ÷ 5) × 100</span>
            </div>
          </div>

          {/* Card 4: Live QR Code for Projector Screen */}
          <div className={`p-5 rounded-3xl border ${cardBg} flex flex-col items-center justify-center text-center relative`}>
            <div className="p-2 bg-white rounded-2xl shadow-md mb-2.5 inline-block">
              <canvas ref={qrCanvasRef} className="rounded-lg" />
            </div>
            <h3 className={`text-xs font-bold ${textHeading} flex items-center gap-1`}>
              <QrCodeIcon className="w-3.5 h-3.5 text-blue-400" />
              สแกนด้วยมือถือเพื่อตอบ
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setShowQrModal(true)}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline font-medium"
              >
                ฉาย QR Code เต็มจอ
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={onOpenMobileView}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center gap-0.5"
              >
                <span>เปิดตอบ</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        {/* Main Content: Bar Charts (2 cols) & Feedback Stream (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Detailed Question Scores (Span 2) */}
          <div className={`lg:col-span-2 p-6 rounded-3xl border ${cardBg} space-y-5`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <PieChart className="w-4 h-4" />
                  </span>
                  <h2 className={`text-lg sm:text-xl font-bold ${textHeading}`}>
                    ผลคะแนนเฉลี่ยรายข้อ (สเกล 1 - 5)
                  </h2>
                </div>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  การแสดงผลด้วยกราฟวงกลมเรเดียล (Radial Circular Gauges) ชัดเจนสำหรับจอโปรเจกเตอร์
                </p>
              </div>

              {/* Chart Style Switcher & Simulator */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setChartType('circle')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium transition-all ${
                      chartType === 'circle'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PieChart className="w-3.5 h-3.5" />
                    <span>กราฟวงกลม</span>
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium transition-all ${
                      chartType === 'bar'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>กราฟแท่ง</span>
                  </button>
                </div>

                <button
                  onClick={onSimulateAttendee}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 transition-colors"
                  title="คลิกเพื่อจำลองผู้เข้าอบรมส่งผลประเมินทันที 1 คน (เพื่อทดสอบ Real-time)"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>จำลอง +1</span>
                </button>
              </div>
            </div>

            {/* Questions List with Circular Progress Gauges (Default) or Bars */}
            <div className="space-y-4">
              {STANDARD_QUESTIONS.map((q, idx) => {
                const score = stats.questionAverages[q.id] || 0;
                const interp = getScoreInterpretation(score);
                const percent = (score / 5) * 100;

                const gradientDefs = [
                  { id: 'grad-blue', start: '#3b82f6', end: '#6366f1' },
                  { id: 'grad-indigo', start: '#6366f1', end: '#a855f7' },
                  { id: 'grad-cyan', start: '#06b6d4', end: '#3b82f6' },
                  { id: 'grad-emerald', start: '#10b981', end: '#14b8a6' },
                  { id: 'grad-amber', start: '#f59e0b', end: '#f97316' },
                ];
                const activeGrad = gradientDefs[idx % gradientDefs.length];
                const circumference = 2 * Math.PI * 38; // r=38 => ~238.76
                const strokeDashoffset = circumference * (1 - percent / 100);

                if (chartType === 'circle') {
                  return (
                    <div
                      key={q.id}
                      className={`p-4 sm:p-5 rounded-2xl border ${cardInnerBg} transition-all duration-300 hover:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4`}
                    >
                      {/* Left: Info Details */}
                      <div className="space-y-1.5 flex-1 w-full sm:w-auto text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            ข้อ {idx + 1}
                          </span>
                          <span className={`text-xs font-semibold ${textMuted}`}>
                            {q.category}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${interp.badgeBg}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            ระดับ: {interp.level}
                          </span>
                        </div>

                        <h3 className={`text-base sm:text-lg font-bold ${textHeading}`}>
                          {q.title.replace(/^\d+\.\s*/, '')}
                        </h3>

                        <p className={`text-xs ${textMuted} leading-relaxed`}>
                          {q.subtitle}
                        </p>

                        <div className="pt-1 flex items-center gap-3 text-xs">
                          <span className={`${textMuted}`}>
                            เทียบเกณฑ์: <strong className="text-white">{score.toFixed(2)}</strong> จากเต็ม 5.0
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className={`${interp.textColor} font-semibold`}>
                            คิดเป็น {Math.round(percent)}%
                          </span>
                        </div>
                      </div>

                      {/* Right: SVG Circular Radial Progress Gauge */}
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                          <defs>
                            <linearGradient id={`circleGrad-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={activeGrad.start} />
                              <stop offset="100%" stopColor={activeGrad.end} />
                            </linearGradient>
                          </defs>

                          {/* Background Track Circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke={lightMode ? '#e2e8f0' : '#1e293b'}
                            strokeWidth="8"
                          />

                          {/* Foreground Progress Circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke={`url(#circleGrad-${idx})`}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>

                        {/* Central Number Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className={`text-2xl sm:text-3xl font-black font-mono leading-none tracking-tight ${textHeading}`}>
                            {score.toFixed(2)}
                          </span>
                          <span className={`text-[10px] font-semibold mt-1 uppercase tracking-wider ${textMuted}`}>
                            / 5.0
                          </span>
                          <span className={`text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded-full ${interp.badgeBg}`}>
                            {Math.round(percent)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Bar Layout
                return (
                  <div key={q.id} className={`p-4 rounded-2xl border ${cardInnerBg} transition-all duration-300 hover:border-slate-700`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            ข้อ {idx + 1}
                          </span>
                          <span className={`text-xs font-semibold ${textMuted}`}>
                            {q.category}
                          </span>
                        </div>
                        <h3 className={`text-sm sm:text-base font-semibold ${textHeading}`}>
                          {q.title.replace(/^\d+\.\s*/, '')}
                        </h3>
                        <p className={`text-xs ${textMuted} line-clamp-1`}>
                          {q.subtitle}
                        </p>
                      </div>

                      <div className="text-right shrink-0 sm:pl-4">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className={`text-2xl font-black font-mono ${textHeading}`}>
                            {score.toFixed(2)}
                          </span>
                          <span className={`text-xs ${textMuted}`}>/ 5.0</span>
                        </div>
                        <span className={`text-xs font-semibold ${interp.textColor}`}>
                          ระดับ: {interp.level}
                        </span>
                      </div>
                    </div>

                    <div className="relative w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700/40">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Criteria Legend */}
            <div className="pt-4 border-t border-slate-800">
              <span className={`text-xs font-medium block mb-2 ${textMuted}`}>
                เกณฑ์การแปลผลคะแนนเฉลี่ย 5 ระดับ:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center">
                  <div className="font-bold">4.51 - 5.00</div>
                  <div className="text-[11px] opacity-80">มากที่สุด</div>
                </div>
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-center">
                  <div className="font-bold">3.51 - 4.50</div>
                  <div className="text-[11px] opacity-80">มาก</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-center">
                  <div className="font-bold">2.51 - 3.50</div>
                  <div className="text-[11px] opacity-80">ปานกลาง</div>
                </div>
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-center">
                  <div className="font-bold">1.51 - 2.50</div>
                  <div className="text-[11px] opacity-80">น้อย</div>
                </div>
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center col-span-2 sm:col-span-1">
                  <div className="font-bold">1.00 - 1.50</div>
                  <div className="text-[11px] opacity-80">น้อยที่สุด</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Feedbacks Stream */}
          <div className={`p-6 rounded-3xl border ${cardBg} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className={`text-base sm:text-lg font-bold ${textHeading}`}>
                      ข้อเสนอแนะล่าสุด
                    </h2>
                    <p className={`text-[11px] ${textMuted}`}>ความคิดเห็นจากผู้เข้าอบรม</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {feedbackList.length} รายการ
                </span>
              </div>

              {/* Feedback List Container */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {feedbackList.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3 opacity-40" />
                    <p className={`text-sm ${textMuted}`}>ยังไม่มีข้อเสนอแนะเพิ่มเติม</p>
                    <p className="text-xs text-slate-600 mt-1">
                      เมื่อผู้เข้าอบรมพิมพ์ข้อเสนอแนะ ข้อความจะปรากฏที่นี่ทันที
                    </p>
                  </div>
                ) : (
                  feedbackList.map((item) => {
                    const timeAgo = item.timestamp
                      ? new Date(item.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    const interp = getScoreInterpretation(item.average);

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border ${cardInnerBg} space-y-2 hover:border-slate-700 transition-all`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`inline-flex items-center gap-1 font-semibold ${interp.textColor}`}>
                            ★ คะแนนรวม {item.average.toFixed(1)} ({interp.level})
                          </span>
                          <span className="text-[11px] text-slate-500">{timeAgo}</span>
                        </div>
                        <p className={`text-sm leading-relaxed ${textHeading}`}>
                          "{item.feedback}"
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Admin Controls: Reset Data */}
            <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between">
              <span className={`text-[11px] ${textMuted}`}>ระบบจัดเก็บ Anonymous</span>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>รีเซ็ตข้อมูลทั้งหมด</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Big QR Code for Projector Display */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700"
            >
              ✕
            </button>
            
            <div className="p-4 bg-white rounded-2xl shadow-xl inline-block mb-5">
              <canvas ref={qrModalCanvasRef} className="rounded-lg" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              สแกน QR Code เพื่อทำแบบประเมิน
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              ใช้กล้องสมาร์ตโฟนสแกน ไม่ต้องติดตั้งแอปพลิเคชัน
            </p>

            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-300 truncate font-mono">{surveyUrl}</span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shrink-0"
              >
                {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Reset Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">ยืนยันการล้างข้อมูลทั้งหมด?</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              ข้อมูลการตอบทั้งหมด {responses.length} รายการจะถูกลบออกจากระบบ เหมาะสำหรับใช้เมื่อเริ่มต้นการอบรมรอบใหม่
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                ยืนยันล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
