
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  CartItem, Product, User, Order, OrderStatus, Fabric, Coupon, 
  ProductRequest, Banner, Review, ProductionStep, MaterialRequest, 
  SystemConfig, Notification, PartnerBrand, EmailLog, DueRecord, BespokeService, UpcomingProduct, GiftCard,
  Offer, Notice, NewsletterSubscriber
} from '../types.ts';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants.tsx';
import { dbService, GlobalState } from '../services/DatabaseService.ts';

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
  upcomingProducts: UpcomingProduct[];
  addUpcomingProduct: (p: UpcomingProduct) => Promise<void>;
  updateUpcomingProduct: (p: UpcomingProduct) => Promise<void>;
  removeUpcomingProduct: (id: string) => Promise<void>;
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
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [upcomingProducts, setUpcomingProducts] = useState<UpcomingProduct[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [dues, setDues] = useState<DueRecord[]>([]);
  const [bespokeServices, setBespokeServices] = useState<BespokeService[]>([]);
  const [partnerBrands, setPartnerBrands] = useState<PartnerBrand[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    smtpHost: 'smtp.gmail.com', smtpPort: 465, smtpUser: '', smtpPass: '', secure: true, 
    senderName: 'Mehedi Tailors', senderEmail: 'orders@meheditailors.com', isEnabled: true, 
    siteName: 'Mehedi Tailors & Fabrics', dbVersion: '12.0.0-WORLD-SYNC', giftCardDenominations: [2000, 5000, 10000], giftCardsEnabled: true
  });

  const getFullState = useCallback((): GlobalState => {
    return {
      users: allUsers, products, categories, config: systemConfig, coupons, notices, 
      offers, orders, banners, fabrics, requests: productRequests, 
      materials: materialRequests, reviews, giftCards, dues, bespokeServices, 
      upcomingProducts, subscribers, partners: partnerBrands, notifications, emails: emailLogs
    };
  }, [allUsers, products, categories, systemConfig, coupons, notices, offers, orders, banners, fabrics, productRequests, materialRequests, reviews, giftCards, dues, bespokeServices, upcomingProducts, subscribers, partnerBrands, notifications, emailLogs]);

  const commitGlobalSync = useCallback(async (overrides?: Partial<GlobalState>) => {
    const data = { ...getFullState(), ...overrides };
    await dbService.writeFile(data);
  }, [getFullState]);

  useEffect(() => {
    const hydrate = async () => {
      const db = await dbService.readFile();
      if (db) {
        setAllUsers(db.users || []);
        setProducts(db.products || INITIAL_PRODUCTS);
        setCategories(db.categories || []);
        setSystemConfig(db.config || systemConfig);
        setCoupons(db.coupons || []);
        setNotices(db.notices || []);
        setOffers(db.offers || []);
        setOrders(db.orders || []);
        setBanners(db.banners || []);
        setFabrics(db.fabrics || []);
        setProductRequests(db.requests || []);
        setMaterialRequests(db.materials || []);
        setReviews(db.reviews || []);
        setGiftCards(db.giftCards || []);
        setDues(db.dues || []);
        setBespokeServices(db.bespokeServices || []);
        setUpcomingProducts(db.upcomingProducts || []);
        setSubscribers(db.subscribers || []);
        setPartnerBrands(db.partners || []);
        setNotifications(db.notifications || []);
        setEmailLogs(db.emails || []);
      } else {
        setProducts(INITIAL_PRODUCTS);
        setCategories(['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring']);
      }
      setIsHydrated(true);
    };
    hydrate();
  }, []);

  // CRUD WRAPPERS
  const updateSystemConfig = async (config: SystemConfig) => { setSystemConfig(config); await commitGlobalSync({ config }); };
  const addCategory = (cat: string) => { const updated = [...categories, cat]; setCategories(updated); commitGlobalSync({ categories: updated }); };
  const removeCategory = (cat: string) => { const updated = categories.filter(c => c !== cat); setCategories(updated); commitGlobalSync({ categories: updated }); };
  
  const registerNewUser = async (u: User) => { const updated = [...allUsers, u]; setAllUsers(updated); await commitGlobalSync({ users: updated }); };
  const updateAnyUser = async (u: User) => { const updated = allUsers.map(x => x.id === u.id ? u : x); setAllUsers(updated); await commitGlobalSync({ users: updated }); };
  const removeUser = async (id: string) => { const updated = allUsers.filter(u => u.id !== id); setAllUsers(updated); await commitGlobalSync({ users: updated }); };

  const addProduct = async (p: Product) => { const updated = [p, ...products]; setProducts(updated); await commitGlobalSync({ products: updated }); };
  const updateProduct = async (p: Product) => { const updated = products.map(curr => curr.id === p.id ? p : curr); setProducts(updated); await commitGlobalSync({ products: updated }); };
  const removeProduct = async (id: string) => { const updated = products.filter(p => p.id !== id); setProducts(updated); await commitGlobalSync({ products: updated }); };

  const addFabric = async (f: Fabric) => { const updated = [...fabrics, f]; setFabrics(updated); await commitGlobalSync({ fabrics: updated }); };
  const removeFabric = async (id: string) => { const updated = fabrics.filter(f => f.id !== id); setFabrics(updated); await commitGlobalSync({ fabrics: updated }); };

  const placeOrder = async (order: Order) => { const updated = [order, ...orders]; setOrders(updated); setCart([]); await commitGlobalSync({ orders: updated }); };
  const updateOrder = async (order: Order) => { const updated = orders.map(o => o.id === order.id ? order : o); setOrders(updated); await commitGlobalSync({ orders: updated }); };
  const updateOrderStatus = async (id: string, status: OrderStatus) => { const updated = orders.map(o => o.id === id ? { ...o, status } : o); setOrders(updated); await commitGlobalSync({ orders: updated }); };
  const updateProductionStep = async (id: string, step: ProductionStep) => { const updated = orders.map(o => o.id === id ? { ...o, productionStep: step } : o); setOrders(updated); await commitGlobalSync({ orders: updated }); };
  const assignWorker = async (id: string, workerId: string) => { const updated = orders.map(o => o.id === id ? { ...o, assignedWorkerId: workerId } : o); setOrders(updated); await commitGlobalSync({ orders: updated }); };
  const removeOrder = async (id: string) => { const updated = orders.filter(o => o.id !== id); setOrders(updated); await commitGlobalSync({ orders: updated }); };

  const addCoupon = async (c: Coupon) => { const updated = [...coupons, c]; setCoupons(updated); await commitGlobalSync({ coupons: updated }); };
  const updateCoupon = async (c: Coupon) => { const updated = coupons.map(curr => curr.id === c.id ? c : curr); setCoupons(updated); await commitGlobalSync({ coupons: updated }); };
  const removeCoupon = async (id: string) => { const updated = coupons.filter(c => c.id !== id); setCoupons(updated); await commitGlobalSync({ coupons: updated }); };

  const addBanner = async (b: Banner) => { const updated = [...banners, b]; setBanners(updated); await commitGlobalSync({ banners: updated }); };
  const updateBanner = async (b: Banner) => { const updated = banners.map(curr => curr.id === b.id ? b : curr); setBanners(updated); await commitGlobalSync({ banners: updated }); };
  const removeBanner = async (id: string) => { const updated = banners.filter(b => b.id !== id); setBanners(updated); await commitGlobalSync({ banners: updated }); };

  const addOffer = async (o: Offer) => { const updated = [...offers, o]; setOffers(updated); await commitGlobalSync({ offers: updated }); };
  const updateOffer = async (o: Offer) => { const updated = offers.map(curr => curr.id === o.id ? o : curr); setOffers(updated); await commitGlobalSync({ offers: updated }); };
  const removeOffer = async (id: string) => { const updated = offers.filter(o => o.id !== id); setOffers(updated); await commitGlobalSync({ offers: updated }); };

  const addNotice = async (n: Notice) => { const updated = [...notices, n]; setNotices(updated); await commitGlobalSync({ notices: updated }); };
  const updateNotice = async (n: Notice) => { const updated = notices.map(curr => curr.id === n.id ? n : curr); setNotices(updated); await commitGlobalSync({ notices: updated }); };
  const removeNotice = async (id: string) => { const updated = notices.filter(n => n.id !== id); setNotices(updated); await commitGlobalSync({ notices: updated }); };

  const addDue = async (d: DueRecord) => { const updated = [...dues, d]; setDues(updated); await commitGlobalSync({ dues: updated }); };
  const updateDue = async (d: DueRecord) => { const updated = dues.map(curr => curr.id === d.id ? d : curr); setDues(updated); await commitGlobalSync({ dues: updated }); };
  const removeDue = async (id: string) => { const updated = dues.filter(d => d.id !== id); setDues(updated); await commitGlobalSync({ dues: updated }); };

  const addGiftCard = async (gc: GiftCard) => { const updated = [...giftCards, gc]; setGiftCards(updated); await commitGlobalSync({ giftCards: updated }); };
  const updateGiftCard = async (gc: GiftCard) => { const updated = giftCards.map(curr => curr.id === gc.id ? gc : curr); setGiftCards(updated); await commitGlobalSync({ giftCards: updated }); };
  const removeGiftCard = async (id: string) => { const updated = giftCards.filter(gc => gc.id !== id); setGiftCards(updated); await commitGlobalSync({ giftCards: updated }); };

  const addReview = async (r: Review) => { const updated = [...reviews, r]; setReviews(updated); await commitGlobalSync({ reviews: updated }); };
  const updateReviewStatus = async (id: string, status: any) => { const updated = reviews.map(r => r.id === id ? { ...r, status } : r); setReviews(updated); await commitGlobalSync({ reviews: updated }); };
  const removeReview = async (id: string) => { const updated = reviews.filter(r => r.id !== id); setReviews(updated); await commitGlobalSync({ reviews: updated }); };

  const addMaterialRequest = async (r: MaterialRequest) => { const updated = [...materialRequests, r]; setMaterialRequests(updated); await commitGlobalSync({ materials: updated }); };
  const updateMaterialRequestStatus = async (id: string, status: any) => { const updated = materialRequests.map(r => r.id === id ? { ...r, status } : r); setMaterialRequests(updated); await commitGlobalSync({ materials: updated }); };

  const addUpcomingProduct = async (p: UpcomingProduct) => { const updated = [...upcomingProducts, p]; setUpcomingProducts(updated); await commitGlobalSync({ upcomingProducts: updated }); };
  const updateUpcomingProduct = async (p: UpcomingProduct) => { const updated = upcomingProducts.map(curr => curr.id === p.id ? p : curr); setUpcomingProducts(updated); await commitGlobalSync({ upcomingProducts: updated }); };
  const removeUpcomingProduct = async (id: string) => { const updated = upcomingProducts.filter(p => p.id !== id); setUpcomingProducts(updated); await commitGlobalSync({ upcomingProducts: updated }); };

  const addBespokeService = async (s: BespokeService) => { const updated = [...bespokeServices, s]; setBespokeServices(updated); await commitGlobalSync({ bespokeServices: updated }); };
  const updateBespokeService = async (s: BespokeService) => { const updated = bespokeServices.map(curr => curr.id === s.id ? s : curr); setBespokeServices(updated); await commitGlobalSync({ bespokeServices: updated }); };
  const removeBespokeService = async (id: string) => { const updated = bespokeServices.filter(s => s.id !== id); setBespokeServices(updated); await commitGlobalSync({ bespokeServices: updated }); };

  const addPartnerBrand = async (p: PartnerBrand) => { const updated = [...partnerBrands, p]; setPartnerBrands(updated); await commitGlobalSync({ partners: updated }); };
  const updatePartnerBrand = async (p: PartnerBrand) => { const updated = partnerBrands.map(curr => curr.id === p.id ? p : curr); setPartnerBrands(updated); await commitGlobalSync({ partners: updated }); };
  const removePartnerBrand = async (id: string) => { const updated = partnerBrands.filter(p => p.id !== id); setPartnerBrands(updated); await commitGlobalSync({ partners: updated }); };

  const addProductRequest = async (r: ProductRequest) => { const updated = [...productRequests, r]; setProductRequests(updated); await commitGlobalSync({ requests: updated }); };

  return (
    <StoreContext.Provider value={{
      cart, addToCart: (item: CartItem) => setCart(prev => [...prev, item]), 
      removeFromCart: (id: string) => setCart(prev => prev.filter(i => i.id !== id)), 
      updateQuantity: (id: string, q: number) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, q)} : i)),
      user, setUser, adminUser, setAdminUser, workerUser, setWorkerUser,
      allUsers, wishlist, toggleWishlist: (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]),
      orders, placeOrder, updateOrder, updateOrderStatus, updateProductionStep, assignWorker, removeOrder,
      products, updateProduct, addProduct, removeProduct,
      fabrics, addFabric, removeFabric,
      categories, addCategory, removeCategory,
      coupons, addCoupon, updateCoupon, removeCoupon,
      banners, addBanner, updateBanner, removeBanner,
      upcomingProducts, addUpcomingProduct, updateUpcomingProduct, removeUpcomingProduct,
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
      systemConfig, updateSystemConfig,
      notifications, markNotificationRead: (id: string) => setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n)),
      clearNotifications: () => setNotifications([]),
      emailLogs, isHydrated, syncToServer: async () => { await commitGlobalSync(); },
      resetSystemData: () => {}, roastMaliciousUser: async () => {}, subscribeToNewsletter: async () => {}
    }}>
      {isHydrated ? children : (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
           <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-center">
             <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.5em] animate-pulse">Synchronizing Global Ledger</p>
             <p className="text-slate-600 text-[8px] font-black uppercase tracking-widest mt-2">Bespoke World State Handshake...</p>
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
