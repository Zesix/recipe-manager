import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { FirestoreService } from './firestore.service';
import { AngularFirestoreCollection, AngularFirestore } from 'angularfire2/firestore';

import { RecipeService } from '../recipes/recipe.service';
import { Recipe } from '../recipes/recipe.interface';

@Injectable()
export class RecipeStorageService {

    collection: AngularFirestoreCollection<Recipe>;
    recipes: Observable<Recipe[]>;

    constructor(
        private http: HttpClient,
        private recipeService: RecipeService,
        private firestoreService: FirestoreService,
        private angularFirestore: AngularFirestore
    ) {}

    storeRecipes() {
        try {
            this.recipeService.getRecipes().forEach(
                recipe => {
                    this.firestoreService.upsert('recipes/' + recipe.name, recipe);
                }
            );
        }
        catch(e) {
            console.log('Error: ', e);
        }
    }

    getRecipes() {
        let response : Observable<Recipe[]> = this.firestoreService.colWithIds$('recipes');
        let recipesSub : Subscription = response.subscribe(
            (recipes: Recipe[]) => {
                this.recipeService.setRecipes(recipes); 
            }
        );  
    }
}
