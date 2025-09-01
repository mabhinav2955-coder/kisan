import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Languages, X, Bot, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types/farmer';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'നമസ്കാരം! I am your Krishi Sakhi, your AI farming companion. How can I help you today with your farming needs? You can ask me in English or Malayalam! 🌾',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      language: 'english',
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'english' | 'malayalam'>('english');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
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
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        language === 'malayalam' 
          ? 'നിങ്ങളുടെ നെല്ല് വിളയ്ക്ക് ബ്രൗൺ പ്ലാന്റ് ഹോപ്പർ പരിശോധിക്കാൻ ഞാൻ ശുപാർശ ചെയ്യുന്നു. സമീപകാല മഴ കീടങ്ങൾക്ക് അനുകൂല സാഹചര്യങ്ങൾ സൃഷ്ടിക്കുന്നു.'
          : 'Based on your rice crop, I recommend checking for brown plant hopper. The recent rains create favorable conditions for pests.',
        language === 'malayalam'
          ? 'മികച്ച വിളവിനായി, കാലാവസ്ഥ മെച്ചപ്പെടുമ്പോൾ അടുത്ത ആഴ്ച ജൈവ വളം പ്രയോഗിക്കുന്നത് പരിഗണിക്കുക.'
          : 'For better yield, consider applying organic fertilizer next week when the weather clears up.',
        language === 'malayalam'
          ? 'വരാനിരിക്കുന്ന മഴ നിങ്ങളുടെ തെങ്ങുകൾക്ക് നല്ലതാണ്. അടിഭാഗത്തിന് ചുറ്റും ഡ്രെയിനേജ് വൃത്തിയാക്കുക.'
          : 'The upcoming rain is good for your coconut trees. Make sure drainage is clear around the base.',
        language === 'malayalam'
          ? 'നിങ്ങൾ അടുത്തിടെ പ്രവർത്തനങ്ങളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ലെന്ന് ഞാൻ ശ്രദ്ധിച്ചു. വരാനിരിക്കുന്ന കൃഷി ജോലികളെക്കുറിച്ച് ഞാൻ നിങ്ങളെ ഓർമ്മിപ്പിക്കട്ടെ?'
          : 'I notice you haven\'t logged any activities recently. Would you like me to remind you about upcoming farm tasks?'
      ];
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: responses[Math.floor(Math.random() * responses.length)],
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        language,
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop voice recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setNewMessage(language === 'malayalam' ? 'എന്റെ നെല്ലിന് എന്ത് വളം ഇടണം?' : 'What fertilizer should I use for my rice crop?');
      }, 2000);
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
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
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
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
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