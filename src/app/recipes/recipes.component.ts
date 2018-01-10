import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Recipe } from './recipe.interface';
import { RecipeService } from './recipe.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {
  private subscription: Subscription;
  public recipes: Recipe[];

  constructor(private recipeService: RecipeService) { }

  ngOnInit() {
    this.subscription = this.recipeService.myRecipes$
       .subscribe((recipes: Recipe[]) => {
         this.recipes = recipes;
       });
  }

}
