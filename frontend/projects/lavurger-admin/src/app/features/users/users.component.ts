import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserDTO, UserRequestDTO, Role } from '@shared';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UserAvatarComponent],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  Role = Role;

  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];

  searchTerm: string = '';
  selectedStatus: 'Tots' | 'Actius' | 'Desactivats' = 'Tots';

  isAddModalOpen = false;
  isEditDrawerOpen = false;
  modalError = '';

  nameErrorReactive: string | null = null;
  emailErrorReactive: string | null = null;
  passwordErrorReactive: string | null = null;
  phoneErrorReactive: string | null = null;

  selectedUser: Partial<UserDTO & { password?: string }> = {};

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = (data || []).filter((u) => u.role !== Role.CUSTOMER);
        this.users.sort((a, b) => a.id - b.id);
        this.applyFilters();
      },
      error: (err) => console.error('❌ Error carregant usuaris:', err),
    });
  }

  setStatus(status: 'Tots' | 'Actius' | 'Desactivats') {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    const searchStr = (this.searchTerm || '').toLowerCase();

    const results = this.users.filter((user) => {
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();

      const matchesSearch = name.includes(searchStr) || email.includes(searchStr);

      const matchesStatus =
        this.selectedStatus === 'Tots'
          ? true
          : this.selectedStatus === 'Actius'
            ? user.isActive
            : !user.isActive;

      return matchesSearch && matchesStatus;
    });

    this.filteredUsers = [...results];
    this.cdr.detectChanges();
  }

  getRoleDisplayName(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'Super Admin';
      case Role.MANAGER:
        return 'Manager';
      case Role.KITCHEN:
        return 'Cuina (Cap / Ajudant)';
      case Role.CASHIER:
        return 'Sala / Cambrer';
      default:
        return role;
    }
  }

  checkName() {
    const name = this.selectedUser.name || '';
    if (name.length > 0 && name.length < 3) {
      this.nameErrorReactive = 'El nom ha de tenir almenys 3 lletres.';
    } else {
      this.nameErrorReactive = null;
    }
  }

  checkEmail() {
    const email = this.selectedUser.email || '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.length > 0 && !emailRegex.test(email)) {
      this.emailErrorReactive = 'Format de correu invàlid.';
    } else {
      this.emailErrorReactive = null;
    }
  }

  checkPhone() {
    const phone = this.selectedUser.phone || '';
    if (phone.length > 0 && !/^[0-9]{9}$/.test(phone)) {
      this.phoneErrorReactive = 'El telèfon ha de tenir exactament 9 dígits.';
    } else {
      this.phoneErrorReactive = null;
    }
  }

  checkPassword(isEditMode = false) {
    const pass = this.selectedUser.password || '';

    if (isEditMode && pass.length === 0) {
      this.passwordErrorReactive = null;
      return;
    }

    if (pass.length > 0 && pass.length < 8) this.passwordErrorReactive = 'Mínim 8 caràcters.';
    else if (pass.length > 0 && !/.*[A-Z].*/.test(pass))
      this.passwordErrorReactive = 'Falta una majúscula.';
    else if (pass.length > 0 && !/.*[a-z].*/.test(pass))
      this.passwordErrorReactive = 'Falta una minúscula.';
    else if (pass.length > 0 && !/.*\d.*/.test(pass))
      this.passwordErrorReactive = 'Falta un número.';
    else if (pass.length > 0 && !/.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*/.test(pass))
      this.passwordErrorReactive = 'Falta un caràcter especial.';
    else this.passwordErrorReactive = null;
  }

  openAddModal() {
    this.selectedUser = { role: Role.CASHIER, password: '', phone: '' };
    this.modalError = '';
    this.nameErrorReactive = null;
    this.emailErrorReactive = null;
    this.passwordErrorReactive = null;
    this.phoneErrorReactive = null;
    this.isAddModalOpen = true;
    this.cdr.detectChanges();
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.cdr.detectChanges();
  }

  saveNewUser() {
    this.checkName();
    this.checkEmail();
    this.checkPhone();
    this.checkPassword(false);

    if (
      !this.selectedUser.name ||
      !this.selectedUser.email ||
      !this.selectedUser.password ||
      !this.selectedUser.role
    ) {
      this.modalError = 'Tots els camps són obligatoris.';
      return;
    }

    if (this.nameErrorReactive || this.emailErrorReactive || this.passwordErrorReactive || this.phoneErrorReactive) {
      this.modalError = 'Revisa els errors del formulari abans de continuar.';
      return;
    }

    const request: UserRequestDTO = {
      name: this.selectedUser.name,
      email: this.selectedUser.email,
      phone: this.selectedUser.phone || '',
      password: this.selectedUser.password,
      role: this.selectedUser.role,
    };

    this.userService.createUser(request).subscribe({
      next: () => {
        this.closeAddModal();
        this.loadUsers();
      },
      error: (err) => {
        if (err.status === 400) {
          this.modalError = 'La contrasenya o el format de les dades no compleix els requisits de seguretat.';
        } else if (err.status === 409) {
          this.modalError = 'Aquest correu electrònic ja està registrat al sistema.';
        } else {
          this.modalError = 'S\'ha produït un error intern al servidor. Intenta-ho de nou.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  openEditDrawer(user: UserDTO) {
    this.selectedUser = { ...user, password: '' };
    this.modalError = '';
    this.nameErrorReactive = null;
    this.emailErrorReactive = null;
    this.passwordErrorReactive = null;
    this.phoneErrorReactive = null;
    this.isEditDrawerOpen = true;
    this.cdr.detectChanges();
  }

  closeEditDrawer() {
    this.isEditDrawerOpen = false;
    this.cdr.detectChanges();
  }

  updateUser() {
    this.checkName();
    this.checkEmail();
    this.checkPhone();
    this.checkPassword(true);

    if (
      !this.selectedUser.id ||
      !this.selectedUser.name ||
      !this.selectedUser.email ||
      !this.selectedUser.role
    ) {
      this.modalError = 'Falten camps per omplir.';
      return;
    }

    if (this.nameErrorReactive || this.emailErrorReactive || this.passwordErrorReactive || this.phoneErrorReactive) {
      this.modalError = 'Revisa els errors del formulari abans de continuar.';
      return;
    }

    const request: UserRequestDTO = {
      name: this.selectedUser.name,
      email: this.selectedUser.email,
      phone: this.selectedUser.phone || '',
      password: this.selectedUser.password,
      role: this.selectedUser.role,
    };

    this.userService.updateUser(this.selectedUser.id, request).subscribe({
      next: () => {
        this.closeEditDrawer();
        this.loadUsers();
      },
      error: (err) => {
        if (err.status === 400) {
          this.modalError = 'Les dades introduïdes no són vàlides o no compleixen els requisits.';
        } else {
          this.modalError = 'Error en actualitzar l\'usuari del sistema.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  toggleUserStatus(user: UserDTO) {
    this.userService.toggleUserStatus(user.id, !user.isActive).subscribe({
      next: (updatedUser) => {
        user.isActive = updatedUser.isActive;
        this.applyFilters();
      },
      error: (err) => console.error('Error canviant estat:', err),
    });
  }
}
