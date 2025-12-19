import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  featured: boolean;
  imageUrl: string;
  imagePath?: string;
  altText: string;
  sku?: string;
  weight?: number;
  dimensions?: string;
  material?: string;
  color?: string;
  careInstructions?: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'draft' | 'archived';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imagePath?: string;
  active: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SEO {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  customMeta?: {
    [key: string]: string;
  };
  updatedAt: Timestamp;
}

export interface FeaturedItem {
  id: string;
  productId: string;
  order: number;
  startDate?: Timestamp;
  endDate?: Timestamp;
  createdAt: Timestamp;
}

export interface Admin {
  id: string;
  email: string;
  role: 'admin' | 'super_admin' | 'editor';
  name: string;
  active: boolean;
  lastLogin: Timestamp;
  createdAt: Timestamp;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  imagePath?: string;
  category: string;
  tags: string[];
  readTime: number;
  publishedDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'published' | 'draft';
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  altText: string;
}

// Type for creating new items (omitting auto-generated fields)
export type CreateProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateCategory = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateSEO = Omit<SEO, 'id' | 'updatedAt'>;
export type CreateFeaturedItem = Omit<FeaturedItem, 'id' | 'createdAt'>;
export type CreateAdmin = Omit<Admin, 'id' | 'lastLogin' | 'createdAt'>;
export type CreateBlog = Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>;

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  // Snapshot of product fields to show in orders (keeps history)
  productSnapshot?: Partial<Product>;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod';
  paymentStatus: 'pending' | 'paid';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateOrder = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;