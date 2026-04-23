import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductDTO } from '@shared';

@Component({
  selector: 'app-menu-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu-manager.component.html',
})
export class MenuManagerComponent implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  allProducts: ProductDTO[] = [];
  filteredProducts: ProductDTO[] = [];
  errorMessage = '';
  modalError = '';

  searchTerm = '';
  selectedCategory = 'Tots';

  isAddModalOpen = false;
  isEditDrawerOpen = false;

  selectedProduct: Partial<ProductDTO> = {};

  categoryMap: { [key: string]: string } = {
    burgers: 'Burguers',
    burritos: 'Burritos',
    sides: 'Acompanyaments',
    drinks: 'Begudes',
    desserts: 'Postres',
  };

  getCategoryName(dbCategory: string | undefined): string {
    if (!dbCategory) return 'Sense categoria';
    return this.categoryMap[dbCategory.toLowerCase()] || dbCategory;
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.allProducts = data || [];
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error loading products.';
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters() {
    const search = (this.searchTerm || '').toLowerCase();

    let result = this.allProducts.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();

      const matchSearch = name.includes(search);
      const matchCategory =
        this.selectedCategory === 'Tots' || cat === this.selectedCategory.toLowerCase();

      return matchSearch && matchCategory;
    });

    result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    this.filteredProducts = [...result];
  }

  setCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  toggleProduct(product: ProductDTO) {
    const newStatus = !product.isAvailable;
    this.errorMessage = '';

    this.productService.toggleAvailability(product.id, newStatus).subscribe({
      next: (updatedProduct) => {
        const index = this.allProducts.findIndex((p) => p.id === updatedProduct.id);
        if (index !== -1) {
          this.allProducts[index] = updatedProduct;
          this.applyFilters();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage =
          "No s'ha pogut canviar la disponibilitat. Comprova que la teva sessió no hagi caducat.";
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      },
    });
  }

  openAddModal() {
    this.selectedProduct = { isAvailable: true, price: 0, category: 'BURGERS' };
    this.modalError = '';
    this.isAddModalOpen = true;
  }

  openEditDrawer(product: ProductDTO) {
    this.selectedProduct = {
      ...product,
      category: product.category ? product.category.toUpperCase() : 'BURGERS',
    };
    this.modalError = '';
    this.isEditDrawerOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
  }

  closeEditDrawer() {
    this.isEditDrawerOpen = false;
  }

  saveNewProduct() {
    this.modalError = '';

    if (
      !this.selectedProduct.name ||
      !this.selectedProduct.price ||
      !this.selectedProduct.category
    ) {
      this.modalError = 'Nom, preu i categoria són obligatoris.';
      return;
    }

    this.productService.createProduct(this.selectedProduct).subscribe({
      next: (created) => {
        this.allProducts.push(created);
        this.applyFilters();
        this.closeAddModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.modalError = 'Error al crear el producte.';
        this.cdr.detectChanges();
      },
    });
  }

  updateProduct() {
    this.modalError = '';
    if (!this.selectedProduct.id) return;

    this.productService.updateProduct(this.selectedProduct.id, this.selectedProduct).subscribe({
      next: (updated) => {
        const index = this.allProducts.findIndex((p) => p.id === updated.id);
        if (index !== -1) {
          this.allProducts[index] = updated;
          this.applyFilters();
        }
        this.closeEditDrawer();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.modalError = 'Error al actualitzar el producte.';
        this.cdr.detectChanges();
      },
    });
  }
}
