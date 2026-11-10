import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Send,
  Sparkles,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { STANDARD_QUESTIONS, RATING_SCALE_DESCRIPTIONS } from '../constants';

interface MobileSurveyProps {
  onSubmitted: () => void;
  onBackToDashboard?: () => void;
}

const STORAGE_KEY = 'training_survey_submitted_v1';

export const MobileSurvey: React.FC<MobileSurveyProps> = ({
  onSubmitted,
  onBackToDashboard,
}) => {
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deviceToken, setDeviceToken] = useState('');

  // Generate or retrieve persistent device token to prevent duplicate responses
  useEffect(() => {
    let token = localStorage.getItem('device_survey_token');
    if (!token) {
      token = 'dev-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now();
      localStorage.setItem('device_survey_token', token);
    }
    setDeviceToken(token);

    if (localStorage.getItem(STORAGE_KEY)) {
      setHasSubmitted(true);
    }
  }, []);

  const handleSelectScore = (questionId: string, value: number) => {
    setScores((prev) => ({ ...prev, [questionId]: value }));
    setErrorMsg('');
  };

  const handleRetest = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasSubmitted(false);
    setScores({});
    setFeedback('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify all 5 questions answered
    for (let i = 1; i <= 5; i++) {
      const qKey = `q${i}`;
      if (!scores[qKey]) {
        setErrorMsg(`กรุณาให้คะแนนข้อที่ ${i} ให้ครบถ้วน`);
        const el = document.getElementById(`q-card-${qKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q1: scores.q1,
          q2: scores.q2,
          q3: scores.q3,
          q4: scores.q4,
          q5: scores.q5,
          feedback: feedback.trim(),
          deviceHash: deviceToken,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'ส่งข้อมูลไม่สำเร็จ');
      }

      // Mark submitted in localStorage
      localStorage.setItem(STORAGE_KEY, 'true');
      setHasSubmitted(true);
      onSubmitted();

      // Fire celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(scores).length;
  const progressPercent = (answeredCount / 5) * 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">

        {/* Top Header / Navigation */}
        <header className="flex items-center justify-between pb-3 border-b border-slate-800">
          {onBackToDashboard ? (
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่ Dashboard</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anonymous (ไม่เก็บชื่อ)</span>
          </div>
        </header>

        {/* App Title Banner */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            แบบประเมินความพึงพอใจ
          </h1>
          <p className="text-xs text-slate-400">
            โครงการอบรมเชิงปฏิบัติการ • สเกลคะแนน 1 ถึง 5
          </p>
        </div>

        {/* State: Already Submitted */}
        {hasSubmitted ? (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-7 text-center shadow-2xl space-y-5 animate-in fade-in duration-300">
            <div className="w-18 h-18 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">บันทึกข้อมูลเรียบร้อยแล้ว</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                ขอขอบพระคุณสำหรับข้อคิดเห็นอันมีค่าของท่าน คะแนนจะถูกนำไปประมวลผลบน Dashboard ของวิทยากรทันที
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-400">
              🔒 เครื่องนี้ได้ทำการส่งผลประเมินแล้ว เพื่อป้องกันการตอบซ้ำ
            </div>

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl text-sm transition-all"
              >
                ดูผลรวมบน Dashboard
              </button>
            )}

            <div className="pt-2">
              <button
                onClick={handleRetest}
                className="text-xs text-slate-400 hover:text-slate-200 underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ต้องการทดสอบทำแบบประเมินใหม่อีกครั้ง</span>
              </button>
            </div>
          </div>
        ) : (
          /* Survey Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Progress Bar Header */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300 font-medium">ความคืบหน้า</span>
                <span className="font-bold text-blue-400 font-mono">
                  {answeredCount} / 5 ข้อ ({Math.round(progressPercent)}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Scale Info Box */}
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 text-blue-400" />
              <span>
                <strong>5</strong> = มากที่สุด, <strong>4</strong> = มาก, <strong>3</strong> = ปานกลาง, <strong>2</strong> = น้อย, <strong>1</strong> = น้อยที่สุด
              </span>
            </div>

            {/* Questions 1 to 5 */}
            {STANDARD_QUESTIONS.map((q, idx) => {
              const currentScore = scores[q.id];
              return (
                <div
                  key={q.id}
                  id={`q-card-${q.id}`}
                  className={`bg-slate-900/90 border rounded-2xl p-5 shadow-sm transition-all ${
                    currentScore ? 'border-blue-500/40 bg-slate-900' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      ข้อที่ {idx + 1}
                    </span>
                    {currentScore && (
                      <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                        {currentScore} : {RATING_SCALE_DESCRIPTIONS[currentScore]?.label}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                    {q.title.replace(/^\d+\.\s*/, '')} <span className="text-rose-400">*</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">{q.subtitle}</p>

                  {/* 1-5 Score Selection Buttons */}
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = currentScore === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectScore(q.id, val)}
                          className={`py-3 rounded-xl font-bold text-lg sm:text-xl transition-all flex flex-col items-center justify-center border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30 scale-105'
                              : 'bg-slate-950/70 border-slate-700/80 text-slate-300 hover:border-blue-500/60 active:scale-95'
                          }`}
                        >
                          <span>{val}</span>
                          <span className="text-[10px] font-normal opacity-75 hidden sm:block">
                            {val === 5 ? 'มากสุด' : val === 1 ? 'น้อยสุด' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Optional Feedback */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
              <label htmlFor="userFeedback" className="block text-sm font-semibold text-white">
                ข้อเสนอแนะเพิ่มเติม <span className="text-slate-400 font-normal">(ไม่บังคับ)</span>
              </label>
              <p className="text-xs text-slate-400">
                สิ่งที่ท่านประทับใจ หรือสิ่งที่ต้องการให้ปรับปรุงสำหรับการจัดอบรมในครั้งต่อไป
              </p>
              <textarea
                id="userFeedback"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="พิมพ์ข้อเสนอแนะหรือความคิดเห็นของท่านที่นี่..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 text-base transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <span>ส่งแบบประเมินความพึงพอใจ</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 pt-4 pb-8">
          ระบบประเมินความพึงพอใจการอบรม &copy; ข้อมูลปลอดภัยและไม่ระบุตัวตน
        </footer>

      </div>
    </div>
  );
};
