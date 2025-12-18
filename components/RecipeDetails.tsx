
import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { GlassCard } from './GlassCard';
import { modifyRecipe, analyzeNutrition } from '../services/geminiService';

interface RecipeDetailsProps {
  recipe: Recipe;
  onBack: () => void;
}

export const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe: initialRecipe, onBack }) => {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [markedIngredients, setMarkedIngredients] = useState<string[]>([]);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformQuery, setTransformQuery] = useState('');
  const [showTransformInput, setShowTransformInput] = useState(false);
  const [nutrition, setNutrition] = useState<any>(null);
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false);

  // Cargar análisis nutricional al inicio
  useEffect(() => {
    const loadNutrition = async () => {
      setIsLoadingNutrition(true);
      try {
        const data = await analyzeNutrition(initialRecipe);
        setNutrition(data);
      } catch (e) {
        console.error("Error al analizar nutrición", e);
      } finally {
        setIsLoadingNutrition(false);
      }
    };
    loadNutrition();
  }, [initialRecipe]);

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleIngredient = (item: string) => {
    setMarkedIngredients(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleTransform = async () => {
    if (!transformQuery.trim()) return;
    setIsTransforming(true);
    try {
      const newRecipe = await modifyRecipe(recipe, transformQuery);
      setRecipe(newRecipe);
      setTransformQuery('');
      setShowTransformInput(false);
      // Resetear progreso al cambiar receta
      setCompletedSteps([]);
      setMarkedIngredients([]);
    } catch (e) {
      alert("No pude transformar la receta. Intenta con otra petición.");
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver a explorar
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTransformInput(!showTransformInput)}
            className={`glass px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 transition-all border-slate-200 dark:border-slate-600 ${showTransformInput ? 'bg-orange-500 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            ✨ Customizar con IA
          </button>
          <button 
            onClick={() => window.print()}
            className="glass hover:bg-black/5 dark:hover:bg-white/10 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 font-bold text-sm shadow-sm flex items-center gap-2 transition-all border-slate-200 dark:border-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Descargar
          </button>
        </div>
      </div>

      {showTransformInput && (
        <GlassCard className="mb-8 border-orange-500/30 bg-orange-50 dark:bg-orange-950/20 no-print animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
            ¿Cómo quieres cambiar esta receta?
          </h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Ej: 'Hazla vegana', 'Para 6 personas', 'Sin gluten', 'Añade picante'..."
              value={transformQuery}
              onChange={(e) => setTransformQuery(e.target.value)}
              className="flex-grow bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button 
              onClick={handleTransform}
              disabled={isTransforming || !transformQuery.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isTransforming ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Transformar'}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Vegana', 'Baja en carbos', 'Para niños', 'Sustituir ingredientes'].map(tag => (
              <button 
                key={tag} 
                onClick={() => setTransformQuery(tag)}
                className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800/50 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/5 group">
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover dark:brightness-75 transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {recipe.tags.map(tag => (
                    <span key={tag} className="glass border-white/20 text-slate-100 text-xs px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{recipe.title}</h1>
                <p className="text-white/70 text-lg italic max-w-2xl">{recipe.description}</p>
              </div>
            </div>
          </div>

          <GlassCard className="border-slate-200 dark:border-slate-700/30">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
              <span className="bg-orange-100 dark:bg-orange-600/30 p-2 rounded-xl text-orange-600 dark:text-orange-400">🍳</span>
              Pasos de Preparación
            </h2>
            <div className="space-y-6">
              {recipe.steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-4 p-4 rounded-2xl transition-all ${completedSteps.includes(idx) ? 'bg-green-500/10 opacity-60' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${completedSteps.includes(idx) ? 'bg-green-600 text-white scale-110' : 'bg-orange-600 text-white'}`}>
                    {completedSteps.includes(idx) ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (step.order || idx + 1)}
                  </div>
                  <div className="flex-grow">
                    <p className={`text-slate-800 dark:text-slate-200 text-lg ${completedSteps.includes(idx) ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>{step.instruction}</p>
                    {step.tip && <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 italic flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Tip: {step.tip}
                    </p>}
                    <button 
                      onClick={() => toggleStep(idx)}
                      className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 no-print"
                    >
                      {completedSteps.includes(idx) ? 'Desmarcar' : 'Completado'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="sticky top-8 border-slate-200 dark:border-slate-700/30">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-3">
              <span className="bg-green-100 dark:bg-green-600/30 p-2 rounded-xl text-green-600 dark:text-green-400">🥗</span>
              Ingredientes
            </h2>
            <p className="text-xs text-slate-500 mb-6 italic no-print">Toca un ingrediente para marcarlo</p>
            <ul className="space-y-4">
              {recipe.ingredients.map((ing, idx) => {
                const isMarked = markedIngredients.includes(ing.item);
                return (
                  <li 
                    key={idx} 
                    onClick={() => toggleIngredient(ing.item)}
                    className={`flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700/50 last:border-0 group cursor-pointer transition-all ${isMarked ? 'opacity-40 grayscale' : 'opacity-100'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center no-print ${isMarked ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {isMarked && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-slate-700 dark:text-slate-300 font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors ${isMarked ? 'line-through' : ''}`}>
                        {ing.item}
                      </span>
                    </div>
                    <span className="glass-dark px-3 py-1 rounded-lg text-sm font-bold text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700/50">
                      {ing.amount}
                    </span>
                  </li>
                );
              })}
            </ul>
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Calorías</div>
                  <div className="text-xl font-bold text-slate-700 dark:text-slate-200">{recipe.calories || 350}</div>
                </div>
                <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Porciones</div>
                  <div className="text-xl font-bold text-slate-700 dark:text-slate-200">{recipe.servings}</div>
                </div>
              </div>
            </div>

            {/* Sección de Nutrición Inteligente */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border border-green-100 dark:border-green-900/30">
              <h4 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Análisis Inteligente
              </h4>
              {isLoadingNutrition ? (
                <div className="flex gap-2 animate-pulse">
                  <div className="h-4 w-4 bg-green-200 dark:bg-green-800 rounded-full"></div>
                  <div className="h-4 w-full bg-green-100 dark:bg-green-900 rounded-lg"></div>
                </div>
              ) : nutrition ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{nutrition.score}/10</span>
                    <span className="text-[10px] leading-tight text-slate-600 dark:text-slate-400 italic">{nutrition.summary}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-white dark:border-white/5">
                    💡 <span className="font-semibold">Consejo:</span> {nutrition.advice}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No hay datos disponibles.</p>
              )}
            </div>
            
            <button className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-950/20 dark:shadow-orange-950/40 active:scale-95 no-print">
              Añadir ingredientes al carrito
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
