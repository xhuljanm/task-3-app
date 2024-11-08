import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guard/auth.guard';
import { BoxesComponent } from './pages/boxes/boxes.component';

export const routes: Routes = [
	{ path: '', component: LayoutComponent,
		children: [
			{ path: 'login',  component: LoginComponent },
			{ path: 'register',  component: RegisterComponent },
			{ path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
			{ path: 'boxes', component: BoxesComponent, canActivate: [AuthGuard] },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	}
];