import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserDTO, UserService } from '@shared';

@Component({
  selector: 'app-customers-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './customers-management.component.html',
})
export class CustomersManagementComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  customers: UserDTO[] = [];
  searchTerm: string = '';
  isLoading = false;

  // Control del Modal de Edición
  selectedCustomer: UserDTO | null = null;
  editForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
  });

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.userService.getUsers('CUSTOMER').subscribe({
      next: (data) => {
        this.customers = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error carregant clients:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredCustomers() {
    const search = this.searchTerm.toLowerCase().trim();
    if (!search) return this.customers;

    return this.customers.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      (c.phone && c.phone.includes(search))
    );
  }

  toggleCustomerStatus(customer: UserDTO) {
    const newStatus = !customer.isActive;

    this.userService.toggleUserStatus(customer.id, newStatus).subscribe({
      next: (updatedUser) => {
        const index = this.customers.findIndex(c => c.id === updatedUser.id);
        if (index !== -1) {
          this.customers[index] = updatedUser;
          this.customers = [...this.customers];
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al canviar estat del client:', err)
    });
  }

  openEditModal(customer: UserDTO) {
    this.selectedCustomer = customer;
    this.editForm.setValue({
      name: customer.name,
      phone: customer.phone || ''
    });
    this.cdr.detectChanges();
  }

  closeModal() {
    this.selectedCustomer = null;
    this.editForm.reset();
    this.cdr.detectChanges();
  }

  onSave() {
    if (this.editForm.invalid || !this.selectedCustomer) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.value;
    const updatedRequest = {
      name: formValue.name!,
      phone: formValue.phone!,
      email: this.selectedCustomer.email,
      role: this.selectedCustomer.role
    };

    this.userService.updateUser(this.selectedCustomer.id, updatedRequest as any).subscribe({
      next: (updatedUser) => {
        const index = this.customers.findIndex(c => c.id === updatedUser.id);
        if (index !== -1) {
          this.customers[index] = updatedUser;
          this.customers = [...this.customers];
        }
        this.closeModal();
      },
      error: (err) => console.error('Error al actualitzar client:', err)
    });
  }
}
