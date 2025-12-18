
import React, { useState, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { generateLesson } from '../services/geminiService';
import { Lesson } from '../types';

export const ChefAcademy: React.FC = () => {
  const [query, setQuery] = useState('');
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  
  const lessonCache = useRef<Record<string, Lesson>>({});

  const handleStartLesson = async (e?: React.FormEvent, topicOverride?: string) => {
    e?.preventDefault();
    const activeQuery = topicOverride || query;
    if (!activeQuery.trim()) return;

    if (lessonCache.current[activeQuery]) {
      setLesson(lessonCache.current[activeQuery]);
      return;
    }

    setLoading(true);
    try {
      const data = await generateLesson(activeQuery);
      lessonCache.current[activeQuery] = data;
      setLesson(data);
    } catch (error) {
      console.error("Error generating lesson", error);
    } finally {
      setLoading(false);
    }
  };

  const commonTopics = [
    "Técnicas de corte de cuchillo",
    "Cómo hacer el risotto perfecto",
    "Secretos de la salsa Holandesa",
    "Masas fermentadas para pan",
    "Técnicas de salteado profesional"
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12 pb-10">
      <section className="text-center space-y-4 max-w-3xl mx-auto no-print">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-50">
          Academia de <span className="text-orange-500 italic font-serif">Chef Personal</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Domina cualquier técnica o plato con una masterclass personalizada generada al instante por IA.
        </p>
        
        <form onSubmit={handleStartLesson} className="flex flex-col md:flex-row gap-4 pt-6">
          <input 
            type="text" 
            placeholder="Ej: Enséñame a caramelizar cebollas perfectamente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow glass py-4 px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 border-slate-200 dark:border-slate-700"
          />
          <button 
            type="submit"
            disabled={loading}
            className="bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-orange-950/20 dark:shadow-orange-950/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Preparando lección...' : 'Comenzar Masterclass'}
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {commonTopics.map(topic => (
            <button 
              key={topic}
              onClick={() => { setQuery(topic); handleStartLesson(undefined, topic); }}
              className="text-xs font-bold text-slate-500 dark:text-slate-500 bg-white/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 px-3 py-1.5 rounded-full hover:bg-orange-600 hover:text-white transition-all shadow-sm"
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-800 border-t-orange-500 rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-bold text-slate-600 dark:text-slate-400 animate-pulse font-serif">Preparando tu material didáctico...</p>
        </div>
      )}

      {lesson && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <GlassCard className="border-l-4 border-l-orange-600 border-slate-200 dark:border-slate-700/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📖</span>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{lesson.title}</h3>
              </div>
              <p className="text-orange-600 dark:text-orange-400 font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 no-print" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Objetivo: {lesson.objective}
              </p>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed italic border-t border-slate-100 dark:border-slate-700/50 pt-6 whitespace-pre-wrap">
                {lesson.theory}
              </div>
            </GlassCard>

            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 px-2">Guía Práctica Paso a Paso</h4>
              {lesson.practicalSteps.map((step, idx) => (
                <GlassCard key={idx} className="group hover:bg-black/5 dark:hover:bg-white/5 border-slate-200 dark:border-slate-700/30">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-500 rounded-2xl flex items-center justify-center text-xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
                      {step.order || idx + 1}
                    </div>
                    <div className="flex-grow">
                      <p className="text-xl text-slate-800 dark:text-slate-100 mb-2 leading-snug">{step.instruction}</p>
                      {step.tip && (
                        <div className="bg-blue-100/30 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-500/20 mt-4">
                          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <span className="font-bold">CONSEJO PROFESIONAL:</span> {step.tip}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          <aside className="space-y-8">
            <GlassCard className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">⭐</span> Detalles de la Sesión
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500">Dificultad</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{lesson.difficulty || 'Personalizada'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500">Tiempo estimado</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{lesson.estimatedTime || '45 min'}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="bg-orange-100/20 dark:bg-orange-950/10 border-orange-200/50 dark:border-orange-500/20">
              <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <span className="text-2xl">💡</span> Secretos del Chef
              </h4>
              <ul className="space-y-4">
                {lesson.proTips?.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-600 dark:text-slate-400">
                    <span className="text-orange-600 font-bold">•</span>
                    <span className="text-sm italic">{tip}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <button 
              onClick={() => window.print()}
              className="w-full glass py-4 font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-500/40 transition-all flex items-center justify-center gap-2 no-print border-slate-200 dark:border-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Descargar Masterclass (PDF)
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};
