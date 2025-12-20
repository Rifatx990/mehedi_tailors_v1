
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  CartItem, Product, User, Order, OrderStatus, Fabric, Coupon, 
  Banner, ProductionStep, SystemConfig, Notice, Offer, PartnerBrand, BespokeService, 
  Notification, GiftCard, DueRecord, EmailLog, MaterialRequest, ProductRequest, Review, UpcomingProduct
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
  registerNewUser: (user: User) => Promise<void>;
  updateAnyUser: (user: User, notify?: boolean) => Promise<void>;
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
  addBespokeService: (service: BespokeService) => Promise<void>;
  updateBespokeService: (service: BespokeService) => Promise<void>;
  removeBespokeService: (id: string) => Promise<void>;
  partnerBrands: PartnerBrand[];
  addPartnerBrand: (brand: PartnerBrand) => Promise<void>;
  updatePartnerBrand: (brand: PartnerBrand) => Promise<void>;
  removePartnerBrand: (id: string) => Promise<void>;
  upcomingProducts: UpcomingProduct[];
  addUpcomingProduct: (item: UpcomingProduct) => Promise<void>;
  updateUpcomingProduct: (item: UpcomingProduct) => Promise<void>;
  removeUpcomingProduct: (id: string) => Promise<void>;
  systemConfig: SystemConfig;
  updateSystemConfig: (config: SystemConfig) => Promise<void>;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  emailLogs: EmailLog[];
  isHydrated: boolean;
  syncToServer: () => Promise<void>;
  resetSystemData: () => void;
  roastMaliciousUser: (input: string) => Promise<void>;
  subscribeToNewsletter: (email: string) => Promise<void>;
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
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [partnerBrands, setPartnerBrands] = useState<PartnerBrand[]>([]);
  const [bespokeServices, setBespokeServices] = useState<BespokeService[]>([]);
  const [upcomingProducts, setUpcomingProducts] = useState<UpcomingProduct[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [dues, setDues] = useState<DueRecord[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    smtpHost: '', smtpPort: 465, smtpUser: '', smtpPass: '', secure: true, 
    senderName: 'Mehedi Tailors', senderEmail: '', isEnabled: false, 
    siteName: 'Mehedi Tailors & Fabrics', dbVersion: '15.0.0-POSTGRES', giftCardDenominations: [2000, 5000, 10000], giftCardsEnabled: true
  });

  const bootstrap = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        dbService.getUsers(),
        dbService.getProducts(),
        dbService.getOrders(),
        dbService.getConfig(),
        dbService.getBanners(),
        dbService.getFabrics(),
        dbService.getPartners(),
        dbService.getOffers(),
        dbService.getNotices(),
        dbService.getBespokeServices(),
        dbService.getGiftCards(),
        dbService.getDues(),
        dbService.getMaterialRequests(),
        dbService.getProductRequests(),
        dbService.getReviews(),
        dbService.getEmailLogs(),
        dbService.getCoupons()
      ]);

      const mapVal = (idx: number, fallback: any) => 
        results[idx].status === 'fulfilled' ? (results[idx] as any).value : fallback;

      setAllUsers(mapVal(0, []));
      setProducts(mapVal(1, INITIAL_PRODUCTS));
      setOrders(mapVal(2, []));
      setSystemConfig(mapVal(3, systemConfig));
      setBanners(mapVal(4, []));
      setFabrics(mapVal(5, []));
      setPartnerBrands(mapVal(6, []));
      setOffers(mapVal(7, []));
      setNotices(mapVal(8, []));
      setBespokeServices(mapVal(9, []));
      setGiftCards(mapVal(10, []));
      setDues(mapVal(11, []));
      setMaterialRequests(mapVal(12, []));
      setProductRequests(mapVal(13, []));
      setReviews(mapVal(14, []));
      setEmailLogs(mapVal(15, []));
      setCoupons(mapVal(16, []));

      const cats = Array.from(new Set(mapVal(1, INITIAL_PRODUCTS).map((p: any) => p.category)));
      setCategories(cats.length ? (cats as string[]) : ['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring']);
      
    } catch (err) {
      console.error("Relational Handshake Failure:", err);
    } finally {
      setIsHydrated(true);
    }
  }, [systemConfig]);

  useEffect(() => { bootstrap(); }, []);

  // --- ATOMIC DATABASE MUTATIONS ---
  const updateSystemConfig = async (config: SystemConfig) => { await dbService.updateConfig(config); setSystemConfig(config); };
  const addProduct = async (p: Product) => { const s = await dbService.saveProduct(p); setProducts(prev => [s, ...prev]); };
  const updateProduct = async (p: Product) => { await dbService.saveProduct(p); setProducts(prev => prev.map(c => c.id === p.id ? p : c)); };
  const removeProduct = async (id: string) => { await dbService.deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); };

  const placeOrder = async (order: Order) => { const s = await dbService.saveOrder(order); setOrders(prev => [s, ...prev]); setCart([]); };
  const updateOrder = async (order: Order) => { await dbService.saveOrder(order); setOrders(prev => prev.map(o => o.id === order.id ? order : o)); };
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const o = orders.find(x => x.id === id);
    if (o) await updateOrder({ ...o, status });
  };
  const updateProductionStep = async (id: string, productionStep: ProductionStep) => {
    const o = orders.find(x => x.id === id);
    if (o) await updateOrder({ ...o, productionStep });
  };
  const assignWorker = async (id: string, workerId: string) => {
    const o = orders.find(x => x.id === id);
    if (o) await updateOrder({ ...o, assignedWorkerId: workerId, status: o.status === 'Pending' ? 'In Progress' : o.status });
  };
  const removeOrder = async (id: string) => { await dbService.deleteOrder(id); setOrders(prev => prev.filter(o => o.id !== id)); };

  const addFabric = async (f: Fabric) => { const s = await dbService.saveFabric(f); setFabrics(prev => [s, ...prev]); };
  const removeFabric = async (id: string) => { await dbService.deleteFabric(id); setFabrics(prev => prev.filter(f => f.id !== id)); };

  const registerNewUser = async (u: User) => { const s = await dbService.saveUser(u); setAllUsers(prev => [...prev, s]); setUser(s); };
  const updateAnyUser = async (u: User) => { await dbService.saveUser(u); setAllUsers(prev => prev.map(x => x.id === u.id ? u : x)); if (user?.id === u.id) setUser(u); };
  const removeUser = async (id: string) => { await dbService.deleteUser(id); setAllUsers(prev => prev.filter(u => u.id !== id)); };

  const addNotice = async (n: Notice) => { const s = await dbService.saveNotice(n); setNotices(prev => [s, ...prev]); };
  const updateNotice = async (n: Notice) => { await dbService.saveNotice(n); setNotices(prev => prev.map(c => c.id === n.id ? n : c)); };
  const removeNotice = async (id: string) => { await dbService.deleteNotice(id); setNotices(prev => prev.filter(x => x.id !== id)); };

  const addOffer = async (o: Offer) => { const s = await dbService.saveOffer(o); setOffers(prev => [s, ...prev]); };
  const updateOffer = async (o: Offer) => { await dbService.saveOffer(o); setOffers(prev => prev.map(c => c.id === o.id ? o : c)); };
  const removeOffer = async (id: string) => { await dbService.deleteOffer(id); setOffers(prev => prev.filter(x => x.id !== id)); };

  // --- ATOMIC COUPON MUTATIONS ---
  /* Fix: Added missing addCoupon function */
  const addCoupon = async (c: Coupon) => { const s = await dbService.saveCoupon(c); setCoupons(prev => [s, ...prev]); };
  /* Fix: Added missing updateCoupon function */
  const updateCoupon = async (c: Coupon) => { await dbService.saveCoupon(c); setCoupons(prev => prev.map(curr => curr.id === c.id ? c : curr)); };
  /* Fix: Added missing removeCoupon function */
  const removeCoupon = async (id: string) => { await dbService.deleteCoupon(id); setCoupons(prev => prev.filter(c => c.id !== id)); };

  const addGiftCard = async (gc: GiftCard) => { const s = await dbService.saveGiftCard(gc); setGiftCards(prev => [s, ...prev]); };
  const updateGiftCard = async (gc: GiftCard) => { await dbService.saveGiftCard(gc); setGiftCards(prev => prev.map(c => c.id === gc.id ? gc : c)); };
  const removeGiftCard = async (id: string) => { await dbService.deleteGiftCard(id); setGiftCards(prev => prev.filter(x => x.id !== id)); };

  const addDue = async (d: DueRecord) => { const s = await dbService.saveDue(d); setDues(prev => [s, ...prev]); };
  const updateDue = async (d: DueRecord) => { await dbService.saveDue(d); setDues(prev => prev.map(c => c.id === d.id ? d : c)); };
  const removeDue = async (id: string) => { await dbService.deleteDue(id); setDues(prev => prev.filter(x => x.id !== id)); };

  const addBespokeService = async (s: BespokeService) => { const res = await dbService.saveBespokeService(s); setBespokeServices(prev => [res, ...prev]); };
  const updateBespokeService = async (s: BespokeService) => { await dbService.saveBespokeService(s); setBespokeServices(prev => prev.map(c => c.id === s.id ? s : c)); };
  const removeBespokeService = async (id: string) => { await dbService.deleteBespokeService(id); setBespokeServices(prev => prev.filter(x => x.id !== id)); };

  const addPartnerBrand = async (p: PartnerBrand) => { const s = await dbService.savePartner(p); setPartnerBrands(prev => [s, ...prev]); };
  const updatePartnerBrand = async (p: PartnerBrand) => { await dbService.savePartner(p); setPartnerBrands(prev => prev.map(c => c.id === p.id ? p : c)); };
  const removePartnerBrand = async (id: string) => { await dbService.deletePartner(id); setPartnerBrands(prev => prev.filter(x => x.id !== id)); };

  const addUpcomingProduct = async (p: UpcomingProduct) => { const s = await dbService.saveUpcomingProduct(p); setUpcomingProducts(prev => [s, ...prev]); };
  const updateUpcomingProduct = async (p: UpcomingProduct) => { await dbService.saveUpcomingProduct(p); setUpcomingProducts(prev => prev.map(c => c.id === p.id ? p : c)); };
  const removeUpcomingProduct = async (id: string) => { await dbService.deleteUpcomingProduct(id); setUpcomingProducts(prev => prev.filter(x => x.id !== id)); };

  const addBanner = async (b: Banner) => { const s = await dbService.saveBanner(b); setBanners(prev => [s, ...prev]); };
  const updateBanner = async (b: Banner) => { await dbService.saveBanner(b); setBanners(prev => prev.map(c => c.id === b.id ? b : c)); };
  const removeBanner = async (id: string) => { await dbService.deleteBanner(id); setBanners(prev => prev.filter(x => x.id !== id)); };

  const addReview = async (r: Review) => { const s = await dbService.saveReview(r); setReviews(prev => [s, ...prev]); };
  const updateReviewStatus = async (id: string, status: any) => {
    const r = reviews.find(x => x.id === id);
    if (r) await addReview({ ...r, status });
  };
  const removeReview = async (id: string) => { await dbService.deleteReview(id); setReviews(prev => prev.filter(x => x.id !== id)); };

  const addMaterialRequest = async (r: MaterialRequest) => { const s = await dbService.saveMaterialRequest(r); setMaterialRequests(prev => [s, ...prev]); };
  const updateMaterialRequestStatus = async (id: string, status: any) => {
    const r = materialRequests.find(x => x.id === id);
    if (r) await addMaterialRequest({ ...r, status });
  };

  const addProductRequest = async (r: ProductRequest) => { await dbService.saveProductRequest(r); setProductRequests(prev => [r, ...prev]); };

  return (
    <StoreContext.Provider value={{
      cart, addToCart: (i) => setCart(prev => [...prev, i]), 
      removeFromCart: (id) => setCart(prev => prev.filter(i => i.id !== id)), 
      updateQuantity: (id, q) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, q)} : i)),
      user, setUser, adminUser, setAdminUser, workerUser, setWorkerUser,
      allUsers, wishlist, toggleWishlist: (id) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]),
      orders, placeOrder, updateOrder, updateOrderStatus, updateProductionStep, assignWorker, removeOrder,
      products, updateProduct, addProduct, removeProduct,
      fabrics, addFabric, removeFabric,
      categories, addCategory: (c) => setCategories(prev => [...prev, c]), removeCategory: (c) => setCategories(prev => prev.filter(x => x !== c)),
      coupons, addCoupon, updateCoupon, removeCoupon,
      banners, addBanner, updateBanner, removeBanner,
      registerNewUser, updateAnyUser, removeUser,
      productRequests, addProductRequest,
      materialRequests, addMaterialRequest, updateMaterialRequestStatus,
      reviews, addReview, updateReviewStatus, removeReview,
      notices, addNotice, updateNotice, removeNotice,
      offers, addOffer, updateOffer, removeOffer,
      giftCards, addGiftCard, updateGiftCard, removeGiftCard,
      dues, addDue, updateDue, removeDue,
      bespokeServices, addBespokeService, updateBespokeService, removeBespokeService,
      partnerBrands, addPartnerBrand, updatePartnerBrand, removePartnerBrand,
      upcomingProducts, addUpcomingProduct, updateUpcomingProduct, removeUpcomingProduct,
      systemConfig, updateSystemConfig,
      notifications, markNotificationRead: async (id) => { await dbService.markNotificationRead(id); setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n)); },
      clearNotifications: () => setNotifications([]),
      emailLogs, isHydrated, syncToServer: async () => { console.info("Synchronizing Relational PostgreSQL Integrity..."); await bootstrap(); },
      resetSystemData: () => {}, roastMaliciousUser: async () => {}, subscribeToNewsletter: async () => {}
    }}>
      {isHydrated ? children : (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
           <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-center">
             <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.5em] animate-pulse">Relational Handshake...</p>
             <p className="text-slate-600 text-[8px] font-black uppercase tracking-widest mt-2">Connecting to PostgreSQL Core</p>
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
