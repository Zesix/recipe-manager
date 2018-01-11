import { Subscription } from 'rxjs/Subscription';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Injectable, EventEmitter, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Recipe } from './recipe.interface';
import { Ingredient } from '../shared/ingredient.interface';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

@Injectable()
export class RecipeService implements OnDestroy {
    private sub: Subscription;
    public myRecipes$: Observable<any[]> ;
    public myRecipes: any[]  ;
    private currentRecipe: Subject<Recipe[]>;

    constructor(
      private shoppingListService: ShoppingListService, 
      private angularFirestore: AngularFirestore) {

        this.myRecipes$ = this.angularFirestore.collection('recipes')
        .snapshotChanges()
        .map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        });
    }

    ngOnDestroy() {
      this.sub.unsubscribe();
    }

    getRecipe(index: number) {
      if ( this.myRecipes ) {
        return this.myRecipes[index];
      }
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]) {
       this.shoppingListService.addIngredients(ingredients);
    }

    addRecipe(recipe: Recipe) {
      this.angularFirestore.collection('recipes').add(recipe);
    }

    updateRecipe(newRecipe: Recipe) {
      this.angularFirestore.collection('recipes').doc(newRecipe.id).update(newRecipe);
    }

    deleteRecipe(newRecipe: Recipe) {
      this.angularFirestore.collection('recipes').doc(newRecipe.id).delete();
    }

}
