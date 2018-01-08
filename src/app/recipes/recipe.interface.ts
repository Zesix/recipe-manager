import { Ingredient } from '../shared/ingredient.interface';

export interface Recipe {
    name: string;
    description: string;
    imagePath: string;
    ingredients: Ingredient[];
}
