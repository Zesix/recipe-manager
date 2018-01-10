import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { Recipe } from '../recipe.interface';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit {
  index: number;
  editMode: boolean = false;
  recipeForm: FormGroup;
  recipe: Recipe;

  constructor(private route: ActivatedRoute,
    private recipeService: RecipeService,
    private router: Router) {

  }

  ngOnInit() {
    this.recipe = { name: '', description: '', imagePath: '', ingredients: [] };

    Observable.combineLatest(this.recipeService.myRecipes$, this.route.params )
    .subscribe((params: Params) => {
      this.index = +params['id'];
        // Check if this is a new recipe or if we are editing an existing one.
        this.editMode = params['id'] != null;
        if ( this.editMode ) {
          this.recipe = this.recipeService.getRecipe(this.index);
          this.initForm();
        }
    });
    this.initForm();
  }

  onSubmit() {

    this.recipe.name=this.recipeForm.value['name'],
    this.recipe.description= this.recipeForm.value['description'],
    this.recipe.imagePath= this.recipeForm.value['imagePath'],
    this.recipe.ingredients= this.recipeForm.value['ingredients'];


    if (this.editMode) {
      this.recipeService.updateRecipe(this.recipe);
    } else {
      this.recipeService.addRecipe(this.recipe);
    }

    this.router.navigate(['../'], {relativeTo: this.route});
  }

  private initForm() {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    const recipeIngredients = new FormArray([]);

    if (this.editMode) {
      const recipe = this.recipeService.getRecipe(this.index);
      recipeName = recipe.name;
      recipeImagePath = recipe.imagePath;
      recipeDescription = recipe.description;

      // Check if a recipe has any ingredients since they aren't required.
      if (recipe['ingredients'])
        for (let ingredient of recipe.ingredients) {
          recipeIngredients.push(new FormGroup({
            'name': new FormControl(ingredient.name, Validators.required),
            'amount': new FormControl(ingredient.amount, [
              Validators.required,
              Validators.pattern(/^[1-9]+[0-9]*$/)
            ])
          }))
        }
    }

    this.recipeForm = new FormGroup({
      'name': new FormControl(recipeName, Validators.required),
      'imagePath': new FormControl(recipeImagePath, Validators.required),
      'description': new FormControl(recipeDescription, Validators.required),
      'ingredients': recipeIngredients
    });
  }

  onAddIngredient() {
    // Angular has no way of knowing it is a FormArray so it must be cast.
    (<FormArray>this.recipeForm.get('ingredients')).push(new FormGroup({
      'name': new FormControl(null, Validators.required),
      'amount': new FormControl(null, [
        Validators.required,
        Validators.pattern(/^[1-9]+[0-9]*$/)
      ])
    }))
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

}
