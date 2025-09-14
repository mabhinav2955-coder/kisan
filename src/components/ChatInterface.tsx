import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Languages, X, Bot, Sparkles, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types/farmer';
import { voiceService } from '../services/voiceService';
import { apiService } from '../services/apiService';

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
      // Get real-time data for context
      const [weatherData, marketData, pestAlerts, governmentAdvisories] = await Promise.all([
        apiService.getWeatherData(),
        apiService.getMarketPrices(),
        apiService.getPestAlerts(),
        apiService.getGovernmentAdvisories()
      ]);

      // Generate enhanced AI response with real-time data
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: generateEnhancedAIResponse(currentMessage, language, {
          weatherData,
          marketData,
          pestAlerts,
          governmentAdvisories
        }),
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        language,
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiResponse]);

      // Auto-speak response if voice is enabled
      if (isSpeaking && voiceService.isSpeechSynthesisSupported()) {
        voiceService.speak(aiResponse.message, language === 'malayalam' ? 'ml-IN' : 'en-US');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: language === 'malayalam' 
          ? 'ക്ഷമിക്കണം, ഞാൻ നിങ്ങളുടെ ചോദ്യം മനസ്സിലാക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.'
          : 'Sorry, I couldn\'t process your question. Please try again.',
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

// Enhanced AI Response Generator with Real-time Data
const generateEnhancedAIResponse = (message: string, language: 'english' | 'malayalam', context: any) => {
  const lowerMessage = message.toLowerCase();
  const { weatherData, marketData, pestAlerts, governmentAdvisories } = context;

  // Weather-related queries
  if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('കാലാവസ്ഥ') || lowerMessage.includes('മഴ')) {
    const currentTemp = weatherData?.current?.temperature || 28;
    const humidity = weatherData?.current?.humidity || 65;
    const description = weatherData?.current?.description || 'sunny';
    
    if (language === 'malayalam') {
      return `നിലവിലെ കാലാവസ്ഥ: താപനില ${currentTemp}°C, ആർദ്രത ${humidity}%, ${description}. വരാനിരിക്കുന്ന മഴ കൃഷിക്ക് അനുകൂലമാണ്. ജലനിർമ്മാണം ശരിയായി നടത്തുക.`;
    } else {
      return `Current weather: Temperature ${currentTemp}°C, Humidity ${humidity}%, ${description}. The upcoming rain is favorable for farming. Ensure proper water management.`;
    }
  }

  // Market price queries
  if (lowerMessage.includes('price') || lowerMessage.includes('market') || lowerMessage.includes('വില') || lowerMessage.includes('വിപണി')) {
    const ricePrice = marketData?.find((p: any) => p.crop.toLowerCase().includes('rice'))?.currentPrice || 45;
    const coconutPrice = marketData?.find((p: any) => p.crop.toLowerCase().includes('coconut'))?.currentPrice || 12;
    
    if (language === 'malayalam') {
      return `നിലവിലെ വിപണി വിലകൾ: നെല്ല് ₹${ricePrice}/kg, തെങ്ങ് ₹${coconutPrice}/piece. വിലകൾ സ്ഥിരമാണ്. നിങ്ങളുടെ വിളവ് വിപണിയിൽ വിൽക്കാൻ ശുപാർശ ചെയ്യുന്നു.`;
    } else {
      return `Current market prices: Rice ₹${ricePrice}/kg, Coconut ₹${coconutPrice}/piece. Prices are stable. I recommend selling your harvest in the market.`;
    }
  }

  // Pest and disease queries
  if (lowerMessage.includes('pest') || lowerMessage.includes('disease') || lowerMessage.includes('കീടം') || lowerMessage.includes('രോഗം')) {
    const activeAlerts = pestAlerts?.filter((alert: any) => alert.severity === 'high' || alert.severity === 'urgent') || [];
    
    if (language === 'malayalam') {
      if (activeAlerts.length > 0) {
        return `ഉയർന്ന അലേർട്ട്: ${activeAlerts[0].pest} കീടം നിങ്ങളുടെ പ്രദേശത്ത് സജീവമാണ്. ജൈവ കീടനാശിനി ഉപയോഗിക്കുക. നിയമിതമായി പരിശോധിക്കുക.`;
      } else {
        return `നിലവിൽ ഉയർന്ന അലേർട്ടുകളൊന്നുമില്ല. എന്നാൽ നിയമിതമായി നിങ്ങളുടെ വിളകൾ പരിശോധിക്കുക. ആദ്യ ലക്ഷണങ്ങൾ കാണുമ്പോൾ ഉടൻ നടപടി എടുക്കുക.`;
      }
    } else {
      if (activeAlerts.length > 0) {
        return `High Alert: ${activeAlerts[0].pest} pest is active in your area. Use organic pesticides. Check regularly.`;
      } else {
        return `No high alerts currently. However, regularly check your crops. Take immediate action when you see first symptoms.`;
      }
    }
  }

  // Government scheme queries
  if (lowerMessage.includes('scheme') || lowerMessage.includes('subsidy') || lowerMessage.includes('സ്കീം') || lowerMessage.includes('സബ്സിഡി')) {
    const activeSchemes = governmentAdvisories?.filter((scheme: any) => scheme.status === 'active') || [];
    
    if (language === 'malayalam') {
      if (activeSchemes.length > 0) {
        return `സജീവ സർക്കാർ സ്കീമുകൾ: ${activeSchemes[0].title}. ${activeSchemes[0].description}. അപേക്ഷിക്കാൻ ആവശ്യമായ രേഖകൾ തയ്യാറാക്കുക.`;
      } else {
        return `നിലവിൽ സജീവമായ പ്രധാന സ്കീമുകൾ ഇല്ല. എന്നാൽ PM-KISAN സ്കീം എല്ലായ്പ്പോഴും ലഭ്യമാണ്. നിങ്ങളുടെ ബാങ്ക് അക്കൗണ്ട് വിശദാംശങ്ങൾ അപ്ഡേറ്റ് ചെയ്യുക.`;
      }
    } else {
      if (activeSchemes.length > 0) {
        return `Active Government Schemes: ${activeSchemes[0].title}. ${activeSchemes[0].description}. Prepare required documents for application.`;
      } else {
        return `No major active schemes currently. However, PM-KISAN scheme is always available. Update your bank account details.`;
      }
    }
  }

  // Crop-specific advice
  if (lowerMessage.includes('rice') || lowerMessage.includes('നെല്ല്')) {
    if (language === 'malayalam') {
      return `നെല്ല് കൃഷിക്ക്: ശരിയായ ജലനിർമ്മാണം, സമയത്ത് വളപ്രയോഗം, കീടനിയന്ത്രണം എന്നിവ ഉറപ്പാക്കുക. ബ്രൗൺ പ്ലാന്റ് ഹോപ്പർ, ബ്ലാസ്റ്റ് രോഗം എന്നിവയിൽ നിന്ന് സൂക്ഷിക്കുക.`;
    } else {
      return `For rice cultivation: Ensure proper water management, timely fertilization, and pest control. Watch out for brown plant hopper and blast disease.`;
    }
  }

  if (lowerMessage.includes('coconut') || lowerMessage.includes('തെങ്ങ്')) {
    if (language === 'malayalam') {
      return `തെങ്ങ് കൃഷിക്ക്: നിയമിതമായ വളപ്രയോഗം, ഡ്രെയിനേജ് വൃത്തിയാക്കൽ, റിംഗ് ബാക്റ്റീരിയ രോഗത്തിൽ നിന്ന് സൂക്ഷിക്കൽ എന്നിവ ആവശ്യമാണ്.`;
    } else {
      return `For coconut cultivation: Regular fertilization, drainage cleaning, and protection from ring bacteria disease are essential.`;
    }
  }

  // General farming advice
  if (language === 'malayalam') {
    return `നിങ്ങളുടെ കൃഷി പ്രവർത്തനങ്ങൾക്ക് ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്. കാലാവസ്ഥ, വിപണി വിലകൾ, കീടങ്ങൾ, സർക്കാർ സ്കീമുകൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കാം. നിങ്ങളുടെ വിളകളുടെ ആരോഗ്യം നിരീക്ഷിക്കുക.`;
  } else {
    return `I'm ready to help with your farming activities. You can ask about weather, market prices, pests, government schemes. Monitor your crop health regularly.`;
  }
};