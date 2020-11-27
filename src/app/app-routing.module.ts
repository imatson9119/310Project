import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './menu/menu.component';

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
   { path: "", redirectTo: "/home", pathMatch: "full" },
   { path: "menu", component: MenuComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
