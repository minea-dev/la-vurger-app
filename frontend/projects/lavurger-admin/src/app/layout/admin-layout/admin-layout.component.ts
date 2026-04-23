import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  currentTime: Date = new Date();
  private timerId: any;
  isDropdownOpen = false;

  userEmail = '';
  userRole = '';
  userInitials = '';
  roleColorClass = 'bg-admin-blue';
  roleDisplayName = 'Admin';

  ngOnInit() {
    this.timerId = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    this.loadUserData();
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  toggleUserDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.authService.logout();
  }

  loadUserData() {
    const profile = this.authService.getUserProfile();
    if (profile) {
      this.userEmail = profile.email;
      this.userRole = profile.role;

      this.userInitials = this.userEmail.substring(0, 2).toUpperCase();
      this.setRoleVisuals(this.userRole);
    }
  }

  setRoleVisuals(role: string) {
    switch (role) {
      case 'ADMIN':
        this.roleColorClass = 'bg-admin-blue';
        this.roleDisplayName = 'Admin';
        break;
      case 'MANAGER':
        this.roleColorClass = 'bg-purple-600';
        this.roleDisplayName = 'Manager';
        break;
      case 'KITCHEN':
        this.roleColorClass = 'bg-orange-500';
        this.roleDisplayName = 'Cuina';
        break;
      case 'CASHIER':
      case 'WAIT_STAFF':
        this.roleColorClass = 'bg-emerald-600';
        this.roleDisplayName = 'Sala / Caixa';
        break;
      default:
        this.roleColorClass = 'bg-gray-500';
        this.roleDisplayName = 'Staff';
    }
  }
}
