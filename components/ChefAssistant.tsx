
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { startChefChat } from '../services/geminiService';
import { ChatMessage } from '../types';

export const ChefAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '¡Hola! Soy tu Chef Personal con IA. ¿En qué puedo ayudarte hoy? ¿Buscas una receta o necesitas sustituir un ingrediente?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = startChefChat("Eres un chef experto, amable y creativo. Ayudas a los usuarios con recetas, técnicas culinarias y sugerencias de ingredientes de forma concisa y profesional.");
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text || "Lo siento, tuve un problema pensando en eso." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "¡Ups! Algo salió mal en mi cocina digital." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <GlassCard className="w-80 md:w-96 mb-4 h-[500px] flex flex-col p-4 shadow-2xl animate-in zoom-in-95 duration-200 origin-bottom-right border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700/50 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-500/30 rounded-full flex items-center justify-center text-xl shadow-sm">👨‍🍳</div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">Chef Culina</h4>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">En línea</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto custom-scrollbar space-y-4 mb-4 pr-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                  ? 'bg-orange-600 text-white rounded-tr-none' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700/50 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none flex gap-1 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregúntame algo..."
              className="flex-grow bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-orange-600 text-white p-2 rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-lg shadow-orange-950/20 dark:shadow-orange-950/40"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </GlassCard>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-3xl shadow-xl hover:scale-110 active:scale-95 transition-all text-white animate-float border border-orange-400 dark:border-orange-500/30"
      >
        {isOpen ? (
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        ) : "👨‍🍳"}
      </button>
    </div>
  );
};
