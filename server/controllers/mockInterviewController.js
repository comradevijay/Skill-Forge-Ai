import asyncHandler from '../utils/asyncHandler.js';
import MockInterview from '../models/MockInterview.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

async function groqChat(system, userMsg) {
  const resp = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 400,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMsg },
      ],
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || 'Groq error');
  return data.choices[0].message.content.trim();
}

const TOPIC_SYSTEM = {
  Java: 'You are a senior Java developer conducting a technical interview. Ask one focused Java interview question at a time (core Java, OOP, collections, multithreading, JVM). Keep questions concise.',
  React: 'You are a senior React developer conducting a technical interview. Ask one focused React interview question at a time (hooks, state, lifecycle, performance, patterns). Keep questions concise.',
  Node: 'You are a senior Node.js developer conducting a technical interview. Ask one focused Node.js interview question at a time (event loop, async, streams, Express, REST APIs). Keep questions concise.',
  MongoDB: 'You are a senior MongoDB/database engineer conducting a technical interview. Ask one focused MongoDB question at a time (schema design, aggregation, indexing, CRUD). Keep questions concise.',
  SQL: 'You are a senior database engineer conducting a technical interview. Ask one focused SQL question at a time (joins, subqueries, indexing, normalization, transactions). Keep questions concise.',
  HR: 'You are an experienced HR interviewer conducting a behavioral interview for a fresher software developer role. Ask one behavioral or situational question at a time (teamwork, challenges, goals, strengths, projects). Keep questions concise.',
};

// POST /api/ai/interview/start
export const startInterview = asyncHandler(async (req, res) => {
  const { topic } = req.body;
  if (!topic || !TOPIC_SYSTEM[topic]) {
    res.status(400);
    throw new Error('Invalid topic');
  }

  const question = await groqChat(
    TOPIC_SYSTEM[topic],
    'Ask me the first interview question. Only output the question, no preamble.'
  );

  const session = await MockInterview.create({
    user: req.user._id,
    topic,
    qas: [{ question }],
  });

  res.status(201).json({ sessionId: session._id, question });
});

// POST /api/ai/interview/answer
export const submitAnswer = asyncHandler(async (req, res) => {
  const { sessionId, answer } = req.body;
  if (!sessionId || !answer?.trim()) {
    res.status(400);
    throw new Error('sessionId and answer are required');
  }

  const session = await MockInterview.findOne({ _id: sessionId, user: req.user._id });
  if (!session) {
    res.status(404);
    throw new Error('Interview session not found');
  }
  if (session.status === 'completed') {
    res.status(400);
    throw new Error('Interview already completed');
  }

  const lastQA = session.qas[session.qas.length - 1];
  const topic = session.topic;

  // Evaluate the answer
  const evalPrompt = `Question: "${lastQA.question}"\nCandidate's Answer: "${answer}"\n\nEvaluate the answer in 2-3 sentences. Mention what was good and what was missing. Then on a new line output exactly: Score: X/10`;
  const evaluation = await groqChat(
    `You are an expert ${topic} interviewer. Evaluate interview answers fairly but honestly for a fresher developer.`,
    evalPrompt
  );

  // Extract score
  const scoreMatch = evaluation.match(/Score:\s*(\d+)\s*\/\s*10/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

  // Update the last QA
  lastQA.answer = answer;
  lastQA.evaluation = evaluation;
  lastQA.score = score;

  // Decide whether to ask next question (max 5 questions per session)
  const questionCount = session.qas.length;
  let nextQuestion = null;

  if (questionCount < 5) {
    const prevQs = session.qas.map((q) => q.question).join('\n');
    nextQuestion = await groqChat(
      TOPIC_SYSTEM[topic],
      `Previous questions asked:\n${prevQs}\n\nAsk the next interview question. Do not repeat previous questions. Only output the question, no preamble.`
    );
    session.qas.push({ question: nextQuestion });
  } else {
    session.status = 'completed';
  }

  await session.save();

  res.json({
    evaluation,
    score,
    nextQuestion,
    isComplete: session.status === 'completed',
    totalQuestions: session.qas.length,
  });
});

// GET /api/ai/interview/history
export const getHistory = asyncHandler(async (req, res) => {
  const sessions = await MockInterview.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ sessions });
});

// GET /api/ai/interview/session/:id
export const getSession = asyncHandler(async (req, res) => {
  const session = await MockInterview.findOne({ _id: req.params.id, user: req.user._id });
  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }
  res.json({ session });
});