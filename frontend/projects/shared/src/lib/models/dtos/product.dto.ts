export interface ProductDTO {
  id: number;
  name: string;
  description?: string;
  longDescription?: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
