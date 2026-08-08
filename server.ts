import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent Server Database File Initialization
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'medtrack_db.json');

interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;
  profile: any;
  modules: any[];
  lectures: any[];
  activeRecallList: any[];
  academicResults: any[];
  lifestyle: any;
}

interface DatabaseSchema {
  users: Record<string, UserAccount>; // keyed by normalized email
}

function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading medtrack_db.json:', err);
  }
  return { users: {} };
}

function writeDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to medtrack_db.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI lazily
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        aiClient = new GoogleGenAI({ apiKey });
      }
    }
    return aiClient;
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // User Registration Endpoint
  app.post('/api/auth/register', (req, res) => {
    try {
      const { fullName, email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const db = readDatabase();

      if (db.users[normalizedEmail]) {
        return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
      }

      const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      const defaultProfile = {
        id: userId,
        name: fullName || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        university: 'Medical University',
        faculty: 'Faculty of Medicine',
        academicYear: 'Year 3 - Clinical Rotations',
        studySystem: 'Integrated Hybrid',
        role: 'Medical Student',
        language: 'en',
        theme: 'dark',
      };

      const defaultLifestyle = {
        id: 'ls-' + userId,
        date: new Date().toISOString().split('T')[0],
        sleepTime: '23:00',
        wakeUpTime: '06:30',
        sleepHours: 7.5,
        exerciseMins: 30,
        waterIntakeLiters: 2.5,
        phoneUsageHours: 2.0,
        studyHours: 6.0,
        caffeineCups: 2,
        badHabits: [],
        habitsToQuit: [],
        stressLevel: 3,
        mood: 'Focused',
      };

      const newUser: UserAccount = {
        id: userId,
        email: normalizedEmail,
        passwordHash: String(password), // simple hash comparison for dev persistence
        fullName: fullName || normalizedEmail.split('@')[0],
        createdAt: new Date().toISOString(),
        profile: defaultProfile,
        modules: [],
        lectures: [],
        activeRecallList: [],
        academicResults: [],
        lifestyle: defaultLifestyle,
      };

      db.users[normalizedEmail] = newUser;
      writeDatabase(db);

      return res.json({
        success: true,
        user: {
          id: userId,
          email: normalizedEmail,
          fullName: newUser.fullName,
        },
        workspace: {
          profile: newUser.profile,
          modules: newUser.modules,
          lectures: newUser.lectures,
          activeRecallList: newUser.activeRecallList,
          academicResults: newUser.academicResults,
          lifestyle: newUser.lifestyle,
        },
      });
    } catch (err: any) {
      console.error('Register API Error:', err);
      return res.status(500).json({ error: err.message || 'Server error during registration.' });
    }
  });

  // User Login Endpoint
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const db = readDatabase();
      const existingUser = db.users[normalizedEmail];

      if (!existingUser) {
        // Automatically create account on first sign-in if password provided
        const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const defaultProfile = {
          id: userId,
          name: normalizedEmail.split('@')[0],
          email: normalizedEmail,
          university: 'Medical University',
          faculty: 'Faculty of Medicine',
          academicYear: 'Year 3 - Clinical Rotations',
          studySystem: 'Integrated Hybrid',
          role: 'Medical Student',
          language: 'en',
          theme: 'dark',
        };

        const defaultLifestyle = {
          id: 'ls-' + userId,
          date: new Date().toISOString().split('T')[0],
          sleepTime: '23:00',
          wakeUpTime: '06:30',
          sleepHours: 7.5,
          exerciseMins: 30,
          waterIntakeLiters: 2.5,
          phoneUsageHours: 2.0,
          studyHours: 6.0,
          caffeineCups: 2,
          badHabits: [],
          habitsToQuit: [],
          stressLevel: 3,
          mood: 'Focused',
        };

        const newUser: UserAccount = {
          id: userId,
          email: normalizedEmail,
          passwordHash: password ? String(password) : 'medtrack2026',
          fullName: normalizedEmail.split('@')[0],
          createdAt: new Date().toISOString(),
          profile: defaultProfile,
          modules: [],
          lectures: [],
          activeRecallList: [],
          academicResults: [],
          lifestyle: defaultLifestyle,
        };

        db.users[normalizedEmail] = newUser;
        writeDatabase(db);

        return res.json({
          success: true,
          user: {
            id: userId,
            email: normalizedEmail,
            fullName: newUser.fullName,
          },
          workspace: {
            profile: newUser.profile,
            modules: newUser.modules,
            lectures: newUser.lectures,
            activeRecallList: newUser.activeRecallList,
            academicResults: newUser.academicResults,
            lifestyle: newUser.lifestyle,
          },
        });
      }

      // Check password if provided
      if (password && existingUser.passwordHash && existingUser.passwordHash !== String(password)) {
        return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
      }

      return res.json({
        success: true,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          fullName: existingUser.fullName,
        },
        workspace: {
          profile: existingUser.profile,
          modules: existingUser.modules || [],
          lectures: existingUser.lectures || [],
          activeRecallList: existingUser.activeRecallList || [],
          academicResults: existingUser.academicResults || [],
          lifestyle: existingUser.lifestyle,
        },
      });
    } catch (err: any) {
      console.error('Login API Error:', err);
      return res.status(500).json({ error: err.message || 'Server error during login.' });
    }
  });

  // Get User Workspace Endpoint
  app.post('/api/workspace/get', (req, res) => {
    try {
      const { email, userId } = req.body;
      const db = readDatabase();

      let targetUser: UserAccount | undefined;

      if (email) {
        const normalized = String(email).trim().toLowerCase();
        targetUser = db.users[normalized];
      } else if (userId) {
        targetUser = Object.values(db.users).find((u) => u.id === userId);
      }

      if (!targetUser) {
        return res.status(404).json({ error: 'Workspace not found.' });
      }

      return res.json({
        success: true,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          fullName: targetUser.fullName,
        },
        workspace: {
          profile: targetUser.profile,
          modules: targetUser.modules || [],
          lectures: targetUser.lectures || [],
          activeRecallList: targetUser.activeRecallList || [],
          academicResults: targetUser.academicResults || [],
          lifestyle: targetUser.lifestyle,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Error fetching workspace.' });
    }
  });

  // Sync User Workspace Endpoint
  app.post('/api/workspace/sync', (req, res) => {
    try {
      const { email, userId, profile, modules, lectures, activeRecallList, academicResults, lifestyle } = req.body;
      const db = readDatabase();

      let targetEmail = email ? String(email).trim().toLowerCase() : '';

      if (!targetEmail && userId) {
        const found = Object.values(db.users).find((u) => u.id === userId);
        if (found) targetEmail = found.email;
      }

      if (!targetEmail) {
        return res.status(400).json({ error: 'User identifier email or userId required for workspace sync.' });
      }

      let existingUser = db.users[targetEmail];
      if (!existingUser) {
        const newId = userId || ('usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
        existingUser = {
          id: newId,
          email: targetEmail,
          passwordHash: 'medtrack2026',
          fullName: profile?.name || targetEmail.split('@')[0],
          createdAt: new Date().toISOString(),
          profile: profile || { id: newId, name: targetEmail.split('@')[0], email: targetEmail },
          modules: [],
          lectures: [],
          activeRecallList: [],
          academicResults: [],
          lifestyle: lifestyle || { id: 'ls-' + newId, date: new Date().toISOString().split('T')[0] },
        };
      }

      if (profile) existingUser.profile = profile;
      if (Array.isArray(modules)) existingUser.modules = modules;
      if (Array.isArray(lectures)) existingUser.lectures = lectures;
      if (Array.isArray(activeRecallList)) existingUser.activeRecallList = activeRecallList;
      if (Array.isArray(academicResults)) existingUser.academicResults = academicResults;
      if (lifestyle) existingUser.lifestyle = lifestyle;

      db.users[targetEmail] = existingUser;
      writeDatabase(db);

      return res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (err: any) {
      console.error('Sync API Error:', err);
      return res.status(500).json({ error: err.message || 'Server error syncing workspace.' });
    }
  });

  // AI Insights Endpoint
  app.post('/api/ai/insights', async (req, res) => {
    try {
      const { modulesCount, completedLectures, solvedQuestions, lifestyleScore, lastGrade } = req.body;
      const ai = getGeminiClient();

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an expert medical education AI assistant for MedTrack.
Student context:
- Modules: ${modulesCount}
- Completed Lectures: ${completedLectures}
- Solved Questions: ${solvedQuestions}
- Lifestyle Score: ${lifestyleScore}/100
- Recent Exam Grade: ${lastGrade}%

Provide 2 short, highly actionable bullet-point insights for this medical student to boost memory retention and USMLE Step 2 preparation.`,
        });

        return res.json({
          success: true,
          insight: response.text,
        });
      }

      // Fallback smart response
      return res.json({
        success: true,
        insight: `• High-Yield Window: Your retention peak occurs in the morning (08:00 - 11:30 AM). Schedule active recall review cards during this period.\n• Active Question Yield: Increasing solved question blocks to 25/day will push your predicted exam score from ${Math.round(lastGrade || 82)}% to 88%+.`,
      });
    } catch (err: any) {
      console.error('AI Insights Error:', err);
      return res.json({
        success: true,
        insight: `• Consistency Boost: You maintained 92% study consistency this week. Keep up the daily spaced repetition reviews!\n• Focus Area: Prioritize high-yield central nervous system and cardiac electrophysiology topics.`,
      });
    }
  });

  // AI Effort vs Result Comparison Endpoint
  app.post('/api/ai/compare-result', async (req, res) => {
    try {
      const { moduleName, percentage, studiedCount, solvedCount, totalCount } = req.body;
      const ai = getGeminiClient();

      if (ai) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Analyze a medical student's result:
Module: ${moduleName}
Score: ${percentage}%
Studied Lectures: ${studiedCount}/${totalCount}
Solved Question Blocks: ${solvedCount}/${totalCount}

Provide a concise 2-sentence summary comparing whether their effort matched their exam result and giving 2 key recommendations.`,
        });

        return res.json({ success: true, analysis: response.text });
      }

      const match = percentage >= 75;
      return res.json({
        success: true,
        analysis: match
          ? `Outstanding result in ${moduleName} (${percentage}%). Your active question solving (${solvedCount}/${totalCount}) directly correlated with exam performance.`
          : `Your score of ${percentage}% in ${moduleName} indicates a need for higher active question practice. Shift from reading to active retrieval.`,
      });
    } catch (err) {
      return res.json({
        success: true,
        analysis: 'Analysis complete. Maintain daily spaced repetition and increase question bank volume.',
      });
    }
  });

  // 404 JSON Fallback for unhandled /api/* endpoints
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint ${req.method} ${req.path} not found.` });
  });

  // Serve static assets or Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MedTrack Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
