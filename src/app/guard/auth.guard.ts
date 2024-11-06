import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})

export class AuthGuard implements CanActivate {
	constructor(private authService: AuthService, private router: Router) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		return this.authService.isAuthenticated().pipe(map((isAuthenticated: boolean) => {
			if (isAuthenticated) {
				return true;  // If the user is authenticated, allow access to the route
			} else {
				this.router.navigate(['/login']);  // Redirect to login if not authenticated
				return false;  // Prevent route activation
			}
		}));
	}
}