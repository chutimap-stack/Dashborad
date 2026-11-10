export interface SurveyResponse {
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

export interface QuestionDef {
  id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
  title: string;
  subtitle: string;
  category: string;
}

export interface InterpretationResult {
  level: string;
  levelEn: string;
  color: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  barColor: string;
}

export interface SurveyStats {
  total: number;
  overallAverage: number;
  satisfactionPercent: number;
  interpretation: InterpretationResult;
  questionAverages: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
  };
  questionDistributions: {
    [key: string]: { [star: number]: number };
  };
  feedbackCount: number;
}
