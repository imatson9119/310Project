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
import { AddExpenseDialog, RecentExpensesComponent } from './recent-expenses/recent-expenses.component';
import { ReportingComponent } from './reporting/reporting.component';
import { AddBudgetDialog, BudgetingComponent } from './budgeting/budgeting.component';
import { GroupInfoDialog, UserProfileComponent } from './shared/user-profile/user-profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { AuthService } from './services/auth.service';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatSelectModule} from '@angular/material/select';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

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
    LoginComponent,
    RecentExpensesComponent,
    ReportingComponent,
    BudgetingComponent,
    UserProfileComponent,
    AddExpenseDialog,
    GroupInfoDialog,
    AddBudgetDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(config),
    AngularFirestoreModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatCheckboxModule,
    TextFieldModule,
    MatSelectModule,
    MatCardModule,
    MatMenuModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule
    
  ],
  providers: [LoggedInRouteGuard,AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
