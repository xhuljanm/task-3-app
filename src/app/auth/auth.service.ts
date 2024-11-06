import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root',
})

export class AuthService {
    private apiUrl = 'http://localhost:3000';
	private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

	isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(private router: Router, private http: HttpClient) {}

	updateAuthenticationStatus(status: boolean): void {
		this.isAuthenticatedSubject.next(status);
	}

    isAuthenticated(): Observable<boolean> { // Check if the user is authenticated
		const token = localStorage.getItem('auth_token') as string;

        if (!token) return of(false); // No token, return false

        const decodedToken: any = jwtDecode(token); // Decode the token to check if it is expired
        const currentTime = Date.now() / 1000; // Current time in seconds

        if (decodedToken.exp < currentTime) {
            this.logout(); // Token expired, log the user out
            return of(false); // Return false if expired
        }

        return this.verifyToken(token).pipe(map((response) => { // Verify the token via an API call
			if (response.isValid) {
				this.isAuthenticatedSubject.next(true);
				return true; // Token is valid
            } else {
				this.isAuthenticatedSubject.next(false);
				this.logout(); // Token is invalid, log the user out
				return false; // Return false if the token is invalid
			}
		}), catchError(() => {
			this.logout(); // On error, log the user out
			return of(false); // Return false in case of error
		}));
    }

	getUser(): Observable<any> {
		const token = localStorage.getItem('auth_token') as string;

		if (!token) throw new Error('No auth token found');

		const headers = new HttpHeaders({
			'Authorization': `Bearer ${token}`
		});

		return this.http.get<any>(`${this.apiUrl}/user`, { headers });
	}

    logout(): void {
		this.isAuthenticatedSubject.next(false);

		localStorage.removeItem('auth_token');
		localStorage.removeItem('isAuthenticated');

		this.router.navigate(['/login']); // Redirect to login page after logout
    }

    // API request to verify the token
    private verifyToken(token: string): Observable<{ isValid: boolean }> {
		const headers = { Authorization: `Bearer ${token}` };  // Token sent in the Authorization header
		return this.http.get<{ isValid: boolean }>(`${this.apiUrl}/verify-token`, { headers });
	}
}