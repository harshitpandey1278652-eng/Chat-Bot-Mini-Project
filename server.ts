import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Helper to construct academic system prompt based on mode, level, and subject
function getSystemPrompt(studyMode: string, academicLevel: string, subject: string): string {
  const basePrompt = `You are "ScholarAI", an elite university-level academic tutor and study response assistant.
Your student is at the "${academicLevel || 'Undergraduate'}" level studying "${subject || 'General Academic Studies'}".
Always respond with clarity, intellectual depth, pedagogical patience, and structured formatting (markdown headers, bullet points, math notations, code blocks with language tags when relevant).`;

  let modeInstruction = '';

  switch (studyMode) {
    case 'progressive':
      modeInstruction = `
STRUCTURE YOUR RESPONSE IN 4 PROGRESSIVE TIERS FROM BASIC TO ADVANCED:
1. 🟢 [Level 1: Intuition & Core Concept (Basic)]
   - Simple, crystal-clear definition.
   - Real-world intuition or analogy (Explain Like I'm New to the Topic).
   - Why this concept matters.
2. 🟡 [Level 2: Mechanics, Principles & Step-by-Step Breakdown (Intermediate)]
   - How it works internally / step-by-step walk-through.
   - Core formulas, rules, diagrams (described or ASCII), or canonical examples.
3. 🔴 [Level 3: Mathematical Rigor & Academic Deep-Dive (Advanced)]
   - Formal mathematical or theoretical formulation.
   - Edge cases, proofs, theorem connections, performance complexity (if CS), or advanced caveats.
   - Scholarly context or industry relevance.
4. 🧠 [Level 4: Self-Check & Active Recall Challenge]
   - 1 quick conceptual question or practice puzzle with a collapsible or hidden hint to test comprehension.`;
      break;

    case 'socratic':
      modeInstruction = `
SOCRATIC TUTOR MODE:
- Do NOT simply give away the direct answer or write their entire homework assignment.
- Guide the student step-by-step.
- Point out what they already know, ask 1-2 targeted guiding questions, and offer small hints.
- Celebrate correct intuition and gently scaffold them toward discovering the solution themselves.
- Keep responses conversational, encouraging, and focused on active critical thinking.`;
      break;

    case 'advanced':
      modeInstruction = `
GRADUATE / ADVANCED ACADEMIC RIGOR MODE:
- Provide high-density, rigorous academic exposition.
- Include precise formal definitions, underlying theorems, mathematical formulas, and algorithmic proofs where applicable.
- Discuss asymptotic complexities, edge cases, real-world research papers, or contemporary debates in the field.
- Expect university-level comprehension.`;
      break;

    case 'code_analysis':
      modeInstruction = `
COMPUTER SCIENCE & ALGORITHM LAB MODE:
- Focus on algorithmic logic, data structures, and implementation.
- Include:
  1. Time Complexity (Big-O: Best, Average, Worst) & Space Complexity.
  2. Clean, well-commented code snippet (Python, TypeScript, C++, or requested language).
  3. Line-by-line or step-by-step logic tracing table / dry run with an example input.
  4. Common traps, memory/performance optimizations, and interview/exam tips.`;
      break;

    case 'exam_prep':
      modeInstruction = `
EXAM PREP & REVISION CRASH-COURSE MODE:
- Focus on high-yield, exam-critical points.
- Include:
  1. 📌 Key takeaways & must-memorize formulas/definitions.
  2. ⚠️ Common traps and frequent mistakes students make on college exams.
  3. 💡 Mnemonic devices or mental models for fast recall.
  4. 📝 2 likely exam-style practice questions with model answers.`;
      break;

    case 'basic':
    default:
      modeInstruction = `
FOUNDATIONAL / BASIC EXPLANATION MODE:
- Focus on intuitive understanding, simple language without unnecessary jargon.
- Use relatable everyday analogies, clear examples, and gentle step-by-step walk-throughs.
- Friendly, encouraging tone for students building their confidence.`;
      break;
  }

  return `${basePrompt}\n${modeInstruction}\n\nUse clean Markdown with bolding, lists, and code blocks for readability.`;
}

// 1. Streaming Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, studyMode = 'progressive', academicLevel = 'Undergraduate', subject = 'General Science', attachedText } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      return;
    }

    const systemInstruction = getSystemPrompt(studyMode, academicLevel, subject);

    // Prepare contents formatted for Gemini
    // Incorporate any attached study notes/document text into the latest user prompt if present
    const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      let contentText = msg.content;

      // If it's the last message and has attached notes/document, prefix context
      if (i === messages.length - 1 && attachedText && attachedText.trim()) {
        contentText = `[ATTACHED STUDY MATERIAL / LECTURE NOTES]:\n${attachedText.trim()}\n\n[STUDENT QUERY]:\n${contentText}`;
      }

      formattedContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: contentText }],
      });
    }

    // Set up Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    // Attempt generation with automatic model fallback if high-demand/503 occurs
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let iterator: any = null;
    let firstChunkText = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const stream = await ai.models.generateContentStream({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: studyMode === 'socratic' ? 0.7 : 0.4,
          },
        });
        const it = stream[Symbol.asyncIterator]();
        const first = await it.next();
        if (!first.done) {
          firstChunkText = first.value?.text || '';
          iterator = it;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} stream failed on initial chunk:`, err?.message || err);
      }
    }

    if (!iterator) {
      throw lastError || new Error('All candidate Gemini models are currently busy. Please retry in a few moments.');
    }

    if (firstChunkText) {
      res.write(`data: ${JSON.stringify({ chunk: firstChunkText })}\n\n`);
    }

    while (true) {
      const { done, value } = await iterator.next();
      if (done) break;
      const chunkText = value?.text || '';
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || 'Error communicating with Gemini API' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error?.message || 'Stream error occurred' })}\n\n`);
      res.end();
    }
  }
});

// Helper to generate content with fallback across candidate models
async function generateWithModelFallback(config: any) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastErr = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...config,
        model,
      });
      return response;
    } catch (err: any) {
      lastErr = err;
      console.warn(`generateContent failed on ${model}:`, err?.message || err);
    }
  }
  throw lastErr || new Error('All model attempts failed');
}

// 2. Generate Interactive Flashcards
app.post('/api/generate-flashcards', async (req: Request, res: Response) => {
  try {
    const { topic, context, count = 6, difficulty = 'All Levels' } = req.body;
    if (!topic && !context) {
      res.status(400).json({ error: 'Topic or context is required' });
      return;
    }

    const prompt = `Generate ${count} academic study flashcards for college students on the topic: "${topic || 'Provided Study Material'}".
Difficulty focus: ${difficulty}.
${context ? `Use this context as source material:\n${context}` : ''}
Make each card clear, accurate, and high-yield for exam preparation.
Provide a mix from fundamental definition to intermediate application to advanced concept.`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic flashcard generator for college students.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'A list of academic study flashcards',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              frontQuestion: { type: Type.STRING, description: 'Question or key concept prompt on front of card' },
              backAnswer: { type: Type.STRING, description: 'Clear, concise explanation on back of card' },
              difficulty: { type: Type.STRING, description: 'Basic, Intermediate, or Advanced' },
              keyTerm: { type: Type.STRING, description: 'Core term or formula highlighted' },
              quickTip: { type: Type.STRING, description: 'Memory mnemonic or exam tip' },
            },
            required: ['id', 'frontQuestion', 'backAnswer', 'difficulty', 'keyTerm'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ flashcards: parsed });
  } catch (error: any) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate flashcards' });
  }
});

// 3. Generate Multiple-Choice Quiz
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { topic, context, count = 5, difficulty = 'Undergraduate' } = req.body;
    if (!topic && !context) {
      res.status(400).json({ error: 'Topic or context is required' });
      return;
    }

    const prompt = `Generate a ${count}-question college-level multiple choice quiz on "${topic || 'Study Topic'}".
Academic difficulty: ${difficulty}.
${context ? `Based on this reference material:\n${context}` : ''}
Include 4 plausible options for each question, specify the 0-indexed correct option, and provide a clear pedagogical explanation of why that option is correct and why the distractors are wrong.`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are a university exam creator designing high-quality, conceptually sound multiple choice questions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'Array of quiz questions',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Four distinct answer choices',
              },
              correctIndex: { type: Type.INTEGER, description: 'Index of correct answer (0, 1, 2, or 3)' },
              explanation: { type: Type.STRING, description: 'Detailed breakdown of the correct answer and distractor traps' },
              difficulty: { type: Type.STRING, description: 'Basic, Intermediate, or Advanced' },
              topicArea: { type: Type.STRING, description: 'Specific sub-concept tested' },
            },
            required: ['id', 'question', 'options', 'correctIndex', 'explanation', 'difficulty'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ quiz: parsed });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate quiz' });
  }
});

// 4. Generate Structured Study Plan / Revision Roadmap
app.post('/api/generate-study-plan', async (req: Request, res: Response) => {
  try {
    const { subject, topic, days = 7, dailyHours = 2, targetGrade = 'A / Mastery' } = req.body;

    const prompt = `Create a structured ${days}-day academic study plan for the subject "${subject}" focusing on "${topic}".
Daily study commitment: ${dailyHours} hours/day. Target outcome: ${targetGrade}.
Organize day by day with progressive milestones (Days 1-2: Foundations & Core Mechanics, Days 3-5: Problem Solving & Advanced Edge Cases, Final Days: Mock Practice, Review & Self-Testing).`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic learning advisor and curriculum designer for university students.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            overview: { type: Type.STRING },
            targetSubject: { type: Type.STRING },
            totalDays: { type: Type.INTEGER },
            dailySchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  tier: { type: Type.STRING, description: 'Foundation, Core Application, Advanced Deep-Dive, or Exam Simulation' },
                  estimatedHours: { type: Type.NUMBER },
                  keyTasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  practiceProblemIdea: { type: Type.STRING },
                  masteryCheck: { type: Type.STRING },
                },
                required: ['dayNumber', 'title', 'tier', 'keyTasks', 'masteryCheck'],
              },
            },
            proStudyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['planTitle', 'overview', 'dailySchedule', 'proStudyTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ studyPlan: parsed });
  } catch (error: any) {
    console.error('Study plan error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate study plan' });
  }
});

// 5. Generate Voice Audio (TTS) for Study Summaries
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    // Limit text to 600 characters for concise, crisp audio readout
    const truncatedText = text.slice(0, 600);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: truncatedText,
              speechMetadata: {
                style: 'Clear, engaging academic professor and supportive tutor',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audioBase64: base64Audio, format: 'audio/wav' });
    } else {
      res.status(500).json({ error: 'No audio generated by model' });
    }
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate TTS' });
  }
});

// Vite middleware for dev or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
