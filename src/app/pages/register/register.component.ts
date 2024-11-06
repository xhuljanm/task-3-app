import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators,} from '@angular/forms';
import { catchError, of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
	form: FormGroup;

	constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private authService: AuthService) {
		this.form = this.fb.group({
			name: new FormControl('', [Validators.required]),
		  	email: new FormControl('', [Validators.required, Validators.email]),
			password: new FormControl('', [
				Validators.required,
				Validators.minLength(8),
				this.passwordStrengthValidator // Real-time password strength validation
			] as ValidatorFn[]),
			confirmPassword: new FormControl('', [
				Validators.required,
				Validators.minLength(8)
			])
		}, { validators: this.passwordMatchValidator });
	}

	ngOnInit(): void {
		this.authService.isAuthenticated().subscribe(isAuthenticated => isAuthenticated && this.router.navigate(['/dashboard']));
	}

	passwordStrengthValidator(control: FormControl) {
		const value = control.value;
		if (!value) return null;

		const minLengthValid = value.length >= 8;
		const hasUppercase = /[A-Z]/.test(value);
		const hasNumber = /\d/.test(value);
		const passwordValid = minLengthValid && hasUppercase && hasNumber;

		return passwordValid ? null : { passwordStrength: true };
	}

	passwordMatchValidator(group: FormGroup) {
		const password = group.get('password');
		const confirmPassword = group.get('confirmPassword');
		return password && confirmPassword && password.value === confirmPassword.value ? null : { mismatch: true };
	}

	onSubmit() {
		if(this.form.valid) {
			const registerData = this.form.value;

			this.http.post('http://localhost:3000/register', registerData, {
				headers: new HttpHeaders({
					'Content-Type': 'application/json',
				}),
			}).pipe(catchError(err => {
				console.error('Registration failed', err);
				return of(null); // handle the error and continue the flow
			})).subscribe((response: any) => {
				if (response) {
					console.log('Registration successful');
					this.router.navigate(['/login'], { queryParams: { successRegister: true } }); // successLogin we pass it to login component to show the success alert
				}
			});
		}
	}
}
