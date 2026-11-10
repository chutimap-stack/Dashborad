import { QuestionDef, InterpretationResult } from './types';

export const STANDARD_QUESTIONS: QuestionDef[] = [
  {
    id: 'q1',
    title: '1. ความรู้ความเข้าใจในเนื้อหาหลักสูตร',
    subtitle: 'เนื้อหามีประโยชน์ ทันสมัย และตรงกับความคาดหวัง',
    category: 'เนื้อหาหลักสูตร',
  },
  {
    id: 'q2',
    title: '2. ความสามารถและเทคนิคการถ่ายทอดของวิทยากร',
    subtitle: 'อธิบายชัดเจน ยกตัวอย่างเห็นภาพ และตอบข้อซักถามได้ดี',
    category: 'วิทยากร',
  },
  {
    id: 'q3',
    title: '3. ประโยชน์ที่ได้รับและสามารถนำไปประยุกต์ใช้จริง',
    subtitle: 'เพิ่มพูนทักษะ และสามารถนำไปปรับใช้ในการทำงานหรือการเรียนได้',
    category: 'การประยุกต์ใช้',
  },
  {
    id: 'q4',
    title: '4. ความเหมาะสมของเอกสาร สื่อ และระยะเวลา',
    subtitle: 'เวลาเหมาะสม อุปกรณ์และสื่อการสอนมีความพร้อมและเข้าใจง่าย',
    category: 'สื่อและเวลา',
  },
  {
    id: 'q5',
    title: '5. ความพึงพอใจในภาพรวมของการจัดอบรม',
    subtitle: 'ความรู้สึกโดยรวมต่อการบริหารจัดการและบรรยากาศการอบรม',
    category: 'ภาพรวม',
  },
];

export const RATING_SCALE_DESCRIPTIONS: { [key: number]: { label: string; desc: string } } = {
  5: { label: 'มากที่สุด', desc: 'ยอดเยี่ยม เกินความคาดหมาย' },
  4: { label: 'มาก', desc: 'ดี ตรงตามมาตรฐาน' },
  3: { label: 'ปานกลาง', desc: 'พอใช้ อยู่ในเกณฑ์ปานกลาง' },
  2: { label: 'น้อย', desc: 'ต้องปรับปรุงบางส่วน' },
  1: { label: 'น้อยที่สุด', desc: 'ไม่เป็นที่พึงพอใจ' },
};

/**
 * เกณฑ์การแปลผลค่าเฉลี่ยแบบ 5 ระดับ (Likert Scale Standard)
 * 4.51 - 5.00: ระดับมากที่สุด
 * 3.51 - 4.50: ระดับมาก
 * 2.51 - 3.50: ระดับปานกลาง
 * 1.51 - 2.50: ระดับน้อย
 * 1.00 - 1.50: ระดับน้อยที่สุด
 */
export function getScoreInterpretation(score: number): InterpretationResult {
  if (score >= 4.51) {
    return {
      level: 'มากที่สุด',
      levelEn: 'Highest',
      color: 'emerald',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500',
      barColor: 'from-emerald-500 to-teal-400',
    };
  }
  if (score >= 3.51) {
    return {
      level: 'มาก',
      levelEn: 'High',
      color: 'teal',
      badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      textColor: 'text-teal-400',
      borderColor: 'border-teal-500',
      barColor: 'from-teal-500 to-cyan-400',
    };
  }
  if (score >= 2.51) {
    return {
      level: 'ปานกลาง',
      levelEn: 'Moderate',
      color: 'amber',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500',
      barColor: 'from-amber-500 to-yellow-400',
    };
  }
  if (score >= 1.51) {
    return {
      level: 'น้อย',
      levelEn: 'Low',
      color: 'orange',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500',
      barColor: 'from-orange-500 to-amber-500',
    };
  }
  return {
    level: 'น้อยที่สุด',
    levelEn: 'Lowest',
    color: 'rose',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500',
    barColor: 'from-rose-500 to-red-400',
  };
}

export const SAMPLE_FIREBASE_CONFIG = {
  apiKey: "AIzaSyEXAMPLE_KEY_FOR_TESTING_ONLY",
  authDomain: "training-survey-2026.firebaseapp.com",
  databaseURL: "https://training-survey-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "training-survey-2026",
  storageBucket: "training-survey-2026.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
