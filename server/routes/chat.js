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

// Send message and get response
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { sessionId, message, language = 'english', type = 'text', location } = req.body;

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

    // Generate AI response using provider-agnostic LLM utility
    const aiResponse = await generateLLMResponse({
      message,
      language,
      location: location && typeof location === 'object' ? location : null
    });
    
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
    const detail = error?.message || 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: detail
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
