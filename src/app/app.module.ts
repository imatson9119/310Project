import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { MenuComponent } from './menu/menu.component';
import { SidenavComponent } from './sidenav/sidenav.component';

import { LoggedInRouteGuard } from './shared/route-guard';
import { LoginComponent } from './login/login.component';

const config = {
  apiKey: "AIzaSyAEUJ9BQIKXEK72X6RwYGE-X3tBlYWPDTc",
  authDomain: "project310-6e7fe.firebaseapp.com",
  databaseURL: "https://project310-6e7fe.firebaseio.com",
  projectId: "project310-6e7fe",
  storageBucket: "project310-6e7fe.appspot.com",
  messagingSenderId: "331002985377",
  appId: "1:331002985377:web:647ebdb6afa96d4b6929e0",
  measurementId: "G-5QZ4S66WP8"
};

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    SidenavComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(config),
    AngularFirestoreModule,
    AngularFireAuthModule,
  ],
  providers: [LoggedInRouteGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
