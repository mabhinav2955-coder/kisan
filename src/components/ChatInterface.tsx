import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Languages, X, Bot, Sparkles, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types/farmer';
import { voiceService } from '../services/voiceService';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'നമസ്കാരം! 🌾 I\'m Krishi Sakhi, your enthusiastic AI farming companion! I\'m here to help you with everything farming - from crop advice to weather updates, market prices, and pest management! What\'s on your mind today? Tell me about your farm! 🌱',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      language: 'english',
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'english' | 'malayalam'>('english');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if voice features are supported
    setVoiceSupported(
      voiceService.isSpeechRecognitionSupported() && 
      voiceService.isSpeechSynthesisSupported()
    );
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      language,
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');

    try {
      // Get geolocation (optional)
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentMessage,
          language
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      const result = await response.json();

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: result.reply || 'Unable to fetch response right now. Please try again later.',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        language,
        type: 'text'
      };

      setMessages(prev => [...prev, aiResponse]);

      if (isSpeaking && voiceService.isSpeechSynthesisSupported()) {
        voiceService.speak(aiResponse.message, language === 'malayalam' ? 'ml-IN' : 'en-US');
      }
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      const backendMessage = (error?.message) || '';
      const errorText = language === 'malayalam'
        ? `ക്ഷമിക്കണം, സെർവർ ഒരു പിശക് തിരിച്ചു നൽകി. ${backendMessage ? `വിശദാംശം: ${backendMessage}` : ''} വീണ്ടും ശ്രമിക്കുക.`
        : `Sorry, the server returned an error. ${backendMessage ? `Details: ${backendMessage}` : ''} Please try again.`;
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: errorText.trim(),
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        language,
        type: 'text'
      };
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      voiceService.stopListening();
      setIsRecording(false);
    } else {
      try {
        await voiceService.startListening(
          (transcript, isFinal) => {
            if (isFinal) {
              setNewMessage(transcript);
              setIsRecording(false);
            }
          },
          (error) => {
            console.error('Speech recognition error:', error);
            setIsRecording(false);
            alert('Speech recognition failed. Please try again.');
          },
          language === 'malayalam' ? 'ml-IN' : 'en-US'
        );
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        alert('Speech recognition not available. Please type your message.');
      }
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      // Speak the last AI message
      const lastMessage = messages.filter(m => m.sender === 'assistant').pop();
      if (lastMessage) {
        voiceService.speak(
          lastMessage.message,
          language === 'malayalam' ? 'ml-IN' : 'en-US',
          () => setIsSpeaking(false)
        );
        setIsSpeaking(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:w-96 sm:max-w-md h-full sm:h-[600px] sm:rounded-t-xl sm:rounded-b-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center relative overflow-hidden">
              <Bot className="h-5 w-5 text-white" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">Krishi Sakhi</h3>
                <Sparkles className="h-3 w-3 text-yellow-500" />
              </div>
              <p className="text-xs text-green-600">AI Assistant • Ready to help</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {voiceSupported && (
              <button
                onClick={toggleSpeaking}
                className={`p-2 rounded-md transition-colors ${
                  isSpeaking 
                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                title={isSpeaking ? 'Stop Speaking' : 'Speak Response'}
              >
                {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={() => setLanguage(language === 'english' ? 'malayalam' : 'english')}
              className="p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
              title="Switch Language"
            >
              <Languages className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-sm'
                    : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={language === 'malayalam' ? 'നിങ്ങളുടെ ചോദ്യം ടൈപ്പ് ചെയ്യുക...' : 'Type your farming question...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={toggleRecording}
              disabled={!voiceSupported}
              className={`p-2 rounded-lg transition-colors ${
                !voiceSupported
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isRecording 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={voiceSupported ? (isRecording ? 'Stop Recording' : 'Start Recording') : 'Voice not supported'}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          {isRecording && (
            <div className="mt-2 flex items-center justify-center space-x-2 text-red-600">
              <div className="flex space-x-1">
                <div className="animate-pulse h-2 w-2 bg-red-600 rounded-full"></div>
                <div className="animate-pulse h-2 w-2 bg-red-600 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                <div className="animate-pulse h-2 w-2 bg-red-600 rounded-full" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-sm">Recording... Speak now</span>
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Language: {language === 'malayalam' ? '🇮🇳 മലയാളം' : '🇬🇧 English'}
          </div>
        </div>
      </div>
    </div>
  );
}

// Removed local rule-based responder; using backend LLM for real-time answers