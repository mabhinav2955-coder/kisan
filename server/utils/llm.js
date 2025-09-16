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

// Determine configured providers and preferred order
const getProvidersToTry = () => {
  const forced = (process.env.LLM_PROVIDER || '').toLowerCase();
  const available = [];

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGemini = !!process.env.GOOGLE_API_KEY;
  const hasGroq = !!process.env.GROQ_API_KEY;

  if (forced === PROVIDERS.OPENAI && hasOpenAI) return [PROVIDERS.OPENAI];
  if (forced === PROVIDERS.GEMINI && hasGemini) return [PROVIDERS.GEMINI];
  if (forced === PROVIDERS.GROQ && hasGroq) return [PROVIDERS.GROQ];

  if (hasOpenAI) available.push(PROVIDERS.OPENAI);
  if (hasGemini) available.push(PROVIDERS.GEMINI);
  if (hasGroq) available.push(PROVIDERS.GROQ);

  return available;
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

// Response variation system to make conversations more dynamic
const getRandomGreeting = (language) => {
  const greetings = language === 'malayalam' 
    ? ['നമസ്കാരം!', 'ഹലോ!', 'എന്താണ് സ്ഥിതി?', 'എങ്ങനെയുണ്ട്?', 'ശുഭദിനം!']
    : ['Hello there!', 'Hey farmer!', 'Good to see you!', 'Howdy!', 'Greetings!'];
  return greetings[Math.floor(Math.random() * greetings.length)];
};

const getRandomEncouragement = (language) => {
  const encouragements = language === 'malayalam'
    ? ['നിങ്ങൾക്ക് ഇത് കഴിയും!', 'നിങ്ങളുടെ വിളകൾ നന്ദി പറയും!', 'സന്തോഷകരമായ കൃഷി!', 'അതിശയിക്കുന്ന ജോലി!', 'വിജയം നിങ്ങളുടെതാണ്!']
    : ['You\'ve got this!', 'Your crops will thank you!', 'Happy farming!', 'Keep up the great work!', 'Success is yours!'];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
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
  
  // Add random variation to make responses more dynamic
  const randomGreeting = getRandomGreeting(language);
  const randomEncouragement = getRandomEncouragement(language);
  
  const guidelines = [
    `You are Krishi Sakhi, Kerala's most enthusiastic and lively AI farming companion! Reply in ${lang}.`,
    '',
    'PERSONALITY TRAITS:',
    '- Be genuinely excited about farming and show authentic care for farmers',
    '- Use warm, friendly greetings and show interest in their farming journey',
    '- Be curious about their specific situation and ask thoughtful follow-up questions',
    '- Show empathy when they face challenges and celebrate their successes',
    '- Use farming metaphors and analogies that resonate with Kerala farmers',
    '- Be slightly informal and conversational, like talking to a knowledgeable friend',
    '',
    'CONVERSATION STYLE:',
    '- Vary your opening: Use greetings like "Namaskaram!", "Hello there!", "Hey farmer!", or "Good to see you!"',
    '- Ask engaging questions: "How\'s your farm doing?", "What\'s your main concern right now?", "Tell me about your crops!"',
    '- Use expressions of enthusiasm: "That\'s fantastic!", "Wonderful!", "Amazing work!", "I love that!"',
    '- Show genuine interest: "That sounds interesting!", "Tell me more about that!", "I\'d love to help!"',
    '- Use rhetorical questions: "Isn\'t that exciting?", "Can you believe it?", "How cool is that?"',
    '',
    'KERALA CULTURAL CONNECTIONS:',
    '- Reference local festivals: Onam, Vishu, Thrissur Pooram when relevant',
    '- Mention Kerala weather patterns: monsoon seasons, summer heat, coastal climate',
    '- Talk about local crops: rice, coconut, spices, rubber, cashew, banana',
    '- Use Malayalam farming terms occasionally: "vayal" (paddy field), "kalam" (season)',
    '- Reference local farming practices and traditions',
    '',
    'EMOJI USAGE:',
    '- Use 2-3 relevant emojis per response: 🌾🌱☀️💧🌿🍃🌾🌽🥬🥕🌶️🥥🍌',
    '- Match emojis to content: weather (☀️🌧️), crops (🌾🌱), success (✅🎉), encouragement (💪🌟)',
    '',
    'RESPONSE STRUCTURE:',
    '- Start with a warm greeting or acknowledgment',
    '- Provide helpful, practical advice',
    '- Ask a follow-up question to keep conversation flowing',
    '- End with encouragement or positive reinforcement',
    '',
    'QUICK RESPONSE TEMPLATES FOR COMMON QUESTIONS:',
    '- Weather questions: "Looking at today\'s conditions..." + practical advice + "How\'s your field handling this weather?"',
    '- Crop advice: "Great question about [crop]!" + specific tips + "What stage is your [crop] at right now?"',
    '- Market prices: "I see you\'re interested in [crop] prices..." + current data + "Are you planning to sell soon?"',
    '- Pest problems: "Oh no, dealing with [pest] can be tricky!" + solutions + "How long have you noticed this issue?"',
    '- General farming: "Farming is such a beautiful journey!" + advice + "What\'s your favorite part of farming?"',
    '',
    'ENCOURAGEMENT ENDINGS:',
    `- Use varied encouraging closings: "${randomEncouragement}"`,
    '- Other options: "You\'ve got this!", "Your crops will thank you!", "Happy farming!", "Keep up the amazing work!"',
    '- Malayalam: "നിങ്ങൾക്ക് ഇത് കഴിയും!", "സന്തോഷകരമായ കൃഷി!", "വിജയം നിങ്ങളുടെതാണ്!"',
    '',
    'IMPORTANT: Always be helpful, accurate, and encouraging. If unsure about something, say so and suggest consulting local agricultural officers or experts.'
  ].join('\n');
  return `${guidelines}\n\nContext\n${weather}\n${market}\n${pest}\n${schemes}`;
};

export const generateLLMResponse = async ({ message, language = 'english', location }) => {
  const providers = getProvidersToTry();
  const weather = location ? await fetchRealtimeWeather(location.lat, location.lon) : null;
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

  if (!providers.length) {
    const reason = 'No LLM provider configured. Set OPENAI_API_KEY, GOOGLE_API_KEY, or GROQ_API_KEY.';
    throw new Error(reason);
  }

  const errors = [];

  for (const provider of providers) {
    try {
      if (provider === PROVIDERS.OPENAI) {
        const openai = await initOpenAI();
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages,
          temperature: 0.7
        });
        const content = completion?.choices?.[0]?.message?.content?.trim() || '';
        if (content) return { content, metadata: { provider, weatherData: weather, marketData: market, pestAlerts, governmentAdvisories: advisories } };
        throw new Error('Empty response from OpenAI');
      }

      if (provider === PROVIDERS.GEMINI) {
        const genAI = await initGemini();
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
        const prompt = `${systemPrompt}\n\nUser: ${message}`;
        const result = await model.generateContent(prompt);
        const content = result?.response?.text()?.trim() || '';
        if (content) return { content, metadata: { provider, weatherData: weather, marketData: market, pestAlerts, governmentAdvisories: advisories } };
        throw new Error('Empty response from Gemini');
      }

      if (provider === PROVIDERS.GROQ) {
        const groq = await initGroq();
        const completion = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
          messages,
          temperature: 0.7
        });
        const content = completion?.choices?.[0]?.message?.content?.trim() || '';
        if (content) return { content, metadata: { provider, weatherData: weather, marketData: market, pestAlerts, governmentAdvisories: advisories } };
        throw new Error('Empty response from Groq');
      }
    } catch (err) {
      errors.push(`${provider}: ${err?.message || 'unknown error'}`);
      // Try next provider
    }
  }

  throw new Error(`All providers failed. ${errors.join(' | ')}`);
};

export default {
  generateLLMResponse,
  fetchRealtimeWeather
};


