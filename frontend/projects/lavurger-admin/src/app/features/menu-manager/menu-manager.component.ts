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
  isConfirmModalOpen = false;

  selectedProduct: Partial<ProductDTO> = {};
  productToDelete: ProductDTO | null = null;

  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isImageUploading = false;

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
      if (!p.isAvailable) return false;

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

  deactivateProduct(product: ProductDTO) {
    this.productToDelete = product;
    this.isConfirmModalOpen = true;
    this.cdr.detectChanges();
  }

  confirmDeactivate() {
    if (this.productToDelete) {
      this.productToDelete.isAvailable = true;
      this.toggleProduct(this.productToDelete);
    }
    this.closeConfirmModal();
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
    this.productToDelete = null;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any, productId?: number) {
    const file = event.target.files[0];
    if (!file) return;

    this.modalError = '';

    if (!file.type.startsWith('image/')) {
      this.modalError = "Per favor, selecciona un arxiu d'imatge vàlid (PNG, JPG).";
      this.cdr.detectChanges();
      return;
    }

    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);

    if (productId) {
      this.uploadImageToS3(productId);
    }
  }

  uploadImageToS3(productId: number, isNewProduct = false) {
    if (!this.selectedImageFile) return;

    this.isImageUploading = true;
    this.modalError = '';
    this.cdr.detectChanges();

    this.productService.uploadProductImage(productId, this.selectedImageFile).subscribe({
      next: (updatedProduct) => {
        const index = this.allProducts.findIndex((p) => p.id === updatedProduct.id);
        if (index !== -1) {
          this.allProducts[index] = updatedProduct;
        } else if (isNewProduct) {
          this.allProducts.push(updatedProduct);
        }

        if (this.selectedProduct && this.selectedProduct.id === updatedProduct.id) {
          this.selectedProduct.imageUrl = updatedProduct.imageUrl;
        }

        this.applyFilters();
        this.resetImageState();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error uploading image to AWS:', err);
        this.isImageUploading = false;
        this.modalError = "Error al pujar la imatge els servidors d'Amazon AWS S3.";
        this.cdr.detectChanges();
      }
    });
  }

  private resetImageState() {
    this.isImageUploading = false;
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
  }

  openAddModal() {
    this.selectedProduct = { isAvailable: true, price: 0, category: 'burgers' };
    this.modalError = '';
    this.resetImageState();
    this.isAddModalOpen = true;
  }

  openEditDrawer(product: ProductDTO) {
    this.selectedProduct = {
      ...product,
      category: product.category ? product.category.toLowerCase() : 'burgers',
    };
    this.modalError = '';
    this.resetImageState();
    this.isEditDrawerOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
    this.resetImageState();
  }

  closeEditDrawer() {
    this.isEditDrawerOpen = false;
    this.resetImageState();
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
        if (this.selectedImageFile) {
          this.uploadImageToS3(created.id, true);
        } else {
          this.allProducts.push(created);
          this.applyFilters();
        }
        this.isAddModalOpen = false;
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
