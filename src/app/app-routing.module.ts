import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BudgetingComponent } from './budgeting/budgeting.component';
import { LoginComponent } from './login/login.component';
import { MenuComponent } from './menu/menu.component';
import { RecentExpensesComponent } from './recent-expenses/recent-expenses.component';
import { ReportingComponent } from './reporting/reporting.component';
import { LoggedInRouteGuard } from './shared/route-guard';

// const routes: Routes = [
//   { path: "", redirectTo: "/home", pathMatch: "full" },
//   { path: "home", component: HomeComponent },
//   { path: "login", component: SpotifyLoginComponent },
//   { path: "user-home", component: UserPanelComponent, canActivate: [LoggedInRouteGuard] },
//   { path: "share", component: ShareComponent, data: {animation: 'SharePage'} },
//   { path: "compare", component: CompareComponent, canActivate: [LoggedInRouteGuard], data: {animation: 'ComparePage'} },
//   { path: '404', component: NotFoundComponent },
//   { path: 'disabled', component: DisabledComponent },
//   { path: 'about', component: AboutComponent, data: {animation: 'AboutPage'}},
//   { path: '**', redirectTo: '/home'}
// ];
const routes: Routes = [
   { path: "", redirectTo: "recent-expenses", pathMatch: "full" },
   { path: "menu", component: MenuComponent },
   { path: "login", component: LoginComponent },
   { path: "reporting", component: ReportingComponent/*, canActivate: [LoggedInRouteGuard]*/ },
   { path: "budgeting", component: BudgetingComponent/*, canActivate: [LoggedInRouteGuard]*/ },
   { path: "recent-expenses", component: RecentExpensesComponent/*, canActivate: [LoggedInRouteGuard] */},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
