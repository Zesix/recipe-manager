import { Injectable, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { Recipe } from './recipe.interface';
import { Ingredient } from '../shared/ingredient.interface';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

@Injectable()
export class RecipeService implements OnDestroy {
    // recipesChanged = new Subject<Recipe[]>();
    // recipeSelected = new EventEmitter();
    private sub: Subscription;
    public myRecipes$: Observable<any[]> ;
    public myRecipes: any[]  ;
    private currentRecipe: Subject<Recipe[]>;


    constructor(private shoppingListService: ShoppingListService, private fs: AngularFirestore) {
      this.myRecipes$ = this.fs.collection('recipes')
      .snapshotChanges()
      .map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      });

      this.sub = this.myRecipes$.subscribe( recipes =>
        this.myRecipes  = recipes
      );
    }

    ngOnDestroy() {
      this.sub.unsubscribe();
    }

    getRecipe(index: number) {
      if ( this.myRecipes ) {
        return this.myRecipes[index];
      } else {

      }
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]) {
       this.shoppingListService.addIngredients(ingredients);
    }

    addRecipe(recipe: Recipe) {
      this.fs.collection('recipes').add(recipe);
    }

    updateRecipe(newRecipe: Recipe) {
      this.fs.collection('recipes').doc(newRecipe.id).update(newRecipe);
    }

    deleteRecipe(newRecipe: Recipe) {
      this.fs.collection('recipes').doc(newRecipe.id).delete();
    }

}
