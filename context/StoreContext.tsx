
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
  syncToServer: () => Promise<void>;
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
    siteName: 'Mehedi Tailors & Fabrics', siteLogo: 'https://i.imgur.com/8H9IeM5.png', 
    documentLogo: 'https://i.imgur.com/8H9IeM5.png', 
    dbVersion: '10.1.0-LIVE-JSON', giftCardDenominations: [2000, 5000, 10000], giftCardsEnabled: true
  });

  const getFullState = useCallback(() => {
    return {
      users: allUsers, products, categories, config: systemConfig, coupons, notices, 
      offers, orders, emails: emailLogs, notifications, banners, fabrics, 
      requests: productRequests, materials: materialRequests, giftCards, dues, 
      bespokeServices, upcomingProducts, subscribers, partners: partnerBrands
    };
  }, [allUsers, products, categories, systemConfig, coupons, notices, offers, orders, emailLogs, notifications, banners, fabrics, productRequests, materialRequests, giftCards, dues, bespokeServices, upcomingProducts, subscribers, partnerBrands]);

  const hardSaveToGlobalFile = useCallback(async (overrides?: any) => {
    const data = { ...getFullState(), ...overrides };
    await dbService.writeFile(data);
  }, [getFullState]);

  useEffect(() => {
    const hydrateFromGlobalSource = async () => {
      const db = await dbService.readFile();
      
      // If server file exists, synchronize state
      if (db && typeof db === 'object') {
        setAllUsers(db.users || []);
        setProducts(db.products || INITIAL_PRODUCTS);
        setCategories(db.categories || ['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring']);
        setSystemConfig(db.config || systemConfig);
        setCoupons(db.coupons || []);
        setNotices(db.notices || []);
        setOffers(db.offers || []);
        setOrders(db.orders || []);
        setEmailLogs(db.emails || []);
        setNotifications(db.notifications || []);
        setBanners(db.banners || []);
        setFabrics(db.fabrics || []);
        setProductRequests(db.requests || []);
        setMaterialRequests(db.materials || []);
        setGiftCards(db.giftCards || []);
        setDues(db.dues || []);
        setBespokeServices(db.bespokeServices || []);
        setUpcomingProducts(db.upcomingProducts || []);
        setSubscribers(db.subscribers || []);
        setPartnerBrands(db.partners || []);
      } else {
        // Fallback for missing database.json: Load hardcoded production defaults
        console.warn("System using Artisan Readiness Protocol: Initializing with Production Defaults.");
        setProducts(INITIAL_PRODUCTS);
        setCategories(['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring']);
        setAllUsers([
          { id: "adm-001", name: "System Admin", email: "admin@meheditailors.com", phone: "+8801720267213", address: "Atelier Savar", measurements: [], role: "admin", password: "admin123" }
        ]);
        setBespokeServices([
          { id: 's1', name: 'Shirt', icon: '👔', basePrice: 1200, description: 'Precision fitted formal/casual shirts.', isActive: true },
          { id: 's2', name: 'Suit', icon: '🧥', basePrice: 15000, description: 'Full three-piece bespoke experience.', isActive: true },
          { id: 's3', name: 'Panjabi', icon: '🕌', basePrice: 2500, description: 'Traditional craftsmanship meet modern fit.', isActive: true }
        ]);
      }
      setIsHydrated(true);
    };
    hydrateFromGlobalSource();
  }, []);

  const addToCart = (item: CartItem) => setCart(prev => [...prev, item]);
  const removeFromCart = (itemId: string) => setCart(prev => prev.filter(i => i.id !== itemId));
  const updateQuantity = (itemId: string, qty: number) => setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, qty) } : i));
  const toggleWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const updateSystemConfig = async (config: SystemConfig) => { setSystemConfig(config); await hardSaveToGlobalFile({ config }); };
  const addCategory = (cat: string) => { const updated = [...categories, cat]; setCategories(updated); hardSaveToGlobalFile({ categories: updated }); };
  const removeCategory = (cat: string) => { const updated = categories.filter(c => c !== cat); setCategories(updated); hardSaveToGlobalFile({ categories: updated }); };
  const addCoupon = async (c: Coupon) => { const updated = [...coupons, c]; setCoupons(updated); await hardSaveToGlobalFile({ coupons: updated }); };
  const updateCoupon = async (c: Coupon) => { const updated = coupons.map(curr => curr.id === c.id ? c : curr); setCoupons(updated); await hardSaveToGlobalFile({ coupons: updated }); };
  const removeCoupon = async (id: string) => { const updated = coupons.filter(c => c.id !== id); setCoupons(updated); await hardSaveToGlobalFile({ coupons: updated }); };
  const placeOrder = async (order: Order) => { const updated = [order, ...orders]; setOrders(updated); setCart([]); await hardSaveToGlobalFile({ orders: updated }); };
  const updateOrder = async (order: Order) => { const updated = orders.map(o => o.id === order.id ? order : o); setOrders(updated); await hardSaveToGlobalFile({ orders: updated }); };
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => { const updated = orders.map(o => o.id === orderId ? { ...o, status } : o); setOrders(updated); await hardSaveToGlobalFile({ orders: updated }); };
  const updateProductionStep = async (orderId: string, step: ProductionStep) => { const updated = orders.map(o => o.id === orderId ? { ...o, productionStep: step } : o); setOrders(updated); await hardSaveToGlobalFile({ orders: updated }); };
  const assignWorker = async (orderId: string, workerId: string) => { const updated = orders.map(o => o.id === orderId ? { ...o, assignedWorkerId: workerId } : o); setOrders(updated); await hardSaveToGlobalFile({ orders: updated }); };
  const removeOrder = async (id: string) => { const updated = orders.filter(o => o.id !== id); setOrders(updated); await hardSaveToGlobalFile({ orders: updated }); };
  const addProduct = async (p: Product) => { const updated = [p, ...products]; setProducts(updated); await hardSaveToGlobalFile({ products: updated }); };
  const updateProduct = async (p: Product) => { const updated = products.map(curr => curr.id === p.id ? p : curr); setProducts(updated); await hardSaveToGlobalFile({ products: updated }); };
  const removeProduct = async (id: string) => { const updated = products.filter(p => p.id !== id); setProducts(updated); await hardSaveToGlobalFile({ products: updated }); };
  const addUpcomingProduct = async (p: UpcomingProduct) => { const updated = [p, ...upcomingProducts]; setUpcomingProducts(updated); await hardSaveToGlobalFile({ upcomingProducts: updated }); };
  const updateUpcomingProduct = async (p: UpcomingProduct) => { const updated = upcomingProducts.map(curr => curr.id === p.id ? p : curr); setUpcomingProducts(updated); await hardSaveToGlobalFile({ upcomingProducts: updated }); };
  const removeUpcomingProduct = async (id: string) => { const updated = upcomingProducts.filter(p => p.id !== id); setUpcomingProducts(updated); await hardSaveToGlobalFile({ upcomingProducts: updated }); };
  const addFabric = async (f: Fabric) => { const updated = [f, ...fabrics]; setFabrics(updated); await hardSaveToGlobalFile({ fabrics: updated }); };
  const removeFabric = async (id: string) => { const updated = fabrics.filter(f => f.id !== id); setFabrics(updated); await hardSaveToGlobalFile({ fabrics: updated }); };
  const addBanner = async (b: Banner) => { const updated = [b, ...banners]; setBanners(updated); await hardSaveToGlobalFile({ banners: updated }); };
  const updateBanner = async (b: Banner) => { const updated = banners.map(curr => curr.id === b.id ? b : curr); setBanners(updated); await hardSaveToGlobalFile({ banners: updated }); };
  const removeBanner = async (id: string) => { const updated = banners.filter(b => b.id !== id); setBanners(updated); await hardSaveToGlobalFile({ banners: updated }); };
  const addPartnerBrand = async (brand: PartnerBrand) => { const updated = [...partnerBrands, brand]; setPartnerBrands(updated); await hardSaveToGlobalFile({ partners: updated }); };
  const updatePartnerBrand = async (brand: PartnerBrand) => { const updated = partnerBrands.map(curr => curr.id === brand.id ? brand : curr); setPartnerBrands(updated); await hardSaveToGlobalFile({ partners: updated }); };
  const removePartnerBrand = async (id: string) => { const updated = partnerBrands.filter(b => b.id !== id); setPartnerBrands(updated); await hardSaveToGlobalFile({ partners: updated }); };
  const registerNewUser = async (u: User) => { const updated = [...allUsers, u]; setAllUsers(updated); await hardSaveToGlobalFile({ users: updated }); };
  const updateAnyUser = async (u: User) => { const updated = allUsers.map(x => x.id === u.id ? u : x); setAllUsers(updated); await hardSaveToGlobalFile({ users: updated }); };
  const removeUser = async (id: string) => { const updated = allUsers.filter(u => u.id !== id); setAllUsers(updated); await hardSaveToGlobalFile({ users: updated }); };
  const addMaterialRequest = async (req: MaterialRequest) => { const updated = [req, ...materialRequests]; setMaterialRequests(updated); await hardSaveToGlobalFile({ materials: updated }); };
  const updateMaterialRequestStatus = async (id: string, status: any) => { const updated = materialRequests.map(r => r.id === id ? { ...r, status } : r); setMaterialRequests(updated); await hardSaveToGlobalFile({ materials: updated }); };
  const addReview = async (review: Review) => { const updated = [review, ...reviews]; setReviews(updated); await hardSaveToGlobalFile({ reviews: updated }); };
  const updateReviewStatus = async (reviewId: string, status: any) => { const updated = reviews.map(r => r.id === reviewId ? { ...r, status } : r); setReviews(updated); await hardSaveToGlobalFile({ reviews: updated }); };
  const removeReview = async (id: string) => { const updated = reviews.filter(r => r.id !== id); setReviews(updated); await hardSaveToGlobalFile({ reviews: updated }); };
  const addOffer = async (o: Offer) => { const updated = [o, ...offers]; setOffers(updated); await hardSaveToGlobalFile({ offers: updated }); };
  const updateOffer = async (o: Offer) => { const updated = offers.map(curr => curr.id === o.id ? o : curr); setOffers(updated); await hardSaveToGlobalFile({ offers: updated }); };
  const removeOffer = async (id: string) => { const updated = offers.filter(o => o.id !== id); setOffers(updated); await hardSaveToGlobalFile({ offers: updated }); };
  const addNotice = async (n: Notice) => { const updated = [n, ...notices]; setNotices(updated); await hardSaveToGlobalFile({ notices: updated }); };
  const updateNotice = async (n: Notice) => { const updated = notices.map(curr => curr.id === n.id ? n : curr); setNotices(updated); await hardSaveToGlobalFile({ notices: updated }); };
  const removeNotice = async (id: string) => { const updated = notices.filter(n => n.id !== id); setNotices(updated); await hardSaveToGlobalFile({ notices: updated }); };
  const addGiftCard = async (gc: GiftCard) => { const updated = [gc, ...giftCards]; setGiftCards(updated); await hardSaveToGlobalFile({ giftCards: updated }); };
  const updateGiftCard = async (gc: GiftCard) => { const updated = giftCards.map(curr => curr.id === gc.id ? gc : curr); setGiftCards(updated); await hardSaveToGlobalFile({ giftCards: updated }); };
  const removeGiftCard = async (id: string) => { const updated = giftCards.filter(gc => gc.id !== id); setGiftCards(updated); await hardSaveToGlobalFile({ giftCards: updated }); };
  const addDue = async (due: DueRecord) => { const updated = [due, ...dues]; setDues(updated); await hardSaveToGlobalFile({ dues: updated }); };
  const updateDue = async (due: DueRecord) => { const updated = dues.map(d => d.id === due.id ? due : d); setDues(updated); await hardSaveToGlobalFile({ dues: updated }); };
  const removeDue = async (id: string) => { const updated = dues.filter(d => d.id !== id); setDues(updated); await hardSaveToGlobalFile({ dues: updated }); };
  const addBespokeService = async (s: BespokeService) => { const updated = [...bespokeServices, s]; setBespokeServices(updated); await hardSaveToGlobalFile({ bespokeServices: updated }); };
  const updateBespokeService = async (s: BespokeService) => { const updated = bespokeServices.map(curr => curr.id === s.id ? s : curr); setBespokeServices(updated); await hardSaveToGlobalFile({ bespokeServices: updated }); };
  const removeBespokeService = async (id: string) => { const updated = bespokeServices.filter(s => s.id !== id); setBespokeServices(updated); await hardSaveToGlobalFile({ bespokeServices: updated }); };
  const addProductRequest = async (req: ProductRequest) => { const updated = [req, ...productRequests]; setProductRequests(updated); await hardSaveToGlobalFile({ requests: updated }); };

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
      notifications, addNotification: () => {}, markNotificationRead: () => {}, clearNotifications: () => {},
      emailLogs, sendEmail: async () => {}, initiatePasswordReset: async () => true,
      isHydrated, resetSystemData: () => {}, exportDb: async () => {}, importDb: async () => {},
      dues, addDue, updateDue, removeDue,
      bespokeServices, addBespokeService, updateBespokeService, removeBespokeService,
      syncToServer: async () => { await hardSaveToGlobalFile(); },
      roastMaliciousUser: async () => {}
    }}>
      {isHydrated ? children : <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-500 font-mono">Synchronizing Artisan Ledger...</div>}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
