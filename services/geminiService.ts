
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, Lesson } from "../types";

// Fix: Strictly following the guideline to use process.env.API_KEY directly in the constructor.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    prepTime: { type: Type.STRING },
    cookTime: { type: Type.STRING },
    servings: { type: Type.NUMBER },
    difficulty: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING },
          amount: { type: Type.STRING }
        },
        required: ["item", "amount"]
      }
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          order: { type: Type.NUMBER },
          instruction: { type: Type.STRING },
          tip: { type: Type.STRING }
        },
        required: ["order", "instruction"]
      }
    }
  },
  required: ["id", "title", "description", "prepTime", "cookTime", "ingredients", "steps"]
};

const LESSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    objective: { type: Type.STRING },
    estimatedTime: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    theory: { type: Type.STRING },
    practicalSteps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          order: { type: Type.NUMBER },
          instruction: { type: Type.STRING },
          tip: { type: Type.STRING }
        },
        required: ["order", "instruction"]
      }
    },
    proTips: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "objective", "theory", "practicalSteps"]
};

const NUTRITION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "Puntuación de salud del 1 al 10" },
    summary: { type: Type.STRING, description: "Resumen nutricional corto" },
    advice: { type: Type.STRING, description: "Consejo para hacerlo más saludable" },
    macros: {
      type: Type.OBJECT,
      properties: {
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fats: { type: Type.STRING }
      }
    }
  },
  required: ["score", "summary", "advice"]
};

// Optimizamos para Gemini 3 Flash para máxima velocidad
const FAST_MODEL = 'gemini-3-flash-preview';

// Función auxiliar para generar URLs de imágenes de comida realistas
const getFoodImageUrl = (query: string, seed: string) => {
  return `https://loremflickr.com/800/600/food,meal,cooked,dish/all?lock=${seed.length + Math.floor(Math.random() * 1000)}`;
};

export const fetchRecipesByQuery = async (query: string): Promise<Recipe[]> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Genera 3 recetas gourmet reales y deliciosas para: "${query}". Los títulos deben ser específicos. Responde estrictamente en JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: RECIPE_SCHEMA
      }
    }
  });

  const recipes: Recipe[] = JSON.parse(response.text || "[]");
  return recipes.map((r, idx) => ({
    ...r,
    imageUrl: getFoodImageUrl(r.title, r.id || idx.toString())
  }));
};

export const modifyRecipe = async (recipe: Recipe, request: string): Promise<Recipe> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Actúa como un chef Michelin. Modifica esta receta según la petición: "${request}". Receta original: ${JSON.stringify(recipe)}. Mantén la coherencia y el nivel gourmet. Responde solo el JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: RECIPE_SCHEMA
    }
  });

  const modified: Recipe = JSON.parse(response.text || "{}");
  return {
    ...modified,
    imageUrl: recipe.imageUrl // Mantenemos la imagen original para coherencia visual o podrías regenerarla si el cambio es drástico
  };
};

export const analyzeNutrition = async (recipe: Recipe): Promise<any> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Analiza nutricionalmente esta receta gourmet: "${recipe.title}". Ingredientes: ${JSON.stringify(recipe.ingredients)}. Proporciona una puntuación de salud y consejos macrobióticos. Responde en JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: NUTRITION_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}");
};

export const analyzePantryImage = async (base64Image: string): Promise<Recipe[]> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };
  
  const textPart = {
    text: "Identifica los ingredientes de la foto y sugiere 3 recetas creativas de alta cocina. Responde en JSON."
  };

  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: RECIPE_SCHEMA
      }
    }
  });

  const recipes: Recipe[] = JSON.parse(response.text || "[]");
  return recipes.map((r, idx) => ({
    ...r,
    imageUrl: getFoodImageUrl(r.title, r.id || idx.toString())
  }));
};

export const generateLesson = async (topic: string): Promise<Lesson> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Crea una lección culinaria profesional sobre: "${topic}". Incluye teoría fundamental y pasos. Responde en JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: LESSON_SCHEMA
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getChefRecommendation = async (preferences: string): Promise<Recipe> => {
  const response = await ai.models.generateContent({
    model: FAST_MODEL,
    contents: `Recomienda una receta gourmet basada en: "${preferences}". Responde en JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: RECIPE_SCHEMA
    }
  });

  const recipe: Recipe = JSON.parse(response.text || "{}");
  return {
    ...recipe,
    imageUrl: getFoodImageUrl(recipe.title, recipe.id || "chef-rec")
  };
};

export const startChefChat = (systemPrompt: string) => {
  return ai.chats.create({
    model: FAST_MODEL,
    config: {
      systemInstruction: systemPrompt,
    },
  });
};
