export enum Category {
  MEN = 'Men',
  WOMEN = 'Women',
  KIDS = 'Kids',
  FABRICS = 'Fabrics',
  CUSTOM = 'Custom Tailoring'
}

export type OrderStatus = 'Pending' | 'In Progress' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Fully Paid' | 'Partially Paid' | 'Due' | 'Refunded';
export type ProductionStep = 'Queue' | 'Cutting' | 'Stitching' | 'Finishing' | 'Ready';
export type BespokeType = 'Normal' | 'Express' | 'Urgent';

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  initialAmount: number;
  customerEmail: string;
  customerName: string;
  isActive: boolean;
  expiryDate?: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountTag: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

export interface Notice {
  id: string;
  content: string;
  type: 'info' | 'warning' | 'promotion';
  isActive: boolean;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  date: string;
}

export interface UpcomingProduct {
  id: string;
  name: string;
  image: string;
  expectedDate: string;
  description: string;
  isActive: boolean;
}

export interface BespokeService {
  id: string;
  name: string;
  icon: string;
  image?: string; 
  basePrice: number;
  description: string;
  isActive: boolean;
}

export interface DueRecord {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  reason: string;
  status: 'pending' | 'settled';
  date: string; 
  settledDate?: string; 
  lastUpdated: string;
}

export interface SystemConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  secure: boolean;
  senderName: string;
  senderEmail: string;
  isEnabled: boolean;
  siteLogo?: string;
  documentLogo?: string; 
  siteName: string;
  dbVersion: string;
  giftCardDenominations: number[]; 
  giftCardsEnabled: boolean;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  status: 'sent' | 'failed' | 'queued';
  templateId: string;
  smtpRef?: string;
}

export interface Fabric {
  id: string;
  name: string;
  image: string;
  description: string;
  colors?: string[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

export interface PartnerBrand {
  id: string;
  name: string;
  logo: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  image: string;
  images?: string[]; 
  description: string;
  fabricType: string;
  availableSizes: string[];
  colors: string[];
  inStock: boolean;
  stockCount: number; 
  isFeatured?: boolean;
}

export interface Measurement {
  id: string;
  label: string;
  chest?: number;
  waist?: number;
  shoulder?: number;
  sleeveLength?: number;
  length?: number;
  neck?: number;
  hip?: number;
  inseam?: number;
}

export interface DesignOptions {
  collar?: string;
  cuff?: string;
  pocket?: string;
  fit?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedFabric?: string;
  isCustomOrder: boolean;
  measurements?: Measurement;
  designOptions?: DesignOptions;
  price: number;
  name: string;
  image: string;
  bespokeNote?: string;
  bespokeType?: BespokeType;
  deliveryDate?: string;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  productionStep?: ProductionStep;
  assignedWorkerId?: string;
  paymentStatus: PaymentStatus;
  total: number;
  subtotal: number;
  discountAmount?: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  items: CartItem[];
  address: string;
  customerName?: string;
  customerEmail?: string;
  couponUsed?: string;
  bespokeNote?: string;
  bespokeType?: BespokeType;
  deliveryDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  measurements: Measurement[];
  role?: 'admin' | 'customer' | 'worker';
  specialization?: string;
  experience?: string;
  joinDate?: string;
  password?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  usageLimit: number | null; 
  usageCount: number;
  expiryDate?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved';
}

export interface ProductRequest {
  id: string;
  userName: string;
  email: string;
  productTitle: string;
  description: string;
  date: string;
}

export interface MaterialRequest {
  id: string;
  workerId: string;
  workerName: string;
  materialName: string;
  quantity: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'sale' | 'restock' | 'order_update' | 'general' | 'fiscal';
  link?: string;
}