import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent implements OnInit {
	user: any = null;

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		this.authService.getUser().subscribe((userData) => this.user = userData, (error) => {
			console.log('logout dashboard', error);
			this.authService.logout();
			console.error('Error fetching user data', error);
		});
	}
}
