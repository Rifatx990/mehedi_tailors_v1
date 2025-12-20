
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, User, Order, OrderStatus, Fabric, Coupon, ProductRequest, Banner, Review, ProductionStep, MaterialRequest, SystemConfig, Notification, PartnerBrand } from '../types.ts';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants.tsx';

interface StoreContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  adminUser: User | null;
  setAdminUser: (user: User | null) => void;
  workerUser: User | null;
  setWorkerUser: (user: User | null) => void;
  allUsers: User[]; 
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  orders: Order[];
  placeOrder: (order: Order) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateProductionStep: (orderId: string, step: ProductionStep) => Promise<void>;
  assignWorker: (orderId: string, workerId: string) => Promise<void>;
  removeOrder: (id: string) => Promise<void>;
  products: Product[];
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  fabrics: Fabric[];
  addFabric: (fabric: Fabric) => Promise<void>;
  removeFabric: (id: string) => Promise<void>;
  categories: string[];
  addCategory: (cat: string) => void;
  removeCategory: (cat: string) => void;
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => Promise<void>;
  updateCoupon: (coupon: Coupon) => Promise<void>;
  removeCoupon: (id: string) => Promise<void>;
  banners: Banner[];
  addBanner: (banner: Banner) => Promise<void>;
  updateBanner: (banner: Banner) => Promise<void>;
  removeBanner: (id: string) => Promise<void>;
  partnerBrands: PartnerBrand[];
  addPartnerBrand: (brand: PartnerBrand) => Promise<void>;
  updatePartnerBrand: (brand: PartnerBrand) => Promise<void>;
  removePartnerBrand: (id: string) => Promise<void>;
  registerNewUser: (user: User) => Promise<void>;
  updateAnyUser: (user: User) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  productRequests: ProductRequest[];
  addProductRequest: (req: ProductRequest) => Promise<void>;
  materialRequests: MaterialRequest[];
  addMaterialRequest: (req: MaterialRequest) => Promise<void>;
  updateMaterialRequestStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  reviews: Review[];
  addReview: (review: Review) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: 'approved' | 'pending') => Promise<void>;
  removeReview: (id: string) => Promise<void>;
  systemConfig: SystemConfig;
  updateSystemConfig: (config: SystemConfig) => void;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  isLoading: boolean;
  resetSystemData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const KEYS = {
  CART: 'mt_cart',
  WISHLIST: 'mt_wishlist',
  USER: 'mt_user',
  ADMIN: 'mt_admin',
  WORKER: 'mt_worker',
  PRODUCTS: 'mt_db_products',
  ORDERS: 'mt_db_orders',
  USERS: 'mt_db_users',
  FABRICS: 'mt_db_fabrics',
  COUPONS: 'mt_db_coupons',
  BANNERS: 'mt_db_banners',
  PARTNERS: 'mt_db_partners',
  REQUESTS: 'mt_db_requests',
  REVIEWS: 'mt_db_reviews',
  CATEGORIES: 'mt_db_categories',
  MATERIALS: 'mt_db_materials',
  SYSTEM_CONFIG: 'mt_system_config',
  NOTIFICATIONS: 'mt_notifications'
};

const DEFAULT_ADMIN: User = {
  id: 'admin-001', name: 'Mehedi Admin', email: 'admin@meheditailors.com', phone: '+8801720267213', address: 'Dhonaid, Ashulia', measurements: [], role: 'admin', password: 'admin123'
};

const DEFAULT_WORKER: User = {
  id: 'worker-001', name: 'Kabir Artisan', email: 'worker@meheditailors.com', phone: '+8801711122233', address: 'Staff Quarters, Savar', measurements: [], role: 'worker', specialization: 'Master Stitcher', password: 'worker123'
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getStored = (key: string, fallback: any) => {
    const item = localStorage.getItem(key);
    try {
      const parsed = item ? JSON.parse(item) : null;
      if (Array.isArray(fallback) && (!parsed || !Array.isArray(parsed))) return fallback;
      return parsed || fallback;
    } catch { return fallback; }
  };

  const [cart, setCart] = useState<CartItem[]>(() => getStored(KEYS.CART, []));
  const [user, setUser] = useState<User | null>(() => getStored(KEYS.USER, null));
  const [adminUser, setAdminUser] = useState<User | null>(() => getStored(KEYS.ADMIN, null));
  const [workerUser, setWorkerUser] = useState<User | null>(() => getStored(KEYS.WORKER, null));
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const stored = getStored(KEYS.USERS, []);
    if (stored.length === 0) return [DEFAULT_ADMIN, DEFAULT_WORKER];
    return stored;
  });
  const [wishlist, setWishlist] = useState<string[]>(() => getStored(KEYS.WISHLIST, []));
  const [notifications, setNotifications] = useState<Notification[]>(() => getStored(KEYS.NOTIFICATIONS, []));
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => getStored(KEYS.SYSTEM_CONFIG, {
    smtpHost: 'smtp.gmail.com', smtpPort: 465, smtpUser: '', smtpPass: '', secure: true, senderName: 'Mehedi Tailors', senderEmail: 'orders@meheditailors.com', isEnabled: true, siteName: 'Mehedi Tailors & Fabrics'
  }));

  const [orders, setOrders] = useState<Order[]>(() => getStored(KEYS.ORDERS, []));
  const [products, setProducts] = useState<Product[]>(() => getStored(KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [fabrics, setFabrics] = useState<Fabric[]>(() => getStored(KEYS.FABRICS, []));
  const [categories, setCategories] = useState<string[]>(() => getStored(KEYS.CATEGORIES, ['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring']));
  const [coupons, setCoupons] = useState<Coupon[]>(() => getStored(KEYS.COUPONS, []));
  const [banners, setBanners] = useState<Banner[]>(() => getStored(KEYS.BANNERS, []));
  const [partnerBrands, setPartnerBrands] = useState<PartnerBrand[]>(() => getStored(KEYS.PARTNERS, []));
  const [productRequests, setProductRequests] = useState<ProductRequest[]>(() => getStored(KEYS.REQUESTS, []));
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(() => getStored(KEYS.MATERIALS, []));
  const [reviews, setReviews] = useState<Review[]>(() => getStored(KEYS.REVIEWS, []));

  useEffect(() => {
    const sync = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
    sync(KEYS.CART, cart);
    sync(KEYS.WISHLIST, wishlist);
    sync(KEYS.PRODUCTS, products);
    sync(KEYS.ORDERS, orders);
    sync(KEYS.USERS, allUsers);
    sync(KEYS.FABRICS, fabrics);
    sync(KEYS.COUPONS, coupons);
    sync(KEYS.BANNERS, banners);
    sync(KEYS.PARTNERS, partnerBrands);
    sync(KEYS.REQUESTS, productRequests);
    sync(KEYS.MATERIALS, materialRequests);
    sync(KEYS.REVIEWS, reviews);
    sync(KEYS.CATEGORIES, categories);
    sync(KEYS.SYSTEM_CONFIG, systemConfig);
    sync(KEYS.NOTIFICATIONS, notifications);
    if (user) sync(KEYS.USER, user); else localStorage.removeItem(KEYS.USER);
    if (adminUser) sync(KEYS.ADMIN, adminUser); else localStorage.removeItem(KEYS.ADMIN);
    if (workerUser) sync(KEYS.WORKER, workerUser); else localStorage.removeItem(KEYS.WORKER);
  }, [cart, wishlist, products, orders, allUsers, fabrics, coupons, banners, partnerBrands, productRequests, materialRequests, reviews, categories, systemConfig, notifications, user, adminUser, workerUser]);

  const addNotification = (n: Notification) => setNotifications(prev => [n, ...prev]);

  const sendAtelierEmail = (to: string, subject: string, body: string) => {
    console.log(`%c[Atelier SMTP Bridge] Dispatching to ${to}\nSubject: ${subject}\nBody: ${body}`, "color: #d97706; font-weight: bold; background: #fffbeb; padding: 10px; border: 1px solid #fde68a; border-radius: 5px;");
  };

  const notifyUser = (orderId: string, email: string, title: string, message: string) => {
    const targetUser = allUsers.find(u => u.email === email);
    if (targetUser) {
      addNotification({
        id: 'notif-' + Date.now() + Math.random(),
        userId: targetUser.id,
        title,
        message,
        date: new Date().toISOString(),
        isRead: false,
        type: 'order_update',
        link: `/invoice/${orderId}`
      });
      if (systemConfig.isEnabled) {
        sendAtelierEmail(email, `Mehedi Tailors: ${title}`, `Order #${orderId}: ${message}. Visit your dashboard to view the full invoice.`);
      }
    }
  };

  const placeOrder = async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setCart([]);
    notifyUser(order.id, order.customerEmail!, 'Order Successfully Received', `Your bespoke journey has begun. Our artisans are reviewing your requirements.`);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId);
      if (order) notifyUser(orderId, order.customerEmail!, 'Order Status Update', `Your order is now marked as ${status}.`);
      return prev.map(o => o.id === orderId ? { ...o, status } : o);
    });
  };

  const updateProductionStep = async (orderId: string, productionStep: ProductionStep) => {
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId);
      if (order) notifyUser(orderId, order.customerEmail!, 'Production Milestone', `Great news! Your garment has moved to the ${productionStep} phase.`);
      return prev.map(o => o.id === orderId ? { ...o, productionStep } : o);
    });
  };

  const assignWorker = async (orderId: string, assignedWorkerId: string) => {
    setOrders(prev => {
      const worker = allUsers.find(u => u.id === assignedWorkerId);
      const order = prev.find(o => o.id === orderId);
      if (order && worker) notifyUser(orderId, order.customerEmail!, 'Master Artisan Assigned', `Your order is now being crafted by ${worker.name}.`);
      return prev.map(o => o.id === orderId ? { ...o, assignedWorkerId, status: 'In Progress' } : o);
    });
  };

  const resetSystemData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring']);
    setFabrics([]); setReviews([]); setOrders([]); setMaterialRequests([]); setNotifications([]);
    setAllUsers([DEFAULT_ADMIN, DEFAULT_WORKER]);
    setAdminUser(null); setWorkerUser(null); setUser(null); setPartnerBrands([]);
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const exists = prev.find(i => i.productId === item.productId && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor && !i.isCustomOrder && !item.isCustomOrder);
      if (exists) return prev.map(i => i.id === exists.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      return [...prev, item];
    });
  };

  const removeFromCart = (itemId: string) => setCart(prev => prev.filter(i => i.id !== itemId));
  const updateQuantity = (itemId: string, qty: number) => setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, qty) } : i));
  const toggleWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const updateOrder = async (order: Order) => setOrders(prev => prev.map(o => o.id === order.id ? order : o));
  const removeOrder = async (id: string) => setOrders(prev => prev.filter(o => o.id !== id));
  const addProduct = async (product: Product) => setProducts(prev => [product, ...prev]);
  const updateProduct = async (product: Product) => setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  const removeProduct = async (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  
  const addPartnerBrand = async (brand: PartnerBrand) => setPartnerBrands(prev => [...prev, brand]);
  const updatePartnerBrand = async (brand: PartnerBrand) => setPartnerBrands(prev => prev.map(b => b.id === brand.id ? brand : b));
  const removePartnerBrand = async (id: string) => setPartnerBrands(prev => prev.filter(b => b.id !== id));

  const registerNewUser = async (u: User) => setAllUsers(prev => [...prev, u]);
  const updateAnyUser = async (u: User) => { 
    setAllUsers(prev => prev.map(x => x.id === u.id ? u : x)); 
    if (user?.id === u.id) setUser(u);
    if (adminUser?.id === u.id) setAdminUser(u);
    if (workerUser?.id === u.id) setWorkerUser(u);
  };
  const removeUser = async (id: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== id));
    if (user?.id === id) setUser(null);
  };
  const addFabric = async (f: Fabric) => setFabrics(prev => [...prev, f]);
  const removeFabric = async (id: string) => setFabrics(prev => prev.filter(f => f.id !== id));
  const addCategory = (cat: string) => setCategories(prev => [...prev, cat]);
  const removeCategory = (cat: string) => setCategories(prev => prev.filter(c => c !== cat));
  const addCoupon = async (c: Coupon) => setCoupons(prev => [...prev, c]);
  const updateCoupon = async (c: Coupon) => setCoupons(prev => prev.map(curr => curr.id === c.id ? c : curr));
  const removeCoupon = async (id: string) => setCoupons(prev => prev.filter(c => c.id !== id));
  const addBanner = async (b: Banner) => setBanners(prev => [...prev, b]);
  const updateBanner = async (b: Banner) => setBanners(prev => prev.map(curr => curr.id === b.id ? b : curr));
  const removeBanner = async (id: string) => setBanners(prev => prev.filter(b => b.id !== id));
  const addProductRequest = async (req: ProductRequest) => setProductRequests(prev => [req, ...prev]);
  const addMaterialRequest = async (req: MaterialRequest) => setMaterialRequests(prev => [req, ...prev]);
  const updateMaterialRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    setMaterialRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };
  const addReview = async (review: Review) => setReviews(prev => [review, ...prev]);
  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'pending') => setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
  const removeReview = async (id: string) => setReviews(prev => prev.filter(r => r.id !== id));
  const updateSystemConfig = (config: SystemConfig) => setSystemConfig(config);
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const clearNotifications = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      user, setUser, adminUser, setAdminUser, workerUser, setWorkerUser,
      allUsers, wishlist, toggleWishlist,
      orders, placeOrder, updateOrder, updateOrderStatus, removeOrder, updateProductionStep, assignWorker,
      products, updateProduct, addProduct, removeProduct,
      fabrics, addFabric, removeFabric,
      categories, addCategory, removeCategory,
      coupons, addCoupon, removeCoupon, updateCoupon,
      banners, addBanner, removeBanner, updateBanner,
      partnerBrands, addPartnerBrand, updatePartnerBrand, removePartnerBrand,
      registerNewUser, updateAnyUser, removeUser,
      productRequests, addProductRequest,
      materialRequests, addMaterialRequest, updateMaterialRequestStatus,
      reviews, addReview, updateReviewStatus, removeReview,
      systemConfig, updateSystemConfig,
      notifications, addNotification, markNotificationRead, clearNotifications,
      isLoading: false, resetSystemData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
