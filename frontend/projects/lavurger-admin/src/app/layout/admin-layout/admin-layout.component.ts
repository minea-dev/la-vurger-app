import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';
import { Role } from '@shared';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, UserAvatarComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  currentTime: Date = new Date();
  private timerId: any;
  isDropdownOpen = false;

  userEmail = '';
  userRole: Role | '' = '';
  roleDisplayName = 'Staff';

  canSeeKitchen = false;
  canSeeMonitor = false;
  canSeeMenu = false;
  canSeeCustomers = false;
  canSeeUsers = false;

  ngOnInit() {
    this.timerId = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    this.loadUserData();
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
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
      this.userRole = profile.role as Role;
      this.setRoleDisplayName(this.userRole);

      this.canSeeKitchen = [Role.ADMIN, Role.MANAGER, Role.KITCHEN].includes(this.userRole);
      this.canSeeMonitor = [Role.ADMIN, Role.MANAGER, Role.CASHIER].includes(this.userRole);
      this.canSeeMenu = [Role.ADMIN, Role.MANAGER].includes(this.userRole);
      this.canSeeCustomers = [Role.ADMIN, Role.MANAGER].includes(this.userRole);
      this.canSeeUsers = this.userRole === Role.ADMIN;
    }
  }

  setRoleDisplayName(role: Role) {
    switch (role) {
      case Role.ADMIN:
        this.roleDisplayName = 'Admin';
        break;
      case Role.MANAGER:
        this.roleDisplayName = 'Manager';
        break;
      case Role.KITCHEN:
        this.roleDisplayName = 'Cuina';
        break;
      case Role.CASHIER:
        this.roleDisplayName = 'Sala';
        break;
      default:
        this.roleDisplayName = 'Staff';
    }
  }
}
