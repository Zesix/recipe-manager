import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { AppRoutingModule } from '../app-routing.module';
import { AuthService } from './auth/auth.service';
import { HeaderComponent } from '../header/header.component';
import { FirestoreService } from './firestore.service';

const firestoreConfig = {
  apiKey: 'AIzaSyBdthJRryoYvw-u2rLcgH9U23jhi0hdxlE',
  authDomain: 'angular-showcase-app.firebaseapp.com',
  databaseURL: 'https://angular-showcase-app.firebaseio.com',
  projectId: 'angular-showcase-app',
  storageBucket: 'angular-showcase-app.appspot.com',
  messagingSenderId: '774304205510'
};

@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    AngularFireModule.initializeApp(firestoreConfig),
    AngularFirestoreModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [AppRoutingModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  providers: [AuthService, FirestoreService]
})
export class CoreModule { }
