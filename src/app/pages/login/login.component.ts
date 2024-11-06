import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
	form: FormGroup;
	isLoggingIn: boolean = false;
	successRegister: boolean = false;
  	showSuccessMessage: boolean = false;
	showErrorMessage: boolean = false;
	errorMessage: string = '';

	constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private authService: AuthService, private activatedRoute: ActivatedRoute) {
		this.form = this.fb.group({
			email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [Validators.required]),
		});
	}

	ngOnInit(): void {
		this.activatedRoute.queryParams.pipe(take(1)).subscribe((params) => this.successRegister = params['successRegister'] && JSON.parse(params['successRegister'])=== true);

		if(this.authService.isAuthenticated()) this.router.navigate(['/dashboard']);
	}

	onSubmit() {
		if (this.form.valid) {
			const loginData = this.form.value;
			this.isLoggingIn = true;
			this.showErrorMessage = false;

			this.http.post('http://localhost:3000/login', loginData, {
				headers: new HttpHeaders({
					'Content-Type': 'application/json',
				}),
			}).pipe(catchError(err => {
				console.error('Login failed', err);
				this.isLoggingIn = false;
				this.showErrorMessage = true;
				this.errorMessage = err && err.error && err.error.message ? err.error.message : 'Unknown Error';
				return of(null); // handle the error and continue the flow
			})).subscribe((response: any) => {
				this.isLoggingIn = false;
				if (response) {
					this.showSuccessMessage = true;
					localStorage.setItem('auth_token', response.token);
					localStorage.setItem('isAuthenticated', 'true');
					console.log('Login successful', response);
					setTimeout(() => {
						this.authService.updateAuthenticationStatus(true);
						this.router.navigate(['/dashboard']);
					}, 2000); //Delay 2 seconds so we can just see the success message
				}
			});
		}
	}

	closeAlert() {
		this.showErrorMessage = false;
		this.showSuccessMessage = false;
	}
}
