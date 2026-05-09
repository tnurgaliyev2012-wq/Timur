/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, Trash2, Settings2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { solveMathProblem, type ExplanationMode } from './services/geminiService';
import { cn } from './lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: ExplanationMode;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ExplanationMode>('normal');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await solveMathProblem(userMessage.content, mode);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result,
        mode,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#FDFCFB] text-[#1D1D1F] font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#F2F2F7] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Sparkles size={18} />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">MathSolve MVP</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 bg-[#F2F2F7] p-1 rounded-full text-xs font-medium">
            {(['very simple', 'normal', 'detailed'] as ExplanationMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-3 py-1 rounded-full transition-all capitalize",
                  mode === m ? "bg-white text-orange-600 shadow-sm" : "text-[#8E8E93] hover:text-[#1D1D1F]"
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <button 
            onClick={clearChat}
            className="p-2 text-[#8E8E93] hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
            title="Clear Chat"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-2xl mx-auto w-full space-y-8">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center pt-20 text-center"
              >
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-6">
                  <Bot size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">How can I help?</h2>
                <p className="text-[#8E8E93] max-w-sm">
                  Send me a math problem like <code className="bg-orange-50 text-orange-600 px-1 rounded">2x + 5 = 15</code> and I'll explain it to you.
                </p>
                
                {/* Mobile Mode Selector */}
                <div className="sm:hidden mt-8 w-full max-w-xs space-y-2 text-left">
                  <p className="text-xs font-semibold text-[#8E8E93] px-1 flex items-center gap-1 uppercase tracking-wider">
                    <Settings2 size={12} /> Explanation Mode
                  </p>
                  <div className="grid grid-cols-3 gap-2 bg-[#F2F2F7] p-1 rounded-xl">
                    {(['very simple', 'normal', 'detailed'] as ExplanationMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={cn(
                          "px-1 py-2 rounded-lg text-xs font-medium transition-all capitalize",
                          mode === m ? "bg-white text-orange-600 shadow-sm" : "text-[#8E8E93]"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 group",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    message.role === 'user' ? "bg-orange-100 text-orange-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div className={cn(
                    "flex flex-col max-w-[85%]",
                    message.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm border",
                      message.role === 'user' 
                        ? "bg-orange-500 text-white border-orange-400" 
                        : "bg-white text-[#1D1D1F] border-[#F2F2F7]"
                    )}>
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none prose-slate">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                    {message.role === 'assistant' && message.mode && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#C7C7CC] mt-2 px-1">
                        Mode: {message.mode}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-[#F2F2F7] px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-[#F2F2F7]">
        <div className="max-w-2xl mx-auto relative">
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a math problem..."
            className="w-full bg-[#F2F2F7] border-none rounded-2xl pl-5 pr-12 py-4 focus:ring-2 focus:ring-orange-500/20 text-[16px] transition-all placeholder:text-[#8E8E93]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-2 top-2 bottom-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              input.trim() && !isLoading
                ? "bg-orange-500 text-white shadow-md hover:scale-105 active:scale-95"
                : "bg-transparent text-[#C7C7CC]"
            )}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-[#C7C7CC] mt-3 uppercase tracking-tighter">
          MVP Prototype • Powered by Gemini AI
        </p>
      </footer>
    </div>
  );
}

