import { Component } from '@angular/core';
import { Response } from '@angular/http';
import { RecipeStorageService } from '../shared/recipe-storage.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    constructor(private recipeStorageService: RecipeStorageService) {}

    onSaveData() {
        this.recipeStorageService.storeRecipes();
    }

    onFetchData() {
        this.recipeStorageService.getRecipes();
    }
}