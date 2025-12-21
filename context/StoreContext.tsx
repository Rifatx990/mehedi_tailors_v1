import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  CartItem, Product, User, Order, OrderStatus, Fabric, Coupon, 
  Banner, ProductionStep, SystemConfig, Notice, Offer, PartnerBrand, BespokeService, 
  Notification, GiftCard, DueRecord, MaterialRequest, ProductRequest, Review, UpcomingProduct, EmailLog
} from '../types.ts';
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
  removeOrder: (id: string) => Promise<void>;
  assignWorker: (orderId: string, workerId: string) => Promise<void>;
  products: Product[];
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  upcomingProducts: UpcomingProduct[];
  addUpcomingProduct: (p: UpcomingProduct) => Promise<void>;
  updateUpcomingProduct: (p: UpcomingProduct) => Promise<void>;
  removeUpcomingProduct: (id: string) => Promise<void>;
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
  notices: Notice[];
  addNotice: (notice: Notice) => Promise<void>;
  updateNotice: (notice: Notice) => Promise<void>;
  removeNotice: (id: string) => Promise<void>;
  offers: Offer[];
  addOffer: (offer: Offer) => Promise<void>;
  updateOffer: (offer: Offer) => Promise<void>;
  removeOffer: (id: string) => Promise<void>;
  giftCards: GiftCard[];
  addGiftCard: (gc: GiftCard) => Promise<void>;
  updateGiftCard: (gc: GiftCard) => Promise<void>;
  removeGiftCard: (id: string) => Promise<void>;
  dues: DueRecord[];
  addDue: (due: DueRecord) => Promise<void>;
  updateDue: (due: DueRecord) => Promise<void>;
  removeDue: (id: string) => Promise<void>;
  bespokeServices: BespokeService[];
  addBespokeService: (s: BespokeService) => Promise<void>;
  updateBespokeService: (s: BespokeService) => Promise<void>;
  removeBespokeService: (id: string) => Promise<void>;
  partnerBrands: PartnerBrand[];
  addPartnerBrand: (p: PartnerBrand) => Promise<void>;
  updatePartnerBrand: (p: PartnerBrand) => Promise<void>;
  removePartnerBrand: (id: string) => Promise<void>;
  systemConfig: SystemConfig;
  updateSystemConfig: (config: SystemConfig) => Promise<void>;
  productRequests: ProductRequest[];
  addProductRequest: (req: ProductRequest) => Promise<void>;
  materialRequests: MaterialRequest[];
  addMaterialRequest: (req: MaterialRequest) => Promise<void>;
  updateMaterialRequestStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  reviews: Review[];
  addReview: (rev: Review) => Promise<void>;
  updateReviewStatus: (id: string, status: 'approved' | 'pending') => Promise<void>;
  removeReview: (id: string) => Promise<void>;
  emailLogs: EmailLog[];
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  isHydrated: boolean;
  syncToServer: () => Promise<void>;
  registerNewUser: (user: User) => Promise<void>;
  updateAnyUser: (user: User, silent?: boolean) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  subscribeToNewsletter: (email: string) => Promise<void>;
  roastMaliciousUser: (input: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [workerUser, setWorkerUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [upcomingProducts, setUpcomingProducts] = useState<UpcomingProduct[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [dues, setDues] = useState<DueRecord[]>([]);
  const [bespokeServices, setBespokeServices] = useState<BespokeService[]>([]);
  const [partnerBrands, setPartnerBrands] = useState<PartnerBrand[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    smtpHost: '', smtpPort: 465, smtpUser: '', smtpPass: '', secure: true, 
    senderName: 'Mehedi Tailors', senderEmail: '', isEnabled: false, 
    siteName: 'Mehedi Tailors & Fabrics', dbVersion: 'REST-SQL-13.0', giftCardDenominations: [2000, 5000, 10000], giftCardsEnabled: true
  });

  const mapDbToCamel = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(mapDbToCamel);
    const newObj: any = {};
    for (let key in obj) {
      const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
      newObj[camelKey] = (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) 
        ? mapDbToCamel(obj[key]) 
        : obj[key];
    }
    return newObj;
  };

  const createNotification = useCallback((userId: string, title: string, message: string, type: any = 'general') => {
    const newNotif: Notification = {
      id: 'N' + Date.now(),
      userId,
      title,
      message,
      date: new Date().toISOString(),
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const sendAutomatedEmail = async (to: string, subject: string, body: string) => {
    const log: Partial<EmailLog> = {
      id: 'ML' + Date.now(),
      to,
      subject,
      body: `[DOCUMENT HEADER: ${systemConfig.siteLogo}]\n\n${body}`,
      timestamp: new Date().toISOString(),
      status: 'sent',
      templateId: 'automated_status_update'
    };
    try {
      const s = await dbService.request('/emails', { method: 'POST', body: JSON.stringify(log) });
      setEmailLogs(prev => [mapDbToCamel(s), ...prev]);
    } catch (e) {
      console.error("Failed to log automated artisan email:", e);
    }
  };

  const bootstrap = useCallback(async () => {
    try {
      const [users, prods, upcs, ords, conf, bans, nats, offs, coups, gcs, ds, svcs, pats, preqs, mreqs, revs, fabs, emails] = await Promise.all([
        dbService.getUsers(), dbService.getProducts(), dbService.getUpcoming(), dbService.getOrders(),
        dbService.getConfig(), dbService.getBanners(), dbService.getNotices(),
        dbService.getOffers(), dbService.getCoupons(), dbService.getGiftCards(),
        dbService.getDues(), dbService.getBespokeServices(), dbService.getPartners(),
        dbService.getProductRequests(), dbService.getMaterialRequests(), dbService.getReviews(),
        dbService.getFabrics(), dbService.getEmails()
      ]);

      setAllUsers(mapDbToCamel(users));
      setProducts(mapDbToCamel(prods));
      setUpcomingProducts(mapDbToCamel(upcs));
      setOrders(mapDbToCamel(ords));
      if (conf) setSystemConfig(mapDbToCamel(conf));
      setBanners(mapDbToCamel(bans));
      setNotices(mapDbToCamel(nats));
      setOffers(mapDbToCamel(offs));
      setCoupons(mapDbToCamel(coups));
      setGiftCards(mapDbToCamel(gcs));
      setDues(mapDbToCamel(ds));
      setBespokeServices(mapDbToCamel(svcs));
      setPartnerBrands(mapDbToCamel(pats));
      setProductRequests(mapDbToCamel(preqs));
      setMaterialRequests(mapDbToCamel(mreqs));
      setReviews(mapDbToCamel(revs));
      setFabrics(mapDbToCamel(fabs));
      setEmailLogs(mapDbToCamel(emails));
      
      const cats = Array.from(new Set(prods.map((p: any) => p.category)));
      setCategories(cats.length ? (cats as string[]) : ['Men', 'Women', 'Fabrics', 'Custom Tailoring']);
      
      const storedUserId = localStorage.getItem('mt_user_id');
      if (storedUserId) {
        const fullUser = mapDbToCamel(users).find((u: any) => u.id === storedUserId);
        if (fullUser) {
           if (fullUser.role === 'admin') setAdminUser(fullUser);
           else if (fullUser.role === 'worker') setWorkerUser(fullUser);
           else setUser(fullUser);
        }
      }

      setIsHydrated(true);
    } catch (err) {
      console.error("Central Ledger Connection Failed:", err);
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  const updateSystemConfig = async (config: SystemConfig) => { const s = await dbService.updateConfig(config); setSystemConfig(mapDbToCamel(s)); };
  const addProduct = async (p: Product) => { const s = await dbService.saveProduct({...p, _isNew: true}); setProducts(prev => [mapDbToCamel(s), ...prev]); };
  const updateProduct = async (p: Product) => { const s = await dbService.saveProduct(p); setProducts(prev => prev.map(c => c.id === p.id ? mapDbToCamel(s) : c)); };
  const removeProduct = async (id: string) => { await dbService.deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); };
  const addUpcomingProduct = async (p: UpcomingProduct) => { const s = await dbService.saveUpcoming({...p, _isNew: true}); setUpcomingProducts(prev => [mapDbToCamel(s), ...prev]); };
  const updateUpcomingProduct = async (p: UpcomingProduct) => { const s = await dbService.saveUpcoming(p); setUpcomingProducts(prev => prev.map(c => c.id === p.id ? mapDbToCamel(s) : c)); };
  const removeUpcomingProduct = async (id: string) => { await dbService.deleteUpcoming(id); setUpcomingProducts(prev => prev.filter(p => p.id !== id)); };

  const placeOrder = async (order: Order) => { 
    const s = await dbService.saveOrder({...order, _isNew: true}); 
    const savedOrder = mapDbToCamel(s);
    setOrders(prev => [savedOrder, ...prev]); 
    setCart([]); 
    
    const targetUser = allUsers.find(u => u.email === order.customerEmail);
    if (targetUser) {
        createNotification(targetUser.id, 'Artisan Handshake Success', `Your order #${order.id} has been logged in the world archive.`, 'order_update');
        sendAutomatedEmail(order.customerEmail!, `Order Confirmation: #${order.id}`, `Salam ${order.customerName}, your artisan commission has been established. Our masters are now preparing your chosen materials.`);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => { 
    await dbService.saveOrder({ id, status }); 
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o)); 
    
    const order = orders.find(o => o.id === id);
    if (order && order.customerEmail) {
        const targetUser = allUsers.find(u => u.email === order.customerEmail);
        if (targetUser) {
            createNotification(targetUser.id, 'Status Broadcast', `Your commission #${id} is now ${status}.`, 'order_update');
            sendAutomatedEmail(order.customerEmail, `Status Update: #${id}`, `Greetings. Your commission status has shifted to: ${status}. Tracking is available on your dashboard.`);
        }
    }
  };

  const updateProductionStep = async (id: string, productionStep: ProductionStep) => { 
    await dbService.saveOrder({ id, productionStep }); 
    setOrders(prev => prev.map(o => o.id === id ? { ...o, productionStep } : o)); 
    
    const order = orders.find(o => o.id === id);
    if (order && productionStep === 'Ready' && order.customerEmail) {
       sendAutomatedEmail(order.customerEmail, `Garment Ready: #${id}`, `Excellent news. Your bespoke garment has passed quality control and is now ready for dispatch.`);
    }
  };

  const registerNewUser = async (u: User) => { const s = await dbService.saveUser({...u, _isNew: true}); setAllUsers(prev => [...prev, mapDbToCamel(s)]); };
  const updateAnyUser = async (u: User) => { const s = await dbService.saveUser(u); setAllUsers(prev => prev.map(x => x.id === u.id ? mapDbToCamel(s) : x)); if (user?.id === u.id) setUser(mapDbToCamel(s)); };
  const removeUser = async (id: string) => { await dbService.deleteUser(id); setAllUsers(prev => prev.filter(u => u.id !== id)); };

  const roastMaliciousUser = async (input: string) => { /* UI Visual Roast */ };
  const subscribeToNewsletter = async (email: string) => { /* Subscription logic */ };

  return (
    <StoreContext.Provider value={{
      cart, addToCart: (i) => setCart(prev => [...prev, i]), 
      removeFromCart: (id) => setCart(prev => prev.filter(i => i.id !== id)), 
      updateQuantity: (id, q) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, q)} : i)),
      user, setUser: (u) => { setUser(u); u ? localStorage.setItem('mt_user_id', u.id) : localStorage.removeItem('mt_user_id'); },
      adminUser, setAdminUser: (u) => { setAdminUser(u); u ? localStorage.setItem('mt_user_id', u.id) : localStorage.removeItem('mt_user_id'); },
      workerUser, setWorkerUser: (u) => { setWorkerUser(u); u ? localStorage.setItem('mt_user_id', u.id) : localStorage.removeItem('mt_user_id'); },
      allUsers, wishlist, toggleWishlist: (id) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]),
      orders, placeOrder, updateOrder: async (o) => { const s = await dbService.saveOrder(o); setOrders(prev => prev.map(curr => curr.id === o.id ? mapDbToCamel(s) : curr)); },
      updateOrderStatus, updateProductionStep, removeOrder: async (id) => { await dbService.deleteOrder(id); setOrders(prev => prev.filter(o => o.id !== id)); }, 
      assignWorker: async (id, workerId) => { await dbService.saveOrder({ id, assignedWorkerId: workerId }); setOrders(prev => prev.map(o => o.id === id ? { ...o, assignedWorkerId: workerId } : o)); },
      products, updateProduct, addProduct, removeProduct,
      upcomingProducts, addUpcomingProduct, updateUpcomingProduct, removeUpcomingProduct,
      fabrics, addFabric: async (f) => { const s = await dbService.saveFabric({...f, _isNew: true}); setFabrics(prev => [...prev, mapDbToCamel(s)]); }, 
      removeFabric: async (id) => { await dbService.deleteFabric(id); setFabrics(prev => prev.filter(f => f.id !== id)); },
      categories, addCategory: (c) => setCategories(prev => [...prev, c]), removeCategory: (c) => setCategories(prev => prev.filter(x => x !== c)),
      coupons, addCoupon: async (c) => { const s = await dbService.saveCoupon({...c, _isNew: true}); setCoupons(prev => [mapDbToCamel(s), ...prev]); },
      updateCoupon: async (c) => { const s = await dbService.saveCoupon(c); setCoupons(prev => prev.map(curr => curr.id === c.id ? mapDbToCamel(s) : curr)); },
      removeCoupon: async (id) => { await dbService.deleteCoupon(id); setCoupons(prev => prev.filter(c => c.id !== id)); },
      banners, addBanner: async (b) => { const s = await dbService.saveBanner({...b, _isNew: true}); setBanners(prev => [mapDbToCamel(s), ...prev]); }, 
      updateBanner: async (b) => { const s = await dbService.saveBanner(b); setBanners(prev => prev.map(c => c.id === b.id ? mapDbToCamel(s) : c)); }, 
      removeBanner: async (id) => { await dbService.deleteBanner(id); setBanners(prev => prev.filter(x => x.id !== id)); },
      notices, addNotice: async (n) => { const s = await dbService.saveNotice({...n, _isNew: true}); setNotices(prev => [mapDbToCamel(s), ...prev]); }, 
      updateNotice: async (n) => { const s = await dbService.saveNotice(n); setNotices(prev => prev.map(c => c.id === n.id ? mapDbToCamel(s) : c)); },
      removeNotice: async (id) => { await dbService.deleteNotice(id); setNotices(prev => prev.filter(x => x.id !== id)); },
      offers, addOffer: async (o) => { const s = await dbService.saveOffer({...o, _isNew: true}); setOffers(prev => [mapDbToCamel(s), ...prev]); }, 
      updateOffer: async (o) => { const s = await dbService.saveOffer(o); setOffers(prev => prev.map(c => c.id === o.id ? mapDbToCamel(s) : c)); },
      removeOffer: async (id) => { await dbService.deleteOffer(id); setOffers(prev => prev.filter(x => x.id !== id)); },
      giftCards, addGiftCard: async (gc) => { const s = await dbService.saveGiftCard({...gc, _isNew: true}); setGiftCards(prev => [mapDbToCamel(s), ...prev]); },
      updateGiftCard: async (gc) => { const s = await dbService.saveGiftCard(gc); setGiftCards(prev => prev.map(c => c.id === gc.id ? mapDbToCamel(s) : c)); },
      removeGiftCard: async (id) => { await dbService.deleteGiftCard(id); setGiftCards(prev => prev.filter(x => x.id !== id)); },
      dues, addDue: async (d) => { const s = await dbService.saveDue({...d, _isNew: true}); setDues(prev => [mapDbToCamel(s), ...prev]); }, 
      updateDue: async (d) => { const s = await dbService.saveDue(d); setDues(prev => prev.map(c => c.id === d.id ? mapDbToCamel(s) : c)); },
      removeDue: async (id) => { await dbService.deleteDue(id); setDues(prev => prev.filter(x => x.id !== id)); },
      bespokeServices, addBespokeService: async (s) => { const res = await dbService.saveBespokeService({...s, _isNew: true}); setBespokeServices(prev => [mapDbToCamel(res), ...prev]); },
      updateBespokeService: async (s) => { const res = await dbService.saveBespokeService(s); setBespokeServices(prev => prev.map(c => c.id === s.id ? mapDbToCamel(res) : c)); },
      removeBespokeService: async (id) => { await dbService.deleteBespokeService(id); setBespokeServices(prev => prev.filter(x => x.id !== id)); },
      partnerBrands, addPartnerBrand: async (p) => { const s = await dbService.savePartner({...p, _isNew: true}); setPartnerBrands(prev => [mapDbToCamel(s), ...prev]); },
      updatePartnerBrand: async (p) => { const s = await dbService.savePartner(p); setPartnerBrands(prev => prev.map(c => c.id === p.id ? mapDbToCamel(s) : c)); },
      removePartnerBrand: async (id) => { await dbService.deletePartner(id); setPartnerBrands(prev => prev.filter(x => x.id !== id)); },
      systemConfig, updateSystemConfig,
      productRequests, addProductRequest: async (r) => { const s = await dbService.saveProductRequest(r); setProductRequests(prev => [mapDbToCamel(s), ...prev]); },
      materialRequests, addMaterialRequest: async (r) => { const s = await dbService.saveMaterialRequest({...r, _isNew: true}); setMaterialRequests(prev => [mapDbToCamel(s), ...prev]); }, 
      updateMaterialRequestStatus: async (id, status) => { const s = await dbService.saveMaterialRequest({id, status}); setMaterialRequests(prev => prev.map(r => r.id === id ? mapDbToCamel(s) : r)); },
      reviews, addReview: async (r) => { const s = await dbService.saveReview({...r, _isNew: true}); setReviews(prev => [mapDbToCamel(s), ...prev]); }, 
      updateReviewStatus: async (id, status) => { const s = await dbService.saveReview({id, status}); setReviews(prev => prev.map(r => r.id === id ? mapDbToCamel(s) : r)); },
      removeReview: async (id) => { await dbService.deleteReview(id); setReviews(prev => prev.filter(x => x.id !== id)); },
      emailLogs, notifications, 
      markNotificationRead: (id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n)),
      clearNotifications: () => setNotifications([]),
      isHydrated, syncToServer: async () => { await bootstrap(); },
      registerNewUser, updateAnyUser, removeUser,
      subscribeToNewsletter, roastMaliciousUser
    }}>
      {isHydrated ? children : (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
           <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.5em] animate-pulse">Synchronizing Authoritative Ledger...</p>
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