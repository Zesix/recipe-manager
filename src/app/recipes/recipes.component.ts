import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Recipe } from './recipe.interface';
import { RecipeService } from './recipe.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public recipes: Recipe[];

  constructor(private recipeService: RecipeService) { }

  ngOnInit() {
    // TODO Fix this 
    this.subscription = this.recipeService.myRecipes$
      .subscribe((recipes: Recipe[]) => {
        this.recipes = recipes;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
