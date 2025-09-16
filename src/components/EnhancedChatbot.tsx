import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  History, 
  Trash2, 
  Plus,
  Calendar,
  Globe,
  AlertTriangle,
  TrendingUp,
  Leaf
} from 'lucide-react';
import BackButton from './BackButton';
import { ChatSession } from '../types/farmer';
import { voiceService } from '../services/voiceService';

interface EnhancedChatbotProps {
  onBack?: () => void;
}

export default function EnhancedChatbot({ onBack }: EnhancedChatbotProps) {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'english' | 'malayalam'>('english');
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    createNewSession();
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      const resp = await fetch('/api/chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!resp.ok) throw new Error('Failed to create session');
      const data = await resp.json();
      const chat = data.chatSession;
      const newSession: ChatSession = {
        id: chat._id || chat.sessionId,
        farmerId: chat.farmerId || 'current-user',
        sessionId: chat.sessionId,
        messages: chat.messages || [],
        isArchived: chat.isArchived || false,
        lastAccessed: chat.lastAccessed || new Date().toISOString(),
        createdAt: chat.createdAt || new Date().toISOString(),
        updatedAt: chat.updatedAt || new Date().toISOString()
      };
      setCurrentSession(newSession);
      setError(null);
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create new chat session');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      // Mock API call - in production, this would call the actual backend
      const mockSessions: ChatSession[] = [
        {
          id: '1',
          farmerId: 'current-user',
          sessionId: 'session_1',
          messages: [
            {
              role: 'user',
              content: 'What is the best time to plant rice?',
              language: 'english',
              type: 'text',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              role: 'assistant',
              content: 'The best time to plant rice is during the monsoon season, typically from June to August. This ensures adequate water supply for the crop.',
              language: 'english',
              type: 'text',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          isArchived: false,
          lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          farmerId: 'current-user',
          sessionId: 'session_2',
          messages: [
            {
              role: 'user',
              content: 'വിളവ് കൂടുതൽ ലഭിക്കാൻ എന്ത് ചെയ്യണം?',
              language: 'malayalam',
              type: 'text',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              role: 'assistant',
              content: 'വിളവ് കൂടുതൽ ലഭിക്കാൻ ശരിയായ വളപ്രയോഗം, സമയത്ത് നനയൽ, കീടനിയന്ത്രണം എന്നിവ ഉറപ്പാക്കുക. ജൈവവളങ്ങൾ ഉപയോഗിക്കുക.',
              language: 'malayalam',
              type: 'text',
              timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          isArchived: false,
          lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async (messageText: string, messageType: 'text' | 'voice' = 'text') => {
    if (!messageText.trim() || !currentSession) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message
      const userMessage = {
        role: 'user' as const,
        content: messageText,
        language,
        type: messageType,
        timestamp: new Date().toISOString()
      };

      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, userMessage]
      };
      setCurrentSession(updatedSession);

      // Call backend (server route or Vercel function) with optional geolocation for context
      // Try browser geolocation; ignore failures
      let location: { lat: number; lon: number } | null = null;
      try {
        location = await new Promise((resolve) => {
          if (!navigator.geolocation) return resolve(null);
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => resolve(null),
            { maximumAge: 600000, timeout: 3000 }
          );
        });
      } catch {}

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: currentSession.sessionId,
          message: messageText,
          language,
          type: messageType,
          location
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add AI response
        const aiMessage = {
          role: 'assistant' as const,
          content: result.response.content,
          language,
          type: 'text' as const,
          timestamp: new Date().toISOString(),
          metadata: result.response.metadata
        };

        const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, aiMessage],
          lastAccessed: new Date().toISOString()
        };
        setCurrentSession(finalSession);

        // Auto-speak response if voice is enabled
        if (isSpeaking && voiceService.isSpeechSynthesisSupported()) {
          voiceService.speak(result.response.content, language === 'malayalam' ? 'ml-IN' : 'en-US');
        }
      } else {
        const result = await response.json().catch(() => ({}));
        const detail = result?.error || 'Failed to get response';
        throw new Error(detail);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const startListening = async () => {
    if (!voiceService.isSpeechRecognitionSupported()) {
      setError('Voice input is not supported in this browser');
      return;
    }

    try {
      setIsListening(true);
      setError(null);

      await voiceService.startListening(
        (transcript, isFinal) => {
          if (isFinal) {
            setMessage(transcript);
            setIsListening(false);
            sendMessage(transcript, 'voice');
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setError('Speech recognition failed. Please try again.');
          setIsListening(false);
        },
        language === 'malayalam' ? 'ml-IN' : 'en-US'
      );
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start voice input');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    if (isSpeaking) {
      voiceService.stopSpeaking();
    }
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSession(session);
    setShowHistory(false);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      // Mock API call - in production, this would call the actual backend
      await fetch(`/api/chat/session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      
      if (currentSession?.sessionId === sessionId) {
        createNewSession();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete chat session');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getMetadataIcon = (metadata: any) => {
    if (metadata?.weatherData) return <Globe className="h-4 w-4 text-blue-500" />;
    if (metadata?.marketData) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (metadata?.pestAlerts) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {onBack && <BackButton onBack={onBack} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Krishi Sakhi 🌾</h2>
          <p className="text-gray-600">Your enthusiastic AI farming companion • Ready to help with everything farming! 🌱✨</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <History className="h-4 w-4" />
            <span>History</span>
          </button>
          <button
            onClick={createNewSession}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Language and Voice Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'english' | 'malayalam')}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="english">English</option>
                <option value="malayalam">മലയാളം</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSpeaking}
              className={`p-2 rounded-lg transition-colors ${
                isSpeaking 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isSpeaking ? 'Disable voice output' : 'Enable voice output'}
            >
              {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            
            {voiceService.isSpeechRecognitionSupported() && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 overflow-y-auto">
        {currentSession?.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Leaf className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome to Krishi Sakhi! 🌾
              </h3>
              <p className="text-gray-600">
                I'm your lively AI farming companion! Ask me anything about farming, crops, weather, or market prices! Let's make your farming journey amazing! 🌱☀️
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2">
              {['What\'s today\'s weather like? ☀️', 'How are rice prices? 📈', 'Any pest alerts? 🐛', 'Tell me about schemes! 💰', 'Crop advice needed! 🌱', 'Market trends? 📊'].map((q) => (
                <button
                  key={q}
                  onClick={() => setMessage(q)}
                  className="text-xs px-3 py-2 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
            {currentSession?.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex-1">
                      <p className="text-sm">{msg.content}</p>
                      {msg.metadata && (
                        <div className="flex items-center space-x-1 mt-2">
                          {getMetadataIcon(msg.metadata)}
                          <span className="text-xs opacity-75">Real-time data included</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {formatDate(msg.timestamp)}
                    {msg.type === 'voice' && <span className="ml-1">🎤</span>}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`What's on your mind today? Ask me anything about farming! 🌾 (${language === 'malayalam' ? 'മലയാളത്തിൽ' : 'in English'})`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Chat History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Chat History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatDate(session.lastAccessed)}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteSession(session.sessionId)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      {session.messages.slice(0, 2).map((msg, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          <span className="font-medium">
                            {msg.role === 'user' ? 'You' : 'Assistant'}:
                          </span>
                          <span className="ml-2">
                            {msg.content.length > 100 
                              ? `${msg.content.substring(0, 100)}...` 
                              : msg.content
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => loadSession(session)}
                      className="mt-3 w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      Continue this conversation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
