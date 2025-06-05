import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import OpenAI from 'openai';
import { getRandomQuestions } from '../data/questions';

interface InterviewContextType {
  currentQuestion: number;
  questions: Question[];
  responses: Response[];
  isInterviewComplete: boolean;
  totalScore: number;
  addResponse: (text: string) => void;
  startInterview: () => void;
  restartInterview: () => void;
  aiTyping: boolean;
  timeRemaining: number;
  startTimer: () => void;
  resetTimer: () => void;
}

interface Question {
  id: number;
  text: string;
  maxScore: number;
}

interface Response {
  questionId: number;
  text: string;
  score: number;
  feedback?: string;
}

const QUESTION_TIME_LIMIT = 120;

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const InterviewContext = createContext<InterviewContextType | undefined>(
  undefined
);

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};

export const InterviewProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isInterviewComplete, setIsInterviewComplete] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [aiTyping, setAiTyping] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(QUESTION_TIME_LIMIT);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            addResponse("Time's up!");
            return QUESTION_TIME_LIMIT;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeRemaining]);

  const evaluateResponse = async (
    text: string,
    questionId: number
  ): Promise<{ score: number; feedback: string }> => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return { score: 0, feedback: 'Question not found' };

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert interviewer evaluating communication skills. Score responses from 0-10 and provide constructive feedback.',
          },
          {
            role: 'user',
            content: `Question: "${question.text}"\nCandidate's Response: "${text}"\n\nPlease evaluate this response and provide a score (0-10) and brief feedback. Focus on communication effectiveness, clarity, and structure.`,
          },
        ],
        model: 'gpt-3.5-turbo',
      });

      const response = completion.choices[0].message.content;
      const scoreMatch = response.match(/\b([0-9]|10)\b/);
      const score = scoreMatch ? parseInt(scoreMatch[0]) : 5;
      const feedback = response.replace(/\b([0-9]|10)\b/, '').trim();

      return { score, feedback };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        score: 5,
        feedback: 'Unable to evaluate response. Default score assigned.',
      };
    }
  };

  const addResponse = async (text: string) => {
    setAiTyping(true);
    setTimerActive(false);

    const questionId = questions[currentQuestion].id;
    const { score, feedback } = await evaluateResponse(text, questionId);

    const newResponse = {
      questionId,
      text,
      score,
      feedback,
    };

    setResponses([...responses, newResponse]);
    setTotalScore((prevScore) => prevScore + score);
    setTimeRemaining(QUESTION_TIME_LIMIT);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      startTimer();
    } else {
      setIsInterviewComplete(true);
    }

    setAiTyping(false);
  };

  const startTimer = () => {
    setTimeRemaining(QUESTION_TIME_LIMIT);
    setTimerActive(true);
  };

  const resetTimer = () => {
    setTimeRemaining(QUESTION_TIME_LIMIT);
    setTimerActive(false);
  };

  const startInterview = () => {
    const selectedQuestions = getRandomQuestions(5);
    setQuestions(selectedQuestions);
    setCurrentQuestion(0);
    setResponses([]);
    setIsInterviewComplete(false);
    setTotalScore(0);
    resetTimer();
  };

  const restartInterview = () => {
    startInterview();
  };

  return (
    <InterviewContext.Provider
      value={{
        currentQuestion,
        questions,
        responses,
        isInterviewComplete,
        totalScore,
        addResponse,
        startInterview,
        restartInterview,
        aiTyping,
        timeRemaining,
        startTimer,
        resetTimer,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};