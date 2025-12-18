
import React, { useState, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { analyzePantryImage } from '../services/geminiService';
import { Recipe } from '../types';

interface PantryScannerProps {
  onRecipesFound: (recipes: Recipe[]) => void;
  onLoading: (isLoading: boolean) => void;
}

export const PantryScanner: React.FC<PantryScannerProps> = ({ onRecipesFound, onLoading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setPreview(reader.result as string);
      
      onLoading(true);
      try {
        const recipes = await analyzePantryImage(base64);
        onRecipesFound(recipes);
      } catch (error) {
        console.error("Error analyzing pantry", error);
        alert("Hubo un error analizando la imagen. Intenta con una foto más clara.");
      } finally {
        onLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <GlassCard className="mb-12 border-2 border-dashed border-orange-500/30 bg-orange-100/20 dark:bg-orange-950/10">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <div 
            onClick={triggerUpload}
            className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] glass-dark border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all overflow-hidden group shadow-inner"
          >
            {preview ? (
              <img src={preview} alt="Vista previa" className="w-full h-full object-cover dark:brightness-75 group-hover:brightness-90 transition-all" />
            ) : (
              <>
                <svg className="w-10 h-10 text-slate-400 dark:text-slate-600 group-hover:text-orange-500 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center px-4 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">Subir foto de despensa</span>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        <div className="flex-grow space-y-4 text-center md:text-left">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-50">¿Qué tienes a mano? 🍎🥦</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
            Sube una foto de tu nevera o despensa. Nuestra IA analizará los ingredientes y te propondrá recetas desde nivel principiante hasta gourmet profesional.
          </p>
          <button 
            onClick={triggerUpload}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-orange-950/20 dark:shadow-orange-950/40 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Analizar mi Despensa
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
