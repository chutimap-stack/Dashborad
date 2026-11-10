import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SurveyResponse {
  id: string;
  timestamp: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  average: number;
  feedback: string;
  deviceHash?: string;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory responses store with initial realistic sample data so the dashboard is immediately impressive
let responses: SurveyResponse[] = [
  {
    id: 'sample-1',
    timestamp: Date.now() - 1000 * 60 * 42,
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 4,
    q5: 5,
    average: 4.8,
    feedback: 'วิทยากรอธิบายเข้าใจง่ายมาก มีตัวอย่างชัดเจน อยากให้จัดกิจกรรมแบบนี้อีกครับ',
  },
  {
    id: 'sample-2',
    timestamp: Date.now() - 1000 * 60 * 30,
    q1: 4,
    q2: 5,
    q3: 4,
    q4: 4,
    q5: 4,
    average: 4.2,
    feedback: 'เนื้อหาแน่นดีมาก สไลด์อ่านง่าย สามารถนำไปต่อยอดใช้กับงานจริงได้ทันที',
  },
  {
    id: 'sample-3',
    timestamp: Date.now() - 1000 * 60 * 18,
    q1: 5,
    q2: 4,
    q3: 5,
    q4: 5,
    q5: 5,
    average: 4.8,
    feedback: 'ชอบการทำ Workshop มาก ได้ลงมือทำจริง ขอบคุณทีมงานทุกคนค่ะ',
  },
  {
    id: 'sample-4',
    timestamp: Date.now() - 1000 * 60 * 8,
    q1: 4,
    q2: 4,
    q3: 4,
    q4: 3,
    q5: 4,
    average: 3.8,
    feedback: 'เวลาช่วงบ่ายกระชับไปนิดหน่อย อยากให้เพิ่มเวลาช่วง Q&A แต่ภาพรวมประทับใจมาก',
  },
  {
    id: 'sample-5',
    timestamp: Date.now() - 1000 * 60 * 2,
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 4,
    q5: 5,
    average: 4.8,
    feedback: 'ระบบและอุปกรณ์พร้อมมาก บรรยากาศการเรียนเป็นกันเอง ยอดเยี่ยมครับ',
  },
];

// Server-Sent Events (SSE) clients for real-time dashboard broadcast
let sseClients: Response[] = [];

function broadcastUpdate() {
  const payload = `data: ${JSON.stringify(responses)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // Ignore client write errors
    }
  });
}

// API Routes
app.get('/api/responses', (_req: Request, res: Response) => {
  res.json({ success: true, count: responses.length, data: responses });
});

app.post('/api/responses', (req: Request, res: Response) => {
  const { q1, q2, q3, q4, q5, feedback, deviceHash } = req.body;

  if (!q1 || !q2 || !q3 || !q4 || !q5) {
    return res.status(400).json({ success: false, message: 'กรุณาตอบคำถามให้ครบทั้ง 5 ข้อ' });
  }

  // Prevent duplicate within server if deviceHash is provided
  if (deviceHash) {
    const existing = responses.find((r) => r.deviceHash === deviceHash);
    if (existing) {
      return res.status(400).json({ success: false, message: 'ท่านได้ตอบแบบประเมินเรียบร้อยแล้ว' });
    }
  }

  const numQ1 = Math.min(5, Math.max(1, Number(q1)));
  const numQ2 = Math.min(5, Math.max(1, Number(q2)));
  const numQ3 = Math.min(5, Math.max(1, Number(q3)));
  const numQ4 = Math.min(5, Math.max(1, Number(q4)));
  const numQ5 = Math.min(5, Math.max(1, Number(q5)));

  const average = Number(((numQ1 + numQ2 + numQ3 + numQ4 + numQ5) / 5).toFixed(2));

  const newResponse: SurveyResponse = {
    id: 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: Date.now(),
    q1: numQ1,
    q2: numQ2,
    q3: numQ3,
    q4: numQ4,
    q5: numQ5,
    average,
    feedback: typeof feedback === 'string' ? feedback.trim() : '',
    deviceHash,
  };

  responses.unshift(newResponse);
  broadcastUpdate();

  return res.status(201).json({ success: true, data: newResponse });
});

// SSE endpoint for live sync
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial data immediately
  res.write(`data: ${JSON.stringify(responses)}\n\n`);
  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter((client) => client !== res);
  });
});

// Reset endpoint for organizers / demo testing
app.post('/api/reset', (_req: Request, res: Response) => {
  responses = [];
  broadcastUpdate();
  res.json({ success: true, message: 'รีเซ็ตข้อมูลสำเร็จ' });
});

// Seed sample responses
app.post('/api/seed', (_req: Request, res: Response) => {
  responses = [
    {
      id: 'sample-1',
      timestamp: Date.now() - 1000 * 60 * 35,
      q1: 5,
      q2: 5,
      q3: 5,
      q4: 4,
      q5: 5,
      average: 4.8,
      feedback: 'วิทยากรอธิบายเข้าใจง่ายมาก มีตัวอย่างชัดเจน อยากให้จัดกิจกรรมแบบนี้อีกครับ',
    },
    {
      id: 'sample-2',
      timestamp: Date.now() - 1000 * 60 * 25,
      q1: 4,
      q2: 5,
      q3: 4,
      q4: 4,
      q5: 4,
      average: 4.2,
      feedback: 'เนื้อหาแน่นดีมาก สไลด์อ่านง่าย สามารถนำไปต่อยอดใช้กับงานจริงได้ทันที',
    },
    {
      id: 'sample-3',
      timestamp: Date.now() - 1000 * 60 * 15,
      q1: 5,
      q2: 4,
      q3: 5,
      q4: 5,
      q5: 5,
      average: 4.8,
      feedback: 'ชอบการทำ Workshop มาก ได้ลงมือทำจริง ขอบคุณทีมงานทุกคนค่ะ',
    },
    {
      id: 'sample-4',
      timestamp: Date.now() - 1000 * 60 * 5,
      q1: 4,
      q2: 4,
      q3: 4,
      q4: 3,
      q5: 4,
      average: 3.8,
      feedback: 'เวลาช่วงบ่ายกระชับไปนิดหน่อย อยากให้เพิ่มเวลาช่วง Q&A แต่ภาพรวมประทับใจมาก',
    },
    {
      id: 'sample-5',
      timestamp: Date.now() - 1000 * 60 * 1,
      q1: 5,
      q2: 5,
      q3: 5,
      q4: 4,
      q5: 5,
      average: 4.8,
      feedback: 'ระบบและอุปกรณ์พร้อมมาก บรรยากาศการเรียนเป็นกันเอง ยอดเยี่ยมครับ',
    },
  ];
  broadcastUpdate();
  res.json({ success: true, count: responses.length, data: responses });
});

// Serve public directory
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
app.use(express.static(publicDir));

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
