export interface BookImage {
  id: string;
  path: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface BookCategoryRef {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  categoryId: string;
  category: BookCategoryRef | null;
  title: string;
  author: string;
  description: string | null;
  price: number;
  language: string;
  pages: number | null;
  publisher: string | null;
  format: string;
  rating: number | null;
  isEbook: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  coverImage: string | null;
  images: BookImage[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminBook extends Book {
  isActive: boolean;
  googleDriveUrl: string | null;
}
