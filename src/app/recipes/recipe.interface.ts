import { Ingredient } from '../shared/ingredient.interface';

export interface Recipe {
    id?: string;
    name: string;
    description: string;
    imagePath: string;
    ingredients: Ingredient[];
}
