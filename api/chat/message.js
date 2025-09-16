import { generateLLMResponse } from '../../server/utils/llm.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  try {
    const { message, language = 'english', location } = req.body || {};
    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const aiResponse = await generateLLMResponse({
      message,
      language,
      location: location && typeof location === 'object' ? location : null
    });

    res.status(200).json({
      success: true,
      response: {
        content: aiResponse.content,
        metadata: aiResponse.metadata
      }
    });
  } catch (error) {
    console.error('Vercel function error:', error);
    res.status(500).json({ success: false, message: 'Failed to process message' });
  }
}


