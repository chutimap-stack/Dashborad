import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Flame,
  ExternalLink,
  Shield,
  Globe,
  Database,
  Terminal,
  Settings,
  HelpCircle,
  FolderGit2
} from 'lucide-react';

export const CodeExportGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard' | 'rules' | 'guide'>('survey');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Custom Firebase config state for live preview injection
  const [apiKey, setApiKey] = useState('YOUR_API_KEY');
  const [projectId, setProjectId] = useState('my-training-survey');
  const [databaseUrl, setDatabaseUrl] = useState('https://my-training-survey-default-rtdb.asia-southeast1.firebasedatabase.app');
  const [showConfigEditor, setShowConfigEditor] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate survey.html source with dynamic config
  const surveyHtmlSource = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>แบบประเมินความพึงพอใจการอบรม</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Canvas Confetti CDN -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <!-- Firebase Realtime Database SDK (Compat) -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

  <style>
    body { font-family: 'Prompt', sans-serif; -webkit-tap-highlight-color: transparent; }
    .score-btn.active {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      border-color: #3b82f6;
      box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);
      transform: translateY(-2px);
    }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen py-6 px-4 flex flex-col justify-between">

  <div class="max-w-md w-full mx-auto pb-10">
    <!-- Header -->
    <header class="text-center mb-6">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 mb-3 border border-blue-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-white tracking-wide">แบบประเมินความพึงพอใจ</h1>
      <p class="text-sm text-slate-400 mt-1">โครงการอบรมเชิงปฏิบัติการ (ไม่ต้องระบุชื่อ)</p>
    </header>

    <!-- Already Submitted Alert -->
    <div id="alreadySubmittedAlert" class="hidden bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-6 text-center shadow-xl">
      <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-emerald-300">ท่านได้ส่งแบบประเมินแล้ว</h2>
      <p class="text-slate-300 text-sm mt-2">ขอบพระคุณสำหรับข้อคิดเห็นอันมีค่า ระบบได้บันทึกคะแนนเรียบร้อยแล้ว</p>
      <div class="mt-6 pt-4 border-t border-slate-700/60">
        <button id="btnAllowRetest" class="text-xs text-slate-400 hover:text-slate-200 underline">
          ต้องการทำแบบประเมินใหม่ (สำหรับการทดสอบ)
        </button>
      </div>
    </div>

    <!-- Survey Form -->
    <form id="surveyForm" class="space-y-5">
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300">
        <span>เกณฑ์: <strong>5</strong> มากที่สุด, <strong>4</strong> มาก, <strong>3</strong> ปานกลาง, <strong>2</strong> น้อย, <strong>1</strong> น้อยที่สุด</span>
      </div>

      <!-- Question 1 -->
      <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-sm">
        <label class="block text-sm font-semibold text-white mb-1">1. ความรู้ความเข้าใจในเนื้อหาหลักสูตร *</label>
        <p class="text-xs text-slate-400 mb-3">เนื้อหามีประโยชน์และตรงกับความต้องการ</p>
        <div class="grid grid-cols-5 gap-2" data-q="q1">
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="1">1</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="2">2</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="3">3</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="4">4</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="5">5</button>
        </div>
      </div>

      <!-- Question 2 -->
      <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-sm">
        <label class="block text-sm font-semibold text-white mb-1">2. ความสามารถและเทคนิคการถ่ายทอดของวิทยากร *</label>
        <p class="text-xs text-slate-400 mb-3">อธิบายชัดเจน เป็นกันเอง ตอบคำถามตรงประเด็น</p>
        <div class="grid grid-cols-5 gap-2" data-q="q2">
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="1">1</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="2">2</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="3">3</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="4">4</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="5">5</button>
        </div>
      </div>

      <!-- Question 3 -->
      <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-sm">
        <label class="block text-sm font-semibold text-white mb-1">3. ประโยชน์ที่ได้รับและสามารถนำไปประยุกต์ใช้จริง *</label>
        <p class="text-xs text-slate-400 mb-3">สามารถนำความรู้ไปใช้ในการทำงานหรือการเรียนได้</p>
        <div class="grid grid-cols-5 gap-2" data-q="q3">
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="1">1</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="2">2</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="3">3</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="4">4</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="5">5</button>
        </div>
      </div>

      <!-- Question 4 -->
      <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-sm">
        <label class="block text-sm font-semibold text-white mb-1">4. ความเหมาะสมของเอกสาร สื่อ และระยะเวลา *</label>
        <p class="text-xs text-slate-400 mb-3">การจัดสรรเวลา และความพร้อมของระบบ/สถานที่</p>
        <div class="grid grid-cols-5 gap-2" data-q="q4">
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="1">1</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="2">2</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="3">3</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="4">4</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="5">5</button>
        </div>
      </div>

      <!-- Question 5 -->
      <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-sm">
        <label class="block text-sm font-semibold text-white mb-1">5. ความพึงพอใจในภาพรวมของการอบรม *</label>
        <p class="text-xs text-slate-400 mb-3">ความรู้สึกโดยรวมต่อการเข้าร่วมโครงการในครั้งนี้</p>
        <div class="grid grid-cols-5 gap-2" data-q="q5">
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="1">1</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="2">2</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="3">3</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="4">4</button>
          <button type="button" class="score-btn py-3 rounded-xl border border-slate-700 bg-slate-900/80 text-white font-bold text-lg" data-val="5">5</button>
        </div>
      </div>

      <!-- Feedback (Optional) -->
      <div class="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-sm">
        <label for="feedback" class="block text-sm font-semibold text-white mb-1">ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)</label>
        <textarea id="feedback" rows="3" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="พิมพ์ข้อเสนอแนะของท่านที่นี่..."></textarea>
      </div>

      <!-- Error message -->
      <div id="errorMessage" class="hidden p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm text-center"></div>

      <!-- Submit Button -->
      <button id="btnSubmit" type="submit" class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-bold rounded-2xl shadow-lg transition-all">
        ส่งแบบประเมิน
      </button>
    </form>

    <!-- Success Screen -->
    <div id="successScreen" class="hidden bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-8 text-center shadow-2xl">
      <div class="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-2">ส่งแบบประเมินเรียบร้อยแล้ว</h2>
      <p class="text-slate-300 text-sm leading-relaxed">
        ข้อมูลและคะแนนของท่านได้ถูกส่งขึ้นไปยังหน้า Dashboard ของผู้จัดอบรมแบบเรียลไทม์แล้ว ขอบคุณครับ/ค่ะ
      </p>
    </div>
  </div>

  <script>
    // 1. ตั้งค่า Firebase Realtime Database
    const firebaseConfig = {
      apiKey: "${apiKey}",
      authDomain: "${projectId}.firebaseapp.com",
      databaseURL: "${databaseUrl}",
      projectId: "${projectId}",
      storageBucket: "${projectId}.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef123456"
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    const scores = { q1: null, q2: null, q3: null, q4: null, q5: null };
    const STORAGE_KEY = 'training_survey_submitted_v1';

    // ป้องกันการตอบซ้ำในเครื่องเดียวกัน
    if (localStorage.getItem(STORAGE_KEY)) {
      document.getElementById('surveyForm').classList.add('hidden');
      document.getElementById('alreadySubmittedAlert').classList.remove('hidden');
    }

    document.getElementById('btnAllowRetest').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      document.getElementById('alreadySubmittedAlert').classList.add('hidden');
      document.getElementById('surveyForm').classList.remove('hidden');
    });

    document.querySelectorAll('.score-btn').forEach(button => {
      button.addEventListener('click', () => {
        const parent = button.parentElement;
        const qKey = parent.getAttribute('data-q');
        const val = Number(button.getAttribute('data-val'));
        parent.querySelectorAll('.score-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        scores[qKey] = val;
        document.getElementById('errorMessage').classList.add('hidden');
      });
    });

    document.getElementById('surveyForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      for (let i = 1; i <= 5; i++) {
        if (!scores['q' + i]) {
          const errEl = document.getElementById('errorMessage');
          errEl.textContent = 'กรุณาให้คะแนนข้อที่ ' + i + ' ก่อนส่งแบบประเมิน';
          errEl.classList.remove('hidden');
          return;
        }
      }

      const feedbackText = document.getElementById('feedback').value.trim();
      const avg = Number(((scores.q1 + scores.q2 + scores.q3 + scores.q4 + scores.q5) / 5).toFixed(2));

      const payload = {
        timestamp: Date.now(),
        q1: scores.q1,
        q2: scores.q2,
        q3: scores.q3,
        q4: scores.q4,
        q5: scores.q5,
        average: avg,
        feedback: feedbackText
      };

      const btn = document.getElementById('btnSubmit');
      btn.disabled = true;
      btn.innerHTML = 'กำลังบันทึกข้อมูล...';

      try {
        await database.ref('surveys').push(payload);
        localStorage.setItem(STORAGE_KEY, 'true');
        document.getElementById('surveyForm').classList.add('hidden');
        document.getElementById('successScreen').classList.remove('hidden');
        if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 60 });
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาตรวจสอบการตั้งค่า Firebase Realtime Database');
        btn.disabled = false;
        btn.innerHTML = 'ส่งแบบประเมิน';
      }
    });
  </script>
</body>
</html>`;

  // Generate dashboard.html source with dynamic config
  const dashboardHtmlSource = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard ผลประเมินความพึงพอใจการอบรม</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- QRCode.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <!-- Firebase Realtime Database SDK (Compat) -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

  <style>
    body { font-family: 'Prompt', sans-serif; }
    .font-mono-num { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8 flex flex-col justify-between">

  <div class="max-w-7xl w-full mx-auto space-y-6">
    <!-- Header -->
    <header class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE REALTIME
          </span>
          <span class="text-xs text-slate-400">อัปเดตอัตโนมัติทันที</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-bold text-white">Dashboard ผลการประเมินความพึงพอใจการอบรม</h1>
        <p class="text-sm text-slate-400">ระบบประมวลผลสถิติและข้อเสนอแนะอัตโนมัติแบบทันที</p>
      </div>

      <div class="flex items-center gap-3">
        <button id="btnExportCSV" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium flex items-center gap-2">
          <span>📥 ดาวน์โหลด CSV</span>
        </button>
        <button id="btnFullscreen" class="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium">
          เต็มจอ (Projector)
        </button>
      </div>
    </header>

    <!-- Top KPI Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      <!-- Overall Avg -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
        <span class="text-xs text-slate-400">คะแนนเฉลี่ยรวม (เต็ม 5.00)</span>
        <div class="my-4">
          <div class="flex items-baseline gap-2">
            <span id="statOverallAvg" class="text-6xl font-extrabold text-white font-mono-num">0.00</span>
            <span class="text-xl text-slate-400">/ 5.0</span>
          </div>
          <div class="mt-3">
            <span id="statLevelBadge" class="inline-block px-3.5 py-1 rounded-full text-sm font-bold bg-slate-800 text-slate-400 border border-slate-700">
              รอข้อมูล
            </span>
          </div>
        </div>
        <p class="text-xs text-slate-500 border-t border-slate-800 pt-3">คำนวณตามเกณฑ์ 5 ระดับ</p>
      </div>

      <!-- Respondents Count -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
        <span class="text-xs text-slate-400">จำนวนผู้ตอบแบบสอบถาม</span>
        <div class="my-4">
          <div class="flex items-baseline gap-2">
            <span id="statTotalCount" class="text-6xl font-extrabold text-blue-400 font-mono-num">0</span>
            <span class="text-xl text-slate-400">คน</span>
          </div>
          <p class="text-xs text-slate-400 mt-3">🔒 บันทึกแบบไม่ระบุชื่อ (Anonymous)</p>
        </div>
        <div class="text-xs text-slate-400 border-t border-slate-800 pt-3 flex justify-between">
          <span>ข้อเสนอแนะ:</span>
          <span id="statFeedbackCount" class="font-bold text-slate-200">0 ข้อความ</span>
        </div>
      </div>

      <!-- Satisfaction % -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
        <span class="text-xs text-slate-400">ดัชนีความพึงพอใจร้อยละ</span>
        <div class="my-4">
          <span id="statSatisfactionPercent" class="text-6xl font-extrabold text-purple-400 font-mono-num">0%</span>
          <div class="w-full bg-slate-800 h-2.5 rounded-full mt-4 overflow-hidden">
            <div id="statProgressBar" class="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700" style="width: 0%"></div>
          </div>
        </div>
        <p class="text-xs text-slate-500 border-t border-slate-800 pt-3">(คะแนนเฉลี่ยรวม ÷ 5) × 100</p>
      </div>

      <!-- QR Code Projector Card -->
      <div class="bg-slate-900 border border-blue-500/30 rounded-3xl p-5 shadow-xl flex flex-col items-center justify-center text-center">
        <div class="p-2.5 bg-white rounded-2xl shadow-inner mb-3">
          <div id="qrcodeCanvas"></div>
        </div>
        <h3 class="text-sm font-bold text-white">สแกนเพื่อทำแบบประเมิน</h3>
        <p class="text-xs text-slate-400 mt-1">ใช้กล้องมือถือสแกนตอบได้ทันที</p>
      </div>

    </div>

    <!-- Questions Breakdown & Feedback -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 5 Questions Circular Gauges -->
      <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 class="text-lg font-bold text-white pb-3 border-b border-slate-800">ผลคะแนนเฉลี่ยรายข้อ (กราฟวงกลมเรเดียล)</h2>
        
        <div class="space-y-3.5" id="questionsContainer">
          <!-- Item 1 -->
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-1 flex-1 text-left">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">ข้อ 1</span>
                <span class="text-xs font-semibold text-slate-400">เนื้อหาหลักสูตร</span>
                <span id="badge-q1" class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">รอผล</span>
              </div>
              <h4 class="text-base font-bold text-slate-100">ความรู้ความเข้าใจในเนื้อหาหลักสูตร</h4>
              <p class="text-xs text-slate-400">เนื้อหามีประโยชน์ ทันสมัย และตรงกับความคาดหวัง</p>
            </div>
            <div class="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1e293b" stroke-width="8"></circle>
                <circle id="circle-q1" cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" stroke-width="8" stroke-dasharray="238.76" stroke-dashoffset="238.76" stroke-linecap="round" class="transition-all duration-1000 ease-out"></circle>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span id="score-q1" class="text-xl font-black font-mono-num text-white">0.00</span>
                <span class="text-[9px] text-slate-400">/ 5.0</span>
              </div>
            </div>
          </div>

          <!-- Item 2 -->
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-1 flex-1 text-left">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">ข้อ 2</span>
                <span class="text-xs font-semibold text-slate-400">วิทยากร</span>
                <span id="badge-q2" class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">รอผล</span>
              </div>
              <h4 class="text-base font-bold text-slate-100">ความสามารถและเทคนิคการถ่ายทอดของวิทยากร</h4>
              <p class="text-xs text-slate-400">อธิบายชัดเจน ยกตัวอย่างเห็นภาพ และตอบข้อซักถามได้ดี</p>
            </div>
            <div class="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1e293b" stroke-width="8"></circle>
                <circle id="circle-q2" cx="50" cy="50" r="38" fill="transparent" stroke="#6366f1" stroke-width="8" stroke-dasharray="238.76" stroke-dashoffset="238.76" stroke-linecap="round" class="transition-all duration-1000 ease-out"></circle>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span id="score-q2" class="text-xl font-black font-mono-num text-white">0.00</span>
                <span class="text-[9px] text-slate-400">/ 5.0</span>
              </div>
            </div>
          </div>

          <!-- Item 3 -->
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-1 flex-1 text-left">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">ข้อ 3</span>
                <span class="text-xs font-semibold text-slate-400">การประยุกต์ใช้</span>
                <span id="badge-q3" class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">รอผล</span>
              </div>
              <h4 class="text-base font-bold text-slate-100">ประโยชน์ที่ได้รับและสามารถนำไปประยุกต์ใช้จริง</h4>
              <p class="text-xs text-slate-400">เพิ่มพูนทักษะ และสามารถนำไปปรับใช้ในการทำงานหรือการเรียนได้</p>
            </div>
            <div class="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1e293b" stroke-width="8"></circle>
                <circle id="circle-q3" cx="50" cy="50" r="38" fill="transparent" stroke="#06b6d4" stroke-width="8" stroke-dasharray="238.76" stroke-dashoffset="238.76" stroke-linecap="round" class="transition-all duration-1000 ease-out"></circle>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span id="score-q3" class="text-xl font-black font-mono-num text-white">0.00</span>
                <span class="text-[9px] text-slate-400">/ 5.0</span>
              </div>
            </div>
          </div>

          <!-- Item 4 -->
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-1 flex-1 text-left">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ข้อ 4</span>
                <span class="text-xs font-semibold text-slate-400">สื่อและเวลา</span>
                <span id="badge-q4" class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">รอผล</span>
              </div>
              <h4 class="text-base font-bold text-slate-100">ความเหมาะสมของเอกสาร สื่อ และระยะเวลา</h4>
              <p class="text-xs text-slate-400">เวลาเหมาะสม อุปกรณ์และสื่อการสอนมีความพร้อมและเข้าใจง่าย</p>
            </div>
            <div class="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1e293b" stroke-width="8"></circle>
                <circle id="circle-q4" cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" stroke-width="8" stroke-dasharray="238.76" stroke-dashoffset="238.76" stroke-linecap="round" class="transition-all duration-1000 ease-out"></circle>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span id="score-q4" class="text-xl font-black font-mono-num text-white">0.00</span>
                <span class="text-[9px] text-slate-400">/ 5.0</span>
              </div>
            </div>
          </div>

          <!-- Item 5 -->
          <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-1 flex-1 text-left">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">ข้อ 5</span>
                <span class="text-xs font-semibold text-slate-400">ภาพรวม</span>
                <span id="badge-q5" class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">รอผล</span>
              </div>
              <h4 class="text-base font-bold text-slate-100">ความพึงพอใจในภาพรวมของการอบรม</h4>
              <p class="text-xs text-slate-400">ความรู้สึกโดยรวมต่อการบริหารจัดการและบรรยากาศการอบรม</p>
            </div>
            <div class="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1e293b" stroke-width="8"></circle>
                <circle id="circle-q5" cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" stroke-width="8" stroke-dasharray="238.76" stroke-dashoffset="238.76" stroke-linecap="round" class="transition-all duration-1000 ease-out"></circle>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span id="score-q5" class="text-xl font-black font-mono-num text-white">0.00</span>
                <span class="text-[9px] text-slate-400">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="pt-3 border-t border-slate-800 flex flex-wrap justify-between text-xs text-slate-400">
          <span>🟢 4.51-5.00 มากที่สุด</span>
          <span>🔵 3.51-4.50 มาก</span>
          <span>🟡 2.51-3.50 ปานกลาง</span>
          <span>🟠 1.51-2.50 น้อย</span>
          <span>🔴 1.00-1.50 น้อยที่สุด</span>
        </div>
      </div>

      <!-- Feedbacks Feed -->
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h2 class="text-lg font-bold text-white pb-3 border-b border-slate-800 mb-4">💬 ข้อเสนอแนะล่าสุด</h2>
          <div id="feedbackList" class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            <div class="text-center py-10 text-slate-500 text-sm">ยังไม่มีข้อเสนอแนะในขณะนี้</div>
          </div>
        </div>
        <p class="text-xs text-slate-500 text-center pt-3 border-t border-slate-800">อัปเดตแบบ Realtime อัตโนมัติ</p>
      </div>
    </div>
  </div>

  <script>
    // 1. ตั้งค่า Firebase Configuration
    const firebaseConfig = {
      apiKey: "\${apiKey}",
      authDomain: "\${projectId}.firebaseapp.com",
      databaseURL: "\${databaseUrl}",
      projectId: "\${projectId}",
      storageBucket: "\${projectId}.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef123456"
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    let allResponses = [];

    function interpretScore(score) {
      if (score >= 4.51) return { text: 'มากที่สุด', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      if (score >= 3.51) return { text: 'มาก', badge: 'bg-teal-500/20 text-teal-400 border-teal-500/40' };
      if (score >= 2.51) return { text: 'ปานกลาง', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      if (score >= 1.51) return { text: 'น้อย', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40' };
      return { text: 'น้อยที่สุด', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
    }

    function updateDashboard(list) {
      allResponses = list || [];
      const total = allResponses.length;
      document.getElementById('statTotalCount').textContent = total;

      if (total === 0) return;

      let sumQ = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
      const feedbacks = [];

      allResponses.forEach(item => {
        sumQ.q1 += Number(item.q1) || 0;
        sumQ.q2 += Number(item.q2) || 0;
        sumQ.q3 += Number(item.q3) || 0;
        sumQ.q4 += Number(item.q4) || 0;
        sumQ.q5 += Number(item.q5) || 0;
        if (item.feedback && item.feedback.trim() !== '') {
          feedbacks.push({ text: item.feedback.trim(), time: item.timestamp, avg: item.average });
        }
      });

      const avgQ = {
        q1: (sumQ.q1 / total).toFixed(2),
        q2: (sumQ.q2 / total).toFixed(2),
        q3: (sumQ.q3 / total).toFixed(2),
        q4: (sumQ.q4 / total).toFixed(2),
        q5: (sumQ.q5 / total).toFixed(2)
      };

      const overall = ((Number(avgQ.q1) + Number(avgQ.q2) + Number(avgQ.q3) + Number(avgQ.q4) + Number(avgQ.q5)) / 5).toFixed(2);
      const percent = Math.min(100, Math.round((Number(overall) / 5) * 100));

      document.getElementById('statOverallAvg').textContent = overall;
      const interp = interpretScore(Number(overall));
      const badge = document.getElementById('statLevelBadge');
      badge.textContent = 'ระดับ: ' + interp.text;
      badge.className = 'inline-block px-3.5 py-1 rounded-full text-sm font-bold ' + interp.badge + ' border';

      document.getElementById('statSatisfactionPercent').textContent = percent + '%';
      document.getElementById('statProgressBar').style.width = percent + '%';

      // อัปเดตกราฟวงกลม SVG
      for (let i = 1; i <= 5; i++) {
        const val = Number(avgQ['q' + i]);
        const itemInterp = interpretScore(val);
        document.getElementById('score-q' + i).textContent = val.toFixed(2);
        const b = document.getElementById('badge-q' + i);
        if (b) {
          b.textContent = 'ระดับ: ' + itemInterp.text;
          b.className = 'px-2 py-0.5 rounded-full text-[11px] font-bold ' + itemInterp.badge + ' border';
        }
        const c = document.getElementById('circle-q' + i);
        if (c) {
          c.style.strokeDashoffset = (238.76 * (1 - (val / 5))) + '';
        }
      }

      document.getElementById('statFeedbackCount').textContent = feedbacks.length + ' ข้อความ';
      feedbacks.sort((a, b) => (b.time || 0) - (a.time || 0));

      const fbContainer = document.getElementById('feedbackList');
      if (feedbacks.length === 0) {
        fbContainer.innerHTML = '<div class="text-center py-10 text-slate-500 text-sm">ยังไม่มีข้อเสนอแนะเพิ่มเติม</div>';
      } else {
        fbContainer.innerHTML = feedbacks.slice(0, 10).map(f => \`
          <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <span class="text-amber-400 font-bold">★ \${Number(f.avg).toFixed(1)} คะแนน</span>
            <p class="text-slate-200 text-sm">"\${f.text}"</p>
          </div>
        \`).join('');
      }
    }

    // 2. Realtime Listener
    database.ref('surveys').on('value', (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        updateDashboard([]);
        return;
      }
      const list = Object.keys(data).map(k => ({ id: k, ...data[k] }));
      updateDashboard(list);
    });

    // 3. QR Code
    const surveyUrl = window.location.origin + window.location.pathname.replace('dashboard.html', 'survey.html');
    new QRCode(document.getElementById('qrcodeCanvas'), {
      text: surveyUrl,
      width: 140,
      height: 140
    });

    // 4. Download CSV
    document.getElementById('btnExportCSV').addEventListener('click', () => {
      if (allResponses.length === 0) return alert('ยังไม่มีข้อมูล');
      const headers = ['ลำดับ', 'วันเวลา', 'ข้อ1', 'ข้อ2', 'ข้อ3', 'ข้อ4', 'ข้อ5', 'คะแนนเฉลี่ย', 'ข้อเสนอแนะ'];
      const rows = allResponses.map((r, i) => [
        i + 1,
        '"' + (r.timestamp ? new Date(r.timestamp).toLocaleString('th-TH') : '') + '"',
        r.q1, r.q2, r.q3, r.q4, r.q5, r.average,
        '"' + (r.feedback || '').replace(/"/g, '""') + '"'
      ].join(','));
      const csv = '\\uFEFF' + [headers.join(','), ...rows].join('\\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ผลประเมินความพึงพอใจ.csv';
      a.click();
    });

    // 5. Fullscreen
    document.getElementById('btnFullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    });
  </script>
</body>
</html>`;

  const securityRulesSource = `{
  "rules": {
    "surveys": {
      /* อนุญาตให้อ่านและเขียนได้ทุกคนโดยไม่ต้องล็อกอิน (Anonymous Public Access) */
      ".read": true,
      ".write": true,
      ".indexOn": ["timestamp"]
    }
  }
}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Flame className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                โค้ดแยก 2 ไฟล์ & วิธีตั้งค่า Firebase Realtime Database
              </h1>
            </div>
            <button
              onClick={() => setShowConfigEditor(!showConfigEditor)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-blue-400" />
              <span>{showConfigEditor ? 'ซ่อนตัวตั้งค่า Config' : 'ใส่ Firebase Config ของคุณ'}</span>
            </button>
          </div>
          <p className="text-sm text-slate-400">
            โค้ด HTML + JavaScript พร้อมใช้งาน ไม่ต้องลง Node.js หรือ build เครื่องมือใดๆ สามารถดาวน์โหลดหรือคัดลอกไปวางบนเว็บโฮสติ้งฟรีได้ทันที
          </p>
        </div>

        {/* Optional Live Config Editor */}
        {showConfigEditor && (
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                <span>ระบุ Firebase Configuration (เพื่อแทรกในโค้ดให้อัตโนมัติ)</span>
              </h3>
              <span className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md">
                Live Code Generator
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">API Key:</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  placeholder="AIzaSy..."
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Project ID:</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  placeholder="my-project-1234"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Database URL:</label>
                <input
                  type="text"
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  placeholder="https://...firebaseio.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('survey')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'survey'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>1. survey.html (หน้าตอบแบบสอบถาม)</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>2. dashboard.html (หน้า Dashboard จอภาพ)</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'rules'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>3. database.rules.json (Security Rules)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>4. คู่มือตั้งค่า & Deploy ทีละขั้น (Step-by-step)</span>
          </button>
        </div>

        {/* Tab 1: survey.html */}
        {activeTab === 'survey' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>survey.html (ไฟล์หน้าทำแบบประเมินสำหรับมือถือ)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mobile-first, ปุ่มใหญ่กดง่าย, ป้องกันการตอบซ้ำด้วย localStorage, ส่งตรงเข้า Firebase Realtime Database
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(surveyHtmlSource, 'survey')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'survey' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'survey' ? 'คัดลอกโค้ดแล้ว!' : 'คัดลอกโค้ดทั้งหมด'}</span>
                </button>
                <button
                  onClick={() => handleDownload(surveyHtmlSource, 'survey.html')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดไฟล์</span>
                </button>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="relative">
              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto max-h-[520px] leading-relaxed">
                {surveyHtmlSource}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: dashboard.html */}
        {activeTab === 'dashboard' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>dashboard.html (ไฟล์หน้า Dashboard สำหรับขึ้นจอโปรเจกเตอร์)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  คำนวณเฉลี่ยรายข้อ 1-5, สรุปเกณฑ์ 5 ระดับ, ตัวนับผู้ตอบ, กราฟแท่ง, ข้อความล่าสุด, QR Code, ปุ่มดาวน์โหลด CSV
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(dashboardHtmlSource, 'dashboard')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'dashboard' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === 'dashboard' ? 'คัดลอกโค้ดแล้ว!' : 'คัดลอกโค้ดทั้งหมด'}</span>
                </button>
                <button
                  onClick={() => handleDownload(dashboardHtmlSource, 'dashboard.html')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดไฟล์</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono overflow-x-auto max-h-[520px] leading-relaxed">
                {dashboardHtmlSource}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Security Rules */}
        {activeTab === 'rules' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>Firebase Realtime Database Security Rules</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ตั้งค่าสิทธิ์ให้อ่านและเขียนข้อมูลเฉพาะที่ path <code>/surveys</code> โดยผู้ใช้ไม่ต้องล็อกอิน
                </p>
              </div>

              <button
                onClick={() => handleCopy(securityRulesSource, 'rules')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'rules' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'rules' ? 'คัดลอก Rules แล้ว!' : 'คัดลอก Rules'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-amber-300 font-mono">
              <pre>{securityRulesSource}</pre>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                <span>วิธีนำไปวางใน Firebase Console:</span>
              </div>
              <p>1. เข้าไปที่ Firebase Console &gt; เลือกโปรเจกต์ของท่าน</p>
              <p>2. ในเมนูด้านซ้ายคลิก <strong>Build &gt; Realtime Database</strong></p>
              <p>3. คลิกแท็บ <strong>Rules</strong> ด้านบน</p>
              <p>4. วางโค้ด JSON ด้านบนแทนที่เนื้อหาเดิม แล้วกดปุ่ม <strong>Publish</strong> ด้านขวาบน</p>
            </div>
          </div>
        )}

        {/* Tab 4: Step-by-Step Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-6">

            {/* Step 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    สร้างโปรเจกต์ Firebase (ฟรี 100% ใน Spark Plan)
                  </h3>
                  <p className="text-xs text-slate-400">ใช้ Google Account ทั่วไป ไม่ต้องผูกบัตรเครดิต</p>
                </div>
              </div>
              <div className="text-sm text-slate-300 space-y-2 pl-11">
                <p>1. เข้าไปที่เว็บไซต์ <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold">Firebase Console <ExternalLink className="w-3.5 h-3.5" /></a></p>
                <p>2. คลิกปุ่ม <strong>"Add project"</strong> (สร้างโปรเจกต์)</p>
                <p>3. ตั้งชื่อโปรเจกต์ เช่น <code>training-survey-2026</code> แล้วกด Continue</p>
                <p>4. ส่วนของ Google Analytics สามารถกดยกเลิกติ๊กออกได้ (เพื่อความรวดเร็ว) แล้วกด <strong>Create Project</strong></p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    สร้าง Realtime Database
                  </h3>
                  <p className="text-xs text-slate-400">ฐานข้อมูลแบบ Realtime รับส่งข้อมูลได้ในระดับมิลลิวินาที</p>
                </div>
              </div>
              <div className="text-sm text-slate-300 space-y-2 pl-11">
                <p>1. ในเมนูด้านซ้าย คลิกที่ <strong>Build &gt; Realtime Database</strong></p>
                <p>2. คลิกปุ่ม <strong>"Create Database"</strong></p>
                <p>3. เลือกตำแหน่งฐานข้อมูล (Database location): แนะนำเลือก <code>asia-southeast1</code> (สิงคโปร์ ใกล้ไทยที่สุด) หรือ <code>us-central1</code> แล้วกด Next</p>
                <p>4. ในหน้า Security rules เลือก <strong>"Start in test mode"</strong> แล้วกด Enable</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    ตั้งค่า Security Rules เพื่อให้ผู้ตอบไม่ต้องล็อกอิน
                  </h3>
                  <p className="text-xs text-slate-400">ตอบแบบสอบถามได้ทันทีโดยไม่ต้อง Sign-in</p>
                </div>
              </div>
              <div className="text-sm text-slate-300 space-y-2 pl-11">
                <p>1. ในหน้า Realtime Database คลิกแท็บ <strong>Rules</strong> ด้านบน</p>
                <p>2. แก้ไขโค้ด Rules ให้เป็นตามนี้:</p>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-emerald-300 font-mono">
{`{
  "rules": {
    "surveys": {
      ".read": true,
      ".write": true
    }
  }
}`}
                </pre>
                <p>3. กดปุ่ม <strong>Publish</strong> ด้านขวาบน เพื่อบันทึกกฎ</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    คัดลอก Firebase Config มาใส่ในโค้ด
                  </h3>
                  <p className="text-xs text-slate-400">เชื่อมต่อโค้ด HTML เข้ากับฐานข้อมูลของท่าน</p>
                </div>
              </div>
              <div className="text-sm text-slate-300 space-y-2 pl-11">
                <p>1. คลิกที่ไอคอนรูปฟันเฟือง <strong>Project Settings</strong> (มุมซ้ายบน)</p>
                <p>2. เลื่อนลงมาด้านล่างสุดที่หัวข้อ <strong>"Your apps"</strong> คลิกที่ไอคอน Web (<strong>&lt;/&gt;</strong>)</p>
                <p>3. ตั้งชื่อแอป เช่น <code>SurveyWeb</code> แล้วกด Register app</p>
                <p>4. คัดลอกบล็อก <code>const firebaseConfig = &#123; ... &#125;;</code> ที่ได้ นำไปวางแทนที่ในไฟล์ <code>survey.html</code> และ <code>dashboard.html</code></p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                  5
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    วิธี Deploy ออนไลน์ฟรี (เลือกได้ตามความสะดวก)
                  </h3>
                  <p className="text-xs text-slate-400">มี URL จริงให้สแกนตอบ และมี SSL ปลอดภัย</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-11">
                
                {/* Method A */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <FolderGit2 className="w-4 h-4" />
                    <span>วิธีที่ 1: GitHub Pages</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">ง่ายที่สุด ไม่ต้องลงโปรแกรม</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    1. สร้าง repo ใหม่บน github.com<br />
                    2. อัปโหลดไฟล์ <code>survey.html</code> และ <code>dashboard.html</code><br />
                    3. ไปที่ Settings &gt; Pages &gt; เลือก Branch: main แล้ว Save<br />
                    4. จะได้ URL ฟรีทันที
                  </p>
                </div>

                {/* Method B */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Flame className="w-4 h-4" />
                    <span>วิธีที่ 2: Firebase Hosting</span>
                  </div>
                  <span className="text-[11px] text-blue-400 font-medium">เร็วและมาตรฐานสูงสุด</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    1. ติดตั้ง <code>npm i -g firebase-tools</code><br />
                    2. รัน <code>firebase login</code><br />
                    3. รัน <code>firebase init hosting</code><br />
                    4. นำไฟล์ใส่ในโฟลเดอร์ public แล้วรัน <code>firebase deploy</code>
                  </p>
                </div>

                {/* Method C */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <Globe className="w-4 h-4" />
                    <span>วิธีที่ 3: Vercel / Netlify</span>
                  </div>
                  <span className="text-[11px] text-teal-300 font-medium">ลากไฟล์วาง (Drag & Drop)</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    1. รวมไฟล์ทั้ง 2 ไว้ในโฟลเดอร์หนึ่ง<br />
                    2. เปิด app.netlify.com หรือ vercel.com<br />
                    3. ลากโฟลเดอร์ไปปล่อย (Drop)<br />
                    4. ได้ URL พร้อมใช้งานใน 5 วินาที
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
