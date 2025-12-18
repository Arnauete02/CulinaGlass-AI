
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Recipe, View } from './types';
import { fetchRecipesByQuery } from './services/geminiService';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetails } from './components/RecipeDetails';
import { GlassCard } from './components/GlassCard';
import { ChefAssistant } from './components/ChefAssistant';
import { PantryScanner } from './components/PantryScanner';
import { ChefAcademy } from './components/ChefAcademy';

const initialQueries = [
  'Alta cocina mediterránea',
  'Postres de autor con chocolate',
  'Cenas saludables de vanguardia',
  'Técnicas de brunch gourmet'
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });
  
  const cache = useRef<Record<string, Recipe[]>>({});

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const loadRecipes = useCallback(async (query: string) => {
    const trimmedQuery = query.trim().toLowerCase();
    if (cache.current[trimmedQuery]) {
      setRecipes(cache.current[trimmedQuery]);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchRecipesByQuery(query);
      cache.current[trimmedQuery] = data;
      setRecipes(data);
    } catch (error) {
      console.error("Error loading recipes", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipes('Platos gourmet de temporada con presentación elegante');
  }, [loadRecipes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadRecipes(searchQuery);
      setView('search');
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePantryResults = (pantryRecipes: Recipe[]) => {
    setRecipes(pantryRecipes);
    setView('search');
    setSearchQuery('Basado en tu despensa 📸');
    showToast("¡Ingredientes analizados con éxito!", "success");
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-7xl mx-auto text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="glass px-6 py-3 rounded-2xl shadow-2xl border-orange-500/20 flex items-center gap-3 backdrop-blur-xl">
            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{toast.message}</p>
          </div>
        </div>
      )}

      <header className="py-8 flex flex-col md:flex-row items-center justify-between gap-6 no-print">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('home'); setSearchQuery(''); }}>
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-orange-900/20">
            C
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">
            Culina<span className="text-orange-500 italic">Glass</span>
          </h1>
        </div>

        <nav className="flex items-center gap-6">
          <button 
            onClick={() => setView('home')}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${view === 'home' ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'}`}
          >
            Inicio
          </button>
          <button 
            onClick={() => setView('academy')}
            className={`text-sm font-bold uppercase tracking-widest transition-colors ${view === 'academy' ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'}`}
          >
            Academia
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl glass hover:scale-110 transition-all text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            title="Cambiar tema"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </nav>

        <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
          <input 
            type="text" 
            placeholder="¿Qué te apetece cocinar hoy?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass py-4 pl-12 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </header>

      <main className="mt-8">
        {view === 'details' && selectedRecipe ? (
          <RecipeDetails recipe={selectedRecipe} onBack={() => setView('home')} />
        ) : view === 'academy' ? (
          <ChefAcademy />
        ) : (
          <div className="space-y-12">
            {view === 'home' && (
              <section className="relative overflow-hidden rounded-[2.5rem] glass p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 no-print border-slate-200 dark:border-white/5">
                <div className="flex-grow space-y-6">
                  <span className="inline-block glass bg-orange-600/10 dark:bg-orange-600/20 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-500/30">
                    Inspiración Diaria
                  </span>
                  <h2 className="text-4xl md:text-6xl font-bold text-slate-800 dark:text-slate-50 leading-[1.1]">
                    Tu próximo <br /> <span className="text-orange-500 font-serif italic">festín gourmet</span> <br /> empieza aquí.
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md leading-relaxed">
                    Descubre miles de recetas diseñadas por chefs y optimizadas por IA para que tu experiencia en la cocina sea pura magia.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    {initialQueries.map(q => (
                      <button 
                        key={q} 
                        onClick={() => { setSearchQuery(q); loadRecipes(q); setView('search'); }}
                        className="glass-dark hover:bg-orange-600 hover:text-white transition-all px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative w-full md:w-1/2 flex justify-center">
                  <div className="w-64 h-64 md:w-80 md:h-80 bg-orange-900/10 dark:bg-orange-900/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-3xl -z-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800" 
                    alt="Featured Dish" 
                    className="w-full max-w-sm h-auto rounded-[3rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 dark:brightness-90"
                  />
                </div>
              </section>
            )}

            {view === 'home' && (
              <div className="no-print">
                <PantryScanner onRecipesFound={handlePantryResults} onLoading={setLoading} />
              </div>
            )}

            <section>
              <div className="flex items-center justify-between mb-8 no-print">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  {view === 'search' ? searchQuery : 'Explora lo último'}
                  <span className="text-orange-500">✨</span>
                </h3>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-orange-500 rounded-full animate-spin mb-6"></div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Cocinando sugerencias increíbles para ti...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} onClick={handleRecipeClick} onShare={(msg) => showToast(msg, 'info')} />
                  ))}
                  {recipes.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-slate-400 dark:text-slate-500 text-lg italic">No hemos encontrado recetas... ¡Prueba a preguntar al Chef Culina!</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <div className="no-print">
        <ChefAssistant />
      </div>

      <footer className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 text-sm no-print">
        <p>&copy; 2024 CulinaGlass AI. Diseñado con ❤️ para amantes de la buena mesa.</p>
      </footer>
    </div>
  );
};

export default App;
