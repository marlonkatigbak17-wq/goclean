export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  priceWithInstallation?: number;
  images: string[];
  specs: {
    horsepower?: string;
    coolingCapacity?: string;
    energyEfficiency?: string;
    warranty?: string;
  };
  inStock: boolean;
  description: string;
  slug: string;
  badge?: 'Best Seller' | 'New' | 'Sale';
}

export type ProductCategory =
  | 'residential'
  | 'commercial'
  | 'hvac-supplies'
  | 'tools';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  location: string;
  type: string;
  images: string[];
  description: string;
  completedAt: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  service: string;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  withInstallation: boolean;
}

export interface BookingForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  preferredDate: string;
  notes: string;
}
