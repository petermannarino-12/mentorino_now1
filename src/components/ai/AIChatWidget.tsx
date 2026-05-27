import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { AIChatMessage } from '../../types';
import { chatWithAssistant } from '../../services/geminiService';

type Props = {
  userContext?: string;
};

const AIChatWidget: React.FC<Props> = ({ userContext = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: 'model', content: "Hi! I'm your AI mentor assistant. Ask me anything about your career, sessions, or resources." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: AIChatMessage = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    const history = updated.map(m => ({ role: m.role, text: m.content }));
    const reply = await chatWithAssistant(history, trimmed);

    setMessages(prev => [...prev, { role: 'model', content: reply }]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100]">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-[32px] border border-black/[0.03] shadow-2xl overflow-hidden"
            >
              <div className="bg-black p-6 rounded-t-[32px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Sparkles size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-white">AI Mentor</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Online</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={16} className="text-white" />
                </button>
              </div>

              <div className="h-[360px] overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-[20px] text-xs font-medium leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-black text-white rounded-br-[4px]'
                        : 'bg-slate-50 text-slate-700 rounded-bl-[4px]'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 px-4 py-3 rounded-[20px] rounded-bl-[4px]">
                      <Loader2 size={16} className="animate-spin text-slate-400" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 rounded-full px-4 py-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your mentor..."
                    className="flex-1 bg-transparent text-xs font-medium text-slate-700 placeholder:text-slate-400 outline-none"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="p-2 bg-black text-white rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        </button>
      </div>
    </>
  );
};

export default AIChatWidget;
