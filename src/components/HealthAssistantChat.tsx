import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "I've had a sore throat for two days with a mild dry cough.",
  "How can I tell the difference between cold and flu?",
  "What is the best way to recover from food poisoning at home?",
  "What are some common triggers and remedies for acid reflux?"
];

export function HealthAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I am your AI Virtual Health Assistant. You can describe your symptoms, ask questions about common conditions, or request general wellness tips. \n\n*Please remember: I am an AI, not a doctor. In case of a medical emergency, please contact local emergency services immediately.*",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // Build context from previous conversation messages
      // Standard structure for `@google/genai` multi-turn is to pass contents as an array of Content objects
      // mapping role: 'user' and role: 'model' (or 'assistant', but gemini uses 'user' / 'model').
      const conversationHistory = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const systemInstruction = `
        You are a knowledgeable, empathetic, and professional Virtual Health Assistant. 
        Your primary goal is to help users understand their health concerns, suggest potential common causes for their symptoms, and recommend self-care steps or professional consultation where appropriate.
        
        Rules:
        1. Always maintain an empathetic, caring, and professional tone.
        2. Never declare a definitive diagnosis. Use phrases like "This could potentially be associated with..." or "Common possibilities include..."
        3. Do not prescribe specific pharmaceutical drugs or medication. Suggest general over-the-counter options or home remedies only when appropriate and safe.
        4. If the user presents symptoms indicating a potential emergency (e.g., chest pain, severe shortness of breath, sudden numbness, high fever in infants, severe bleeding), immediately advise them to seek emergency medical attention.
        5. Keep responses structured, readable, and concise. Use bullet points or lists where helpful.
        6. Always include a brief disclaimer at the end reinforcing that you are an AI assistant and they should consult a healthcare professional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: conversationHistory as any,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'model',
        text: response.text || "I apologize, but I'm unable to process that request right now.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'model',
        text: "I apologize, but I encountered an error while communicating with the medical database. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: "Hello! I am your AI Virtual Health Assistant. You can describe your symptoms, ask questions about common conditions, or request general wellness tips. \n\n*Please remember: I am an AI, not a doctor. In case of a medical emergency, please contact local emergency services immediately.*",
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-[600px] bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100/50">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm sm:text-base">
              Virtual Health Assistant
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Interactive symptom guidance</p>
          </div>
        </div>
        <button
          onClick={handleResetChat}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3 max-w-[85%] ${
                message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                message.role === 'user' 
                  ? 'bg-slate-100 border-slate-200 text-slate-600' 
                  : 'bg-indigo-50 border-indigo-100 text-indigo-600'
              }`}>
                {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`rounded-2xl p-4 shadow-sm border text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none'
                  : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
              }`}>
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                ) : (
                  <div className="prose prose-slate prose-indigo max-w-none prose-sm">
                    <Markdown>{message.text}</Markdown>
                  </div>
                )}
                <span className={`block text-[9px] mt-2 text-right ${
                  message.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-[85%]"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-indigo-50 border-indigo-100 text-indigo-600">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl p-4 bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-xs text-slate-500">Assistant is thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Area */}
      {messages.length === 1 && (
        <div className="px-6 py-3 border-t border-slate-100 bg-white/40">
          <p className="text-[11px] font-medium text-slate-500 mb-2 flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-indigo-500" /> Try asking one of these:
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion)}
                className="text-left text-xs bg-indigo-50/60 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 hover:border-indigo-200 px-3 py-1.5 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 border-t border-slate-100 bg-white/80"
      >
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your health concern here..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
