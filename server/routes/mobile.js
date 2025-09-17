import express from 'express';
import bcrypt from 'bcryptjs';
import MobileUser from '../models/MobileUser.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const router = express.Router();

// Normalize Indian phone numbers (keep last 10 digits)
const normalizePhone = (phone) => {
  const digitsOnly = String(phone || '').replace(/\D/g, '');
  return digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
};

// POST /register
router.post('/register', async (req, res) => {
  try {
    if (MobileUser.db?.readyState !== 1) {
      console.error('DB not connected. readyState:', MobileUser.db?.readyState);
      return res.status(503).json({ success: false, error: 'Service unavailable. Try again shortly.' });
    }
    const { name, phone, password } = req.body || {};
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }

    const normalizedPhone = normalizePhone(phone);
    const exists = await MobileUser.findOne({ phone: normalizedPhone });
    if (exists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await MobileUser.create({ name, phone: normalizedPhone, password: hashed });
    return res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Mobile /register error:', err);
    const msg = err?.code === 11000 ? 'User already exists' : 'Registration failed. Please try again.';
    return res.status(500).json({ success: false, error: msg });
  }
});

// Select LLM provider (OpenAI primary as per spec, fallback Gemini)
const getChatReply = async (message) => {
  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7
      });
      const text = completion?.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch (e) {
      console.error('OpenAI error:', e?.message || e);
    }
  }

  // Fallback to Gemini if available
  if (process.env.GOOGLE_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-pro' });
      const result = await model.generateContent(message);
      const text = result?.response?.text()?.trim();
      if (text) return text;
    } catch (e) {
      console.error('Gemini error:', e?.message || e);
    }
  }

  return 'Unable to fetch response right now. Please try again later.';
};

// POST /chat
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) {
      return res.json({ reply: 'Please provide a message.' });
    }
    const reply = await getChatReply(message);
    return res.json({ reply });
  } catch (err) {
    console.error('Mobile /chat error:', err);
    return res.json({ reply: 'Unable to fetch response right now. Please try again later.' });
  }
});

export default router;


