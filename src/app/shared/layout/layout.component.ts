import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})

export class LayoutComponent implements OnInit {
	title = 'task-3-app';
	isAuthenticated: boolean = false;

  	private authStatusSubscription: Subscription | undefined;

	constructor(private authService: AuthService, private router: Router) {}

	ngOnInit(): void {
		this.updateAuthStatusSubscription(); // Subscribe to the authentication state in the service
	}

	ngOnDestroy(): void {
		if (this.authStatusSubscription) this.authStatusSubscription.unsubscribe(); // Clean up the subscription when the component is destroyed
	}

	updateAuthStatusSubscription() {
		this.authStatusSubscription = this.authService.isAuthenticated$.subscribe((status) => this.isAuthenticated = status);
	}

	logout() {
		this.authService.logout();
		this.updateAuthStatusSubscription();
	}
}
