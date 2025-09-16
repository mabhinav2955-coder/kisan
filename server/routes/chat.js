import express from 'express';
import ChatHistory from '../models/ChatHistory.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateSessionId } from '../utils/chat.js';
import { generateLLMResponse } from '../utils/llm.js';

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

// Simple chat endpoint - no authentication required for demo
router.post('/message', async (req, res) => {
  try {
    const { message, language = 'english' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Generate AI response using LLM
    console.log('Generating LLM response for message:', message);
    
    try {
      const aiResponse = await generateLLMResponse({
        message,
        language,
        location: null
      });
      
      console.log('LLM response received:', aiResponse?.content?.substring(0, 100) + '...');
      
      res.json({
        success: true,
        reply: aiResponse.content || 'Unable to fetch response right now. Please try again later.'
      });
    } catch (llmError) {
      console.error('LLM Error:', llmError.message);
      console.error('LLM Stack:', llmError.stack);
      
      // Fallback response
      res.json({
        success: true,
        reply: 'Unable to fetch response right now. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Chat error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.json({
      success: true,
      reply: 'Unable to fetch response right now. Please try again later.'
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

// Mock generator removed; handled by utils/llm

export default router;
