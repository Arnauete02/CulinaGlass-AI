
import React from 'react';
import { Recipe } from '../types';
import { GlassCard } from './GlassCard';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  onShare?: (message: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, onShare }) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Validate current URL to avoid "Invalid URL" error in some environments
    const currentUrl = window.location.href;
    const isValidHttpUrl = currentUrl.startsWith('http://') || currentUrl.startsWith('https://');

    const shareData: ShareData = {
      title: `¡Mira esta receta: ${recipe.title}!`,
      text: `He encontrado esta increíble receta gourmet en CulinaGlass: ${recipe.title}. ${recipe.description}`,
      // Only include URL if it's a valid absolute web URL to prevent navigator.share from throwing
      ...(isValidHttpUrl ? { url: currentUrl } : {})
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        onShare?.("¡Receta compartida!");
      } else {
        // Fallback: Copy to clipboard
        const shareText = `${shareData.title}\n\n${shareData.text}${isValidHttpUrl ? '\n\n' + currentUrl : ''}`;
        await navigator.clipboard.writeText(shareText);
        onShare?.("Enlace copiado al portapapeles");
      }
    } catch (err) {
      console.error("Error al compartir:", err);
      // Solo notificamos si no fue una cancelación del usuario
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        // Last effort fallback
        try {
          await navigator.clipboard.writeText(`${recipe.title}: ${recipe.description}`);
          onShare?.("Detalles copiados al portapapeles");
        } catch {
          onShare?.("No se pudo compartir la receta");
        }
      }
    }
  };

  return (
    <GlassCard onClick={() => onClick(recipe)} className="overflow-hidden flex flex-col h-full group border-slate-200 dark:border-slate-700/50 relative">
      <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 dark:brightness-75 group-hover:brightness-90 transition-all"
        />
        <div className="absolute top-4 left-4 glass px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-500/30">
          {recipe.difficulty}
        </div>
        
        {/* Botón Compartir */}
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 w-10 h-10 glass flex items-center justify-center rounded-full text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-500/30 hover:scale-110 hover:bg-orange-500 hover:text-white transition-all share-btn active:scale-90"
          title="Compartir receta"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">{recipe.title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-grow italic">{recipe.description}</p>
      
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700/50 pt-4">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {recipe.prepTime} + {recipe.cookTime}
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          {recipe.servings} p.
        </div>
      </div>
    </GlassCard>
  );
};
