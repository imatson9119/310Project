import { Injectable } from '@angular/core';
import { CanActivate,
         ActivatedRouteSnapshot,
         RouterStateSnapshot, 
         Router} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LoggedInRouteGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      if(this.auth.user$){
          return true;
      }
      this.router.navigateByUrl('/login');
  }
}