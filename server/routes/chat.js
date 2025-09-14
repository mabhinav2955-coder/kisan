import express from 'express';
import ChatHistory from '../models/ChatHistory.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateSessionId } from '../utils/chat.js';

const router = express.Router();

// Generate a new chat session
router.post('/session', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const sessionId = generateSessionId();

    // Create new chat session
    const chatSession = new ChatHistory({
      farmerId,
      sessionId,
      messages: [],
      isArchived: false
    });

    await chatSession.save();

    res.json({
      success: true,
      message: 'New chat session created',
      sessionId,
      chatSession
    });

  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat session'
    });
  }
});

// Send message and get response
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { sessionId, message, language = 'english', type = 'text' } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }

    // Find or create chat session
    let chatSession = await ChatHistory.findOne({ 
      farmerId, 
      sessionId, 
      isArchived: false 
    });

    if (!chatSession) {
      chatSession = new ChatHistory({
        farmerId,
        sessionId,
        messages: [],
        isArchived: false
      });
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: message,
      language,
      type
    });

    // Generate AI response (mock implementation)
    const aiResponse = await generateAIResponse(message, language, farmerId);
    
    // Add AI response
    chatSession.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      language,
      type: 'text',
      metadata: aiResponse.metadata
    });

    chatSession.lastAccessed = new Date();
    await chatSession.save();

    res.json({
      success: true,
      message: 'Message processed successfully',
      response: {
        content: aiResponse.content,
        metadata: aiResponse.metadata
      },
      sessionId
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// Get chat history for a session
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { sessionId } = req.params;

    const chatSession = await ChatHistory.findOne({ 
      farmerId, 
      sessionId, 
      isArchived: false 
    });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    chatSession.lastAccessed = new Date();
    await chatSession.save();

    res.json({
      success: true,
      chatSession
    });

  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat session'
    });
  }
});

// Get all chat sessions for a farmer
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const sessions = await ChatHistory.find({ 
      farmerId, 
      isArchived: false 
    })
    .sort({ lastAccessed: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('sessionId createdAt lastAccessed messages');

    const total = await ChatHistory.countDocuments({ 
      farmerId, 
      isArchived: false 
    });

    res.json({
      success: true,
      sessions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat sessions'
    });
  }
});

// Archive a chat session
router.patch('/session/:sessionId/archive', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { sessionId } = req.params;

    const chatSession = await ChatHistory.findOne({ 
      farmerId, 
      sessionId 
    });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    chatSession.isArchived = true;
    await chatSession.save();

    res.json({
      success: true,
      message: 'Chat session archived successfully'
    });

  } catch (error) {
    console.error('Archive chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive chat session'
    });
  }
});

// Delete a chat session
router.delete('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { sessionId } = req.params;

    const result = await ChatHistory.deleteOne({ 
      farmerId, 
      sessionId 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session'
    });
  }
});

// Mock AI Response Generator
const generateAIResponse = async (message, language, farmerId) => {
  try {
    // In production, this would integrate with OpenAI, Claude, or custom AI model
    const responses = {
      english: {
        greeting: "Hello! I'm your farming assistant. How can I help you today?",
        weather: "The current weather conditions are favorable for farming activities. Temperature is around 28°C with moderate humidity.",
        pest: "Based on current conditions, watch out for common pests like aphids and whiteflies. Consider organic treatments first.",
        crop: "For better crop yield, ensure proper spacing, adequate watering, and timely fertilization.",
        default: "I understand your question about farming. Let me provide you with relevant information and recommendations."
      },
      malayalam: {
        greeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ കാർഷിക സഹായിയാണ്. ഇന്ന് എങ്ങനെ സഹായിക്കാം?",
        weather: "നിലവിലെ കാലാവസ്ഥ കാർഷിക പ്രവർത്തനങ്ങൾക്ക് അനുകൂലമാണ്. താപനില 28°C ആണ്.",
        pest: "നിലവിലെ അവസ്ഥകൾ അനുസരിച്ച്, ആഫിഡുകളും വൈറ്റ്ഫ്ലൈകളും പോലുള്ള പൊതുവായ കീടങ്ങളിൽ നിന്ന് സൂക്ഷിക്കുക.",
        crop: "മികച്ച വിളവിനായി, ശരിയായ ഇടവിട്ട്, മതിയായ നനയൽ, സമയത്ത് വളപ്രയോഗം ഉറപ്പാക്കുക.",
        default: "കാർഷികവിഷയത്തെക്കുറിച്ചുള്ള നിങ്ങളുടെ ചോദ്യം ഞാൻ മനസ്സിലാക്കുന്നു."
      }
    };

    const langResponses = responses[language] || responses.english;
    
    // Simple keyword matching for demo
    let response = langResponses.default;
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('നമസ്കാരം')) {
      response = langResponses.greeting;
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('കാലാവസ്ഥ')) {
      response = langResponses.weather;
    } else if (lowerMessage.includes('pest') || lowerMessage.includes('കീടം')) {
      response = langResponses.pest;
    } else if (lowerMessage.includes('crop') || lowerMessage.includes('വിള')) {
      response = langResponses.crop;
    }

    // Mock metadata for real-time data
    const metadata = {
      weatherData: {
        temperature: 28,
        humidity: 65,
        condition: 'sunny'
      },
      marketData: {
        rice: { price: 45, trend: 'up' },
        coconut: { price: 12, trend: 'stable' }
      },
      pestAlerts: [],
      governmentAdvisories: []
    };

    return {
      content: response,
      metadata
    };

  } catch (error) {
    console.error('AI Response generation error:', error);
    return {
      content: language === 'malayalam' 
        ? 'ക്ഷമിക്കണം, ഞാൻ നിങ്ങളുടെ ചോദ്യം മനസ്സിലാക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.'
        : 'Sorry, I couldn\'t understand your question. Please try again.',
      metadata: {}
    };
  }
};

export default router;
