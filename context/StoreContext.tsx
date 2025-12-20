
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  CartItem, Product, User, Order, OrderStatus, Fabric, Coupon, 
  ProductRequest, Banner, Review, ProductionStep, MaterialRequest, 
  SystemConfig, Notification, PartnerBrand, EmailLog, DueRecord, BespokeService, UpcomingProduct, GiftCard,
  Offer, Notice, NewsletterSubscriber
} from '../types.ts';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants.tsx';
import { dbService } from '../services/DatabaseService.ts';
import { GoogleGenAI } from "@google/genai";

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
  giftCards: GiftCard[];
  addGiftCard: (gc: GiftCard) => Promise<void>;
  updateGiftCard: (gc: GiftCard) => Promise<void>;
  removeGiftCard: (id: string) => Promise<void>;
  offers: Offer[];
  addOffer: (offer: Offer) => Promise<void>;
  updateOffer: (offer: Offer) => Promise<void>;
  removeOffer: (id: string) => Promise<void>;
  notices: Notice[];
  addNotice: (notice: Notice) => Promise<void>;
  updateNotice: (notice: Notice) => Promise<void>;
  removeNotice: (id: string) => Promise<void>;
  subscribers: NewsletterSubscriber[];
  subscribeToNewsletter: (email: string) => Promise<void>;
  partnerBrands: PartnerBrand[];
  addPartnerBrand: (brand: PartnerBrand) => Promise<void>;
  updatePartnerBrand: (brand: PartnerBrand) => Promise<void>;
  removePartnerBrand: (id: string) => Promise<void>;
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
  systemConfig: SystemConfig;
  updateSystemConfig: (config: SystemConfig) => Promise<void>;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  emailLogs: EmailLog[];
  sendEmail: (to: string, subject: string, body: string) => Promise<void>;
  initiatePasswordReset: (email: string) => Promise<boolean>;
  dues: DueRecord[];
  addDue: (due: DueRecord) => Promise<void>;
  updateDue: (due: DueRecord) => Promise<void>;
  removeDue: (id: string) => Promise<void>;
  bespokeServices: BespokeService[];
  addBespokeService: (service: BespokeService) => Promise<void>;
  updateBespokeService: (service: BespokeService) => Promise<void>;
  removeBespokeService: (id: string) => Promise<void>;
  isHydrated: boolean;
  resetSystemData: () => void;
  exportDb: () => Promise<void>;
  importDb: (json: string) => Promise<void>;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dues, setDues] = useState<DueRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [upcomingProducts, setUpcomingProducts] = useState<UpcomingProduct[]>([]);
  const [bespokeServices, setBespokeServices] = useState<BespokeService[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [partnerBrands, setPartnerBrands] = useState<PartnerBrand[]>([]);
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    smtpHost: 'smtp.gmail.com', smtpPort: 465, smtpUser: '', smtpPass: '', secure: true, 
    senderName: 'Mehedi Tailors', senderEmail: 'orders@meheditailors.com', isEnabled: true, 
    siteName: 'Mehedi Tailors & Fabrics',
    siteLogo: 'https://i.imgur.com/8H9IeM5.png',
    documentLogo: 'https://i.imgur.com/8H9IeM5.png',
    dbVersion: '7.15.0-MASTER',
    giftCardDenominations: [2000, 5000, 10000, 25000],
    giftCardsEnabled: true
  });

  const hardSaveToDisk = useCallback(async (overrides?: any) => {
    const data = {
      products: overrides?.products ?? products,
      upcomingProducts: overrides?.upcomingProducts ?? upcomingProducts,
      orders: overrides?.orders ?? orders,
      users: overrides?.allUsers ?? allUsers,
      emails: overrides?.emailLogs ?? emailLogs, 
      config: overrides?.systemConfig ?? systemConfig,
      notifications: overrides?.notifications ?? notifications,
      banners: overrides?.banners ?? banners,
      partners: overrides?.partnerBrands ?? partnerBrands, 
      fabrics: overrides?.fabrics ?? fabrics,
      reviews: overrides?.reviews ?? reviews,
      requests: overrides?.productRequests ?? productRequests,
      materials: overrides?.materialRequests ?? materialRequests, 
      coupons: overrides?.coupons ?? coupons,
      giftCards: overrides?.giftCards ?? giftCards,
      offers: overrides?.offers ?? offers,
      notices: overrides?.notices ?? notices,
      subscribers: overrides?.subscribers ?? subscribers,
      dues: overrides?.dues ?? dues,
      bespokeServices: overrides?.bespokeServices ?? bespokeServices,
      categories: overrides?.categories ?? categories,
    };
    try {
      await dbService.writeFile(data);
    } catch (e) {
      console.warn("Soft write error (likely incognito):", e);
    }
  }, [
    products, upcomingProducts, orders, allUsers, emailLogs, systemConfig, 
    notifications, banners, partnerBrands, fabrics, reviews, 
    productRequests, materialRequests, coupons, giftCards, offers, notices, subscribers, dues, bespokeServices, categories
  ]);

  useEffect(() => {
    const hydrateAndSeed = async () => {
      try {
        await dbService.init();
        const db = await dbService.readFile();
        
        if (!db.users) {
          const defaultUsers: User[] = [
            { id: 'adm-001', name: 'System Admin', email: 'admin@meheditailors.com', phone: '+8801720267213', address: 'Atelier Savar', measurements: [], role: 'admin', password: 'admin123' }
          ];
          const seedData = { 
            users: defaultUsers, 
            products: INITIAL_PRODUCTS, 
            categories: ['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring'], 
            config: systemConfig,
            notices: [{ id: 'n1', content: 'Welcome to the artisan portal. Eid commissions are now open.', type: 'info', isActive: true, createdAt: new Date().toISOString() }],
            offers: [{ id: 'o1', title: 'Eid Ul Fitr Special', description: '20% off on all bespoke Panjabi tailoring.', discountTag: '20% OFF', imageUrl: 'https://picsum.photos/seed/eid/600/400', linkUrl: '/shop', isActive: true }]
          };
          await dbService.writeFile(seedData);
          setAllUsers(defaultUsers);
          setProducts(INITIAL_PRODUCTS);
          setNotices(seedData.notices as any);
          setOffers(seedData.offers as any);
          setCategories(['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring']);
        } else {
          setProducts(db.products || []);
          setUpcomingProducts(db.upcomingProducts || []);
          setOrders(db.orders || []);
          setAllUsers(db.users || []);
          setFabrics(db.fabrics || []);
          setBanners(db.banners || []);
          setPartnerBrands(db.partners || []);
          setReviews(db.reviews || []);
          setProductRequests(db.requests || []);
          setMaterialRequests(db.materials || []);
          setEmailLogs(db.emails || []);
          setNotifications(db.notifications || []);
          setCoupons(db.coupons || []);
          setGiftCards(db.giftCards || []);
          setOffers(db.offers || []);
          setNotices(db.notices || []);
          setSubscribers(db.subscribers || []);
          setBespokeServices(db.bespokeServices || []);
          setDues(db.dues || []);
          setCategories(db.categories || ['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring']);
          if (db.config) setSystemConfig(db.config);
        }
      } catch (err) {
        console.error("Hydration Critical failure:", err);
      } finally {
        setIsHydrated(true);
      }
    };
    hydrateAndSeed();
  }, []);

  const sendEmail = async (to: string, subject: string, body: string) => {
    if (!to) return;
    const brandedBody = `[DOCUMENT HEADER: ${systemConfig.documentLogo || systemConfig.siteLogo}]\n\n${body}\n\n---\nOFFICIAL COMMUNICATION FROM ${systemConfig.siteName.toUpperCase()}`;
    const newLog: EmailLog = { 
      id: 'ML-' + Date.now(), 
      to, 
      subject, 
      body: brandedBody, 
      timestamp: new Date().toISOString(), 
      status: 'sent', 
      templateId: 'v12-branded' 
    };
    const updatedLogs = [newLog, ...emailLogs];
    setEmailLogs(updatedLogs);
    await hardSaveToDisk({ emailLogs: updatedLogs });
  };

  const updateSystemConfig = async (config: SystemConfig) => { 
    setSystemConfig(config); 
    await hardSaveToDisk({ systemConfig: config }); 
  };

  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const removeFromCart = (itemId: string) => setCart(prev => prev.filter(i => i.id !== itemId));
  const updateQuantity = (itemId: string, qty: number) => setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, qty) } : i));
  const toggleWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const addCategory = (cat: string) => { const updated = [...categories, cat]; setCategories(updated); hardSaveToDisk({ categories: updated }); };
  const removeCategory = (cat: string) => { const updated = categories.filter(c => c !== cat); setCategories(updated); hardSaveToDisk({ categories: updated }); };

  const addCoupon = async (c: Coupon) => { const updated = [...coupons, c]; setCoupons(updated); await hardSaveToDisk({ coupons: updated }); };
  const updateCoupon = async (c: Coupon) => { const updated = coupons.map(curr => curr.id === c.id ? c : curr); setCoupons(updated); await hardSaveToDisk({ coupons: updated }); };
  const removeCoupon = async (id: string) => { const updated = coupons.filter(c => c.id !== id); setCoupons(updated); await hardSaveToDisk({ coupons: updated }); };

  const placeOrder = async (order: Order) => { 
    const updatedOrders = [order, ...orders]; 
    setOrders(updatedOrders); 
    setCart([]); 
    await hardSaveToDisk({ orders: updatedOrders }); 
  };
  
  const updateOrder = async (order: Order) => { const updated = orders.map(o => o.id === order.id ? order : o); setOrders(updated); await hardSaveToDisk({ orders: updated }); };
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => { const updated = orders.map(o => o.id === orderId ? { ...o, status } : o); setOrders(updated); await hardSaveToDisk({ orders: updated }); };
  const updateProductionStep = async (orderId: string, step: ProductionStep) => { const updated = orders.map(o => o.id === orderId ? { ...o, productionStep: step } : o); setOrders(updated); await hardSaveToDisk({ orders: updated }); };
  const removeOrder = async (id: string) => { const updated = orders.filter(o => o.id !== id); setOrders(updated); await hardSaveToDisk({ orders: updated }); };
  const assignWorker = async (orderId: string, workerId: string) => { const updated = orders.map(o => o.id === orderId ? { ...o, assignedWorkerId: workerId } : o); setOrders(updated); await hardSaveToDisk({ orders: updated }); };

  const addProduct = async (p: Product) => { const updated = [p, ...products]; setProducts(updated); await hardSaveToDisk({ products: updated }); };
  const updateProduct = async (p: Product) => { const updated = products.map(curr => curr.id === p.id ? p : curr); setProducts(updated); await hardSaveToDisk({ products: updated }); };
  const removeProduct = async (id: string) => { const updated = products.filter(p => p.id !== id); setProducts(updated); await hardSaveToDisk({ products: updated }); };

  const addOffer = async (o: Offer) => { const updated = [o, ...offers]; setOffers(updated); await hardSaveToDisk({ offers: updated }); };
  const updateOffer = async (o: Offer) => { const updated = offers.map(curr => curr.id === o.id ? o : curr); setOffers(updated); await hardSaveToDisk({ offers: updated }); };
  const removeOffer = async (id: string) => { const updated = offers.filter(o => o.id !== id); setOffers(updated); await hardSaveToDisk({ offers: updated }); };

  const addNotice = async (n: Notice) => { const updated = [n, ...notices]; setNotices(updated); await hardSaveToDisk({ notices: updated }); };
  const updateNotice = async (n: Notice) => { const updated = notices.map(curr => curr.id === n.id ? n : curr); setNotices(updated); await hardSaveToDisk({ notices: updated }); };
  const removeNotice = async (id: string) => { const updated = notices.filter(n => n.id !== id); setNotices(updated); await hardSaveToDisk({ notices: updated }); };

  const registerNewUser = async (u: User) => { const updated = [...allUsers, u]; setAllUsers(updated); await hardSaveToDisk({ allUsers: updated }); };
  const updateAnyUser = async (u: User, notify = false) => { const updated = allUsers.map(x => x.id === u.id ? u : x); setAllUsers(updated); if (user?.id === u.id) setUser(u); await hardSaveToDisk({ allUsers: updated }); };
  const removeUser = async (id: string) => { const updated = allUsers.filter(u => u.id !== id); setAllUsers(updated); await hardSaveToDisk({ allUsers: updated }); };

  const addFabric = async (f: Fabric) => { const updated = [...fabrics, f]; setFabrics(updated); await hardSaveToDisk({ fabrics: updated }); };
  const removeFabric = async (id: string) => { const updated = fabrics.filter(f => f.id !== id); setFabrics(updated); await hardSaveToDisk({ fabrics: updated }); };
  const addBanner = async (b: Banner) => { const updated = [...banners, b]; setBanners(updated); await hardSaveToDisk({ banners: updated }); };
  const updateBanner = async (b: Banner) => { const updated = banners.map(curr => curr.id === b.id ? b : curr); setBanners(updated); await hardSaveToDisk({ banners: updated }); };
  const removeBanner = async (id: string) => { const updated = banners.filter(b => b.id !== id); setBanners(updated); await hardSaveToDisk({ banners: updated }); };
  const addGiftCard = async (gc: GiftCard) => { const updated = [gc, ...giftCards]; setGiftCards(updated); await hardSaveToDisk({ giftCards: updated }); };
  const updateGiftCard = async (gc: GiftCard) => { const updated = giftCards.map(curr => curr.id === gc.id ? gc : curr); setGiftCards(updated); await hardSaveToDisk({ giftCards: updated }); };
  const removeGiftCard = async (id: string) => { const updated = giftCards.filter(gc => gc.id !== id); setGiftCards(updated); await hardSaveToDisk({ giftCards: updated }); };
  const addDue = async (due: DueRecord) => { const updated = [due, ...dues]; setDues(updated); await hardSaveToDisk({ dues: updated }); };
  const updateDue = async (due: DueRecord) => { const updated = dues.map(d => d.id === due.id ? due : d); setDues(updated); await hardSaveToDisk({ dues: updated }); };
  const removeDue = async (id: string) => { const updated = dues.filter(d => d.id !== id); setDues(updated); await hardSaveToDisk({ dues: updated }); };
  const addBespokeService = async (s: BespokeService) => { const updated = [...bespokeServices, s]; setBespokeServices(updated); await hardSaveToDisk({ bespokeServices: updated }); };
  const updateBespokeService = async (s: BespokeService) => { const updated = bespokeServices.map(curr => curr.id === s.id ? s : curr); setBespokeServices(updated); await hardSaveToDisk({ bespokeServices: updated }); };
  const removeBespokeService = async (id: string) => { const updated = bespokeServices.filter(s => s.id !== id); setBespokeServices(updated); await hardSaveToDisk({ bespokeServices: updated }); };
  const addProductRequest = async (req: ProductRequest) => { const updated = [req, ...productRequests]; setProductRequests(updated); await hardSaveToDisk({ productRequests: updated }); };
  const addMaterialRequest = async (req: MaterialRequest) => { const updated = [req, ...materialRequests]; setMaterialRequests(updated); await hardSaveToDisk({ materialRequests: updated }); };
  const updateMaterialRequestStatus = async (id: string, status: 'approved' | 'rejected') => { const updated = materialRequests.map(r => r.id === id ? { ...r, status } : r); setMaterialRequests(updated); await hardSaveToDisk({ materialRequests: updated }); };
  const addReview = async (review: Review) => { const updated = [review, ...reviews]; setReviews(updated); await hardSaveToDisk({ reviews: updated }); };
  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'pending') => { const updated = reviews.map(r => r.id === reviewId ? { ...r, status } : r); setReviews(updated); await hardSaveToDisk({ reviews: updated }); };
  const removeReview = async (id: string) => { const updated = reviews.filter(r => r.id !== id); setReviews(updated); await hardSaveToDisk({ reviews: updated }); };
  const addPartnerBrand = async (brand: PartnerBrand) => { const updated = [...partnerBrands, brand]; setPartnerBrands(updated); await hardSaveToDisk({ partnerBrands: updated }); };
  const updatePartnerBrand = async (brand: PartnerBrand) => { const updated = partnerBrands.map(curr => curr.id === brand.id ? brand : curr); setPartnerBrands(updated); await hardSaveToDisk({ partnerBrands: updated }); };
  const removePartnerBrand = async (id: string) => { const updated = partnerBrands.filter(b => b.id !== id); setPartnerBrands(updated); await hardSaveToDisk({ partnerBrands: updated }); };
  const addUpcomingProduct = async (p: UpcomingProduct) => { const updated = [...upcomingProducts, p]; setUpcomingProducts(updated); await hardSaveToDisk({ upcomingProducts: updated }); };
  const updateUpcomingProduct = async (p: UpcomingProduct) => { const updated = upcomingProducts.map(curr => curr.id === p.id ? p : curr); setUpcomingProducts(updated); await hardSaveToDisk({ upcomingProducts: updated }); };
  const removeUpcomingProduct = async (id: string) => { const updated = upcomingProducts.filter(p => p.id !== id); setUpcomingProducts(updated); await hardSaveToDisk({ upcomingProducts: updated }); };

  const exportDb = async () => {
    const data = await dbService.exportBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `mehedi_db_export.json`; a.click();
  };

  const importDb = async (json: string) => {
    try { await dbService.importBackup(json); window.location.reload(); } catch { alert("Import failed."); }
  };

  const resetSystemData = async () => { if (window.confirm("Purge DB?")) { await dbService.clearAll(); window.location.reload(); } };
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  const clearNotifications = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  const addNotification = (n: Notification) => setNotifications(prev => [n, ...prev]);

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      user, setUser, adminUser, setAdminUser, workerUser, setWorkerUser,
      allUsers, wishlist, toggleWishlist,
      orders, placeOrder, updateOrder, updateOrderStatus, removeOrder, updateProductionStep, assignWorker,
      products, updateProduct, addProduct, removeProduct,
      upcomingProducts, addUpcomingProduct, updateUpcomingProduct, removeUpcomingProduct,
      fabrics, addFabric, removeFabric,
      categories, addCategory, removeCategory,
      coupons, addCoupon, removeCoupon, updateCoupon,
      giftCards, addGiftCard, updateGiftCard, removeGiftCard,
      offers, addOffer, updateOffer, removeOffer,
      notices, addNotice, updateNotice, removeNotice,
      subscribers, subscribeToNewsletter: async () => {},
      banners, addBanner, removeBanner, updateBanner,
      partnerBrands, addPartnerBrand, updatePartnerBrand, removePartnerBrand,
      registerNewUser, updateAnyUser, removeUser,
      productRequests, addProductRequest,
      materialRequests, addMaterialRequest, updateMaterialRequestStatus,
      reviews, addReview, updateReviewStatus, removeReview,
      systemConfig, updateSystemConfig,
      notifications, addNotification, markNotificationRead, clearNotifications,
      emailLogs, sendEmail, initiatePasswordReset: async () => true, isHydrated, resetSystemData, exportDb, importDb,
      dues, addDue, updateDue, removeDue,
      bespokeServices, addBespokeService, updateBespokeService, removeBespokeService,
      roastMaliciousUser: async () => {}
    }}>
      {isHydrated ? children : <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-500 font-mono">Initializing Core Virtual FS...</div>}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
