export interface Comment {
  id: string;
  name: string;
  location: string | null;
  quote: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
