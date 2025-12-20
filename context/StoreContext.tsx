
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  CartItem, Product, User, Order, OrderStatus, Fabric, Coupon, 
  ProductRequest, Banner, Review, ProductionStep, MaterialRequest, 
  SystemConfig, Notification, PartnerBrand, EmailLog 
} from '../types.ts';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants.tsx';
import { dbService } from '../services/DatabaseService.ts';

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
  emailLogs: EmailLog[];
  isHydrated: boolean;
  resetSystemData: () => void;
  exportDb: () => Promise<void>;
  importDb: (json: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Core State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [workerUser, setWorkerUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [categories, setCategories] = useState<string[]>(['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring']);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [partnerBrands, setPartnerBrands] = useState<PartnerBrand[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    smtpHost: 'smtp.gmail.com', smtpPort: 465, smtpUser: '', smtpPass: '', secure: true, 
    senderName: 'Mehedi Tailors', senderEmail: 'orders@meheditailors.com', isEnabled: true, siteName: 'Mehedi Tailors & Fabrics',
    dbVersion: '2.0.0-PRO'
  });

  // INITIAL HYDRATION
  useEffect(() => {
    const hydrate = async () => {
      await dbService.init();
      
      const [p, o, u, f, b, pt, r, req, m, c, e, n] = await Promise.all([
        dbService.getAll('products'),
        dbService.getAll('orders'),
        dbService.getAll('users'),
        dbService.getAll('fabrics'),
        dbService.getAll('banners'),
        dbService.getAll('partners'),
        dbService.getAll('reviews'),
        dbService.getAll('requests'),
        dbService.getAll('materials'),
        dbService.getAll('config'),
        dbService.getAll('emails'),
        dbService.getAll('notifications')
      ]);

      if (p.length > 0) setProducts(p);
      if (o.length > 0) setOrders(o);
      if (u.length > 0) setAllUsers(u); else {
        const defaults = [
          { id: 'admin-001', name: 'Mehedi Admin', email: 'admin@meheditailors.com', phone: '+8801720267213', address: 'Dhonaid, Ashulia', measurements: [], role: 'admin', password: 'admin123' },
          { id: 'worker-001', name: 'Kabir Artisan', email: 'worker@meheditailors.com', phone: '+8801711122233', address: 'Staff Quarters, Savar', measurements: [], role: 'worker', specialization: 'Master Stitcher', password: 'worker123' }
        ];
        setAllUsers(defaults);
        await dbService.save('users', defaults);
      }
      if (f.length > 0) setFabrics(f);
      if (b.length > 0) setBanners(b);
      if (pt.length > 0) setPartnerBrands(pt);
      if (r.length > 0) setReviews(r);
      if (req.length > 0) setProductRequests(req);
      if (m.length > 0) setMaterialRequests(m);
      if (e.length > 0) setEmailLogs(e);
      if (n.length > 0) setNotifications(n);
      
      const config = c.find(x => x.id === 'global');
      if (config) setSystemConfig(config);

      setIsHydrated(true);
    };
    hydrate();
  }, []);

  // AUTO-SYNC TO INDEXEDDB (Guarded by isImporting)
  useEffect(() => {
    if (!isHydrated || isImporting) return;
    dbService.save('products', products);
  }, [products, isHydrated, isImporting]);

  useEffect(() => {
    if (!isHydrated || isImporting) return;
    dbService.save('orders', orders);
  }, [orders, isHydrated, isImporting]);

  useEffect(() => {
    if (!isHydrated || isImporting) return;
    dbService.save('users', allUsers);
  }, [allUsers, isHydrated, isImporting]);

  useEffect(() => {
    if (!isHydrated || isImporting) return;
    dbService.save('emails', emailLogs);
  }, [emailLogs, isHydrated, isImporting]);

  useEffect(() => {
    if (!isHydrated || isImporting) return;
    dbService.save('config', [{ ...systemConfig, id: 'global' }]);
  }, [systemConfig, isHydrated, isImporting]);

  const exportDb = async () => {
    const data = await dbService.exportBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mehedi_atelier_db_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importDb = async (json: string) => {
    setIsImporting(true); // Lock auto-sync
    try {
      await dbService.importBackup(json);
      // Wait a moment for IndexedDB OS handles to settle
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      setIsImporting(false);
      alert("Import failed: " + (err as any).message);
    }
  };

  const resetSystemData = async () => {
    await dbService.clearAll();
    window.location.reload();
  };

  // Actions... (Remainder unchanged)
  const placeOrder = async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setCart([]);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const updateProductionStep = async (orderId: string, productionStep: ProductionStep) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, productionStep } : o));
  };

  const assignWorker = async (orderId: string, assignedWorkerId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, assignedWorkerId, status: 'In Progress' } : o));
  };

  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const removeFromCart = (itemId: string) => setCart(prev => prev.filter(i => i.id !== itemId));
  const updateQuantity = (itemId: string, qty: number) => setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
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
  };
  const removeUser = async (id: string) => setAllUsers(prev => prev.filter(u => u.id !== id));
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
  const updateMaterialRequestStatus = async (id: string, status: 'approved' | 'rejected') => setMaterialRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  const addReview = async (review: Review) => setReviews(prev => [review, ...prev]);
  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'pending') => setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
  const removeReview = async (id: string) => setReviews(prev => prev.filter(r => r.id !== id));
  const updateSystemConfig = (config: SystemConfig) => setSystemConfig(config);
  const addNotification = (notif: Notification) => setNotifications(prev => [notif, ...prev]);
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
      emailLogs, isHydrated, resetSystemData, exportDb, importDb
    }}>
      {isHydrated ? children : (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
           <div className="text-center">
              <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.6em] text-[10px] animate-pulse">Initializing Core DB</p>
           </div>
        </div>
      )}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
