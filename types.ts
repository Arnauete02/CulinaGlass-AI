
export interface Ingredient {
  item: string;
  amount: string;
}

export interface Step {
  order: number;
  instruction: string;
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Fácil' | 'Media' | 'Avanzada';
  calories: number;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  imageUrl: string;
}

export interface Lesson {
  title: string;
  objective: string;
  estimatedTime: string;
  difficulty: string;
  theory: string;
  practicalSteps: Step[];
  proTips: string[];
}

export type View = 'home' | 'details' | 'search' | 'chef' | 'academy';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
