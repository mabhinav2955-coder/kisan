import fetch from 'node-fetch';
import { fetchMarketPrices, fetchPestAlerts, fetchGovernmentAdvisories } from './data.js';

// Lazily import SDKs to avoid bundling unused providers in serverless
let openaiClient = null;
let groqClient = null;
let geminiClient = null;

const PROVIDERS = {
  OPENAI: 'openai',
  GROQ: 'groq',
  GEMINI: 'gemini'
};

const getProvider = () => {
  const value = (process.env.LLM_PROVIDER || '').toLowerCase();
  if (value === PROVIDERS.GROQ) return PROVIDERS.GROQ;
  if (value === PROVIDERS.GEMINI) return PROVIDERS.GEMINI;
  return PROVIDERS.OPENAI;
};

const initOpenAI = async () => {
  if (openaiClient) return openaiClient;
  const { default: OpenAI } = await import('openai');
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
};

const initGroq = async () => {
  if (groqClient) return groqClient;
  const { Groq } = await import('groq-sdk');
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

const initGemini = async () => {
  if (geminiClient) return geminiClient;
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  return geminiClient;
};

export const fetchRealtimeWeather = async (latitude, longitude) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
    const data = await res.json();
    return {
      temperature: data?.current?.temperature_2m,
      humidity: data?.current?.relative_humidity_2m,
      windSpeed: data?.current?.wind_speed_10m,
      precipitation: data?.current?.precipitation,
      weatherCode: data?.current?.weather_code
    };
  } catch (err) {
    return null;
  }
};

const buildSystemPrompt = (language, context) => {
  const lang = language === 'malayalam' ? 'Malayalam' : 'English';
  const weather = context?.weather ? `Weather: ${JSON.stringify(context.weather)}` : 'Weather: unavailable';
  const market = Array.isArray(context?.market) && context.market.length
    ? `Market: ${context.market.slice(0, 3).map(m => `${m.crop} ₹${m.currentPrice}/${m.unit} (${m.trend})`).join('; ')}`
    : 'Market: unavailable';
  const pest = Array.isArray(context?.pestAlerts) && context.pestAlerts.length
    ? `Pest Alerts: ${context.pestAlerts.slice(0, 2).map(a => `${a.crop}: ${a.pest} (${a.severity})`).join('; ')}`
    : 'Pest Alerts: none';
  const schemes = Array.isArray(context?.advisories) && context.advisories.length
    ? `Schemes: ${context.advisories.slice(0, 2).map(s => s.title).join('; ')}`
    : 'Schemes: none';
  const guidelines = [
    `You are Krishi Sakhi, a lively, warm, and proactive agricultural assistant. Reply in ${lang}.`,
    'Use an encouraging tone with short friendly emojis occasionally (🌾, ☀️, ✅). Keep answers concise, practical, and safe.',
    'If unsure, say what is known and suggest next steps or trusted sources.',
    'Prefer organic and locally appropriate recommendations where possible.',
    'If asked outside agriculture, still answer helpfully as a general assistant.'
  ].join('\n');
  return `${guidelines}\n\nContext\n${weather}\n${market}\n${pest}\n${schemes}`;
};

export const generateLLMResponse = async ({ message, language = 'english', location }) => {
  const provider = getProvider();
  const weather = location ? await fetchRealtimeWeather(location.lat, location.lon) : null;
  // Fetch additional context in parallel (Kerala-focused)
  const [market, pestAlerts, advisories] = await Promise.all([
    fetchMarketPrices(),
    fetchPestAlerts(),
    fetchGovernmentAdvisories()
  ]);
  const systemPrompt = buildSystemPrompt(language, { weather, market, pestAlerts, advisories });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ];

  if (provider === PROVIDERS.GROQ) {
    const groq = await initGroq();
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
      messages,
      temperature: 0.3
    });
    const content = completion?.choices?.[0]?.message?.content?.trim() || '';
    return { content, metadata: { provider, weatherData: weather, marketData: market, pestAlerts, governmentAdvisories: advisories } };
  }

  if (provider === PROVIDERS.GEMINI) {
    const genAI = await initGemini();
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
    const prompt = `${systemPrompt}\n\nUser: ${message}`;
    const result = await model.generateContent(prompt);
    const content = result?.response?.text()?.trim() || '';
    return { content, metadata: { provider, weatherData: weather, marketData: market, pestAlerts, governmentAdvisories: advisories } };
  }

  // Default: OpenAI
  const openai = await initOpenAI();
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    temperature: 0.3
  });
  const content = completion?.choices?.[0]?.message?.content?.trim() || '';
  return { content, metadata: { provider, weatherData: weather, marketData: market, pestAlerts, governmentAdvisories: advisories } };
};

export default {
  generateLLMResponse,
  fetchRealtimeWeather
};


