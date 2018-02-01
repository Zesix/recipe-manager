import { Subscription } from 'rxjs/Subscription';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import { Injectable, EventEmitter, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Recipe } from './recipe.interface';
import { Ingredient } from '../shared/ingredient.interface';
import { ShoppingListService } from '../shopping-list/shopping-list.service';

@Injectable()
export class RecipeService implements OnDestroy {
  myRecipes$: Observable<any>;
  myRecipes: any[];
  private sub: Subscription;
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
      }).do(result => this.myRecipes = result);
    }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getRecipe(id: string) {
    return this.angularFirestore.collection('recipes').doc<Recipe>(id).valueChanges();
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
