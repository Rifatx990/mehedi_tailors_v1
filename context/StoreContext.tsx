
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  CartItem, Product, User, Order, OrderStatus, Fabric, Coupon, 
  Banner, ProductionStep, SystemConfig, Notice, Offer, PartnerBrand, BespokeService, 
  Notification, GiftCard, DueRecord, EmailLog, MaterialRequest, ProductRequest, Review, UpcomingProduct
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
  assignWorker: (orderId: string, workerId: string) => Promise<void>;
  removeOrder: (id: string) => Promise<void>;
  products: Product[];
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  upcomingProducts: UpcomingProduct[];
  fabrics: Fabric[];
  addFabric: (fabric: Fabric) => Promise<void>;
  removeFabric: (id: string) => Promise<void>;
  categories: string[];
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
  systemConfig: SystemConfig;
  updateSystemConfig: (config: SystemConfig) => Promise<void>;
  notifications: Notification[];
  productRequests: ProductRequest[];
  addProductRequest: (req: ProductRequest) => Promise<void>;
  materialRequests: MaterialRequest[];
  addMaterialRequest: (req: MaterialRequest) => Promise<void>;
  updateMaterialRequestStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  reviews: Review[];
  addReview: (rev: Review) => Promise<void>;
  updateReviewStatus: (id: string, status: 'approved' | 'pending') => Promise<void>;
  removeReview: (id: string) => Promise<void>;
  isHydrated: boolean;
  syncToServer: () => Promise<void>;
  registerNewUser: (user: User) => Promise<void>;
  updateAnyUser: (user: User, notify?: boolean) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
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
  const [categories, setCategories] = useState<string[]>(['Men', 'Women', 'Fabrics', 'Custom Tailoring']);
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
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    smtpHost: '', smtpPort: 465, smtpUser: '', smtpPass: '', secure: true, 
    senderName: 'Mehedi Tailors', senderEmail: '', isEnabled: false, 
    siteName: 'Mehedi Tailors & Fabrics', dbVersion: 'POSTGRES-9.0.0', giftCardDenominations: [2000, 5000, 10000], giftCardsEnabled: true
  });

  const mapDbToCamel = (obj: any) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(mapDbToCamel);
    const newObj: any = {};
    for (let key in obj) {
      const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
      newObj[camelKey] = (typeof obj[key] === 'object' && obj[key] !== null) ? mapDbToCamel(obj[key]) : obj[key];
    }
    return newObj;
  };

  const bootstrap = useCallback(async () => {
    try {
      const [users, prods, ords, conf, bans, nats, offs, coups, gcs, ds, svcs, pats, reqs, mats, revs] = await Promise.all([
        dbService.getUsers(), dbService.getProducts(), dbService.getOrders(),
        dbService.getConfig(), dbService.getBanners(), dbService.getNotices(),
        dbService.getOffers(), dbService.getCoupons(), dbService.getGiftCards(),
        dbService.getDues(), dbService.getBespokeServices(), dbService.getPartners(),
        dbService.getProductRequests(), dbService.getMaterialRequests(), dbService.getReviews()
      ]);

      setAllUsers(users.map(mapDbToCamel));
      setProducts(prods.map(mapDbToCamel));
      setOrders(ords.map(mapDbToCamel));
      if (conf) setSystemConfig(mapDbToCamel(conf));
      setBanners(bans.map(mapDbToCamel));
      setNotices(nats.map(mapDbToCamel));
      setOffers(offs.map(mapDbToCamel));
      setCoupons(coups.map(mapDbToCamel));
      setGiftCards(gcs.map(mapDbToCamel));
      setDues(ds.map(mapDbToCamel));
      setBespokeServices(svcs.map(mapDbToCamel));
      setPartnerBrands(pats.map(mapDbToCamel));
      setProductRequests(reqs.map(mapDbToCamel));
      setMaterialRequests(mats.map(mapDbToCamel));
      setReviews(revs.map(mapDbToCamel));
      
      const cats = Array.from(new Set(prods.map((p: any) => p.category)));
      setCategories(cats.length ? (cats as string[]) : ['Men', 'Women', 'Fabrics', 'Custom Tailoring']);
      
      setIsHydrated(true);
    } catch (err) {
      console.error("PostgreSQL Authority Handshake Failed:", err);
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  // DB Mutators
  const updateSystemConfig = async (config: SystemConfig) => { const s = await dbService.updateConfig(config); setSystemConfig(mapDbToCamel(s)); };
  const addProduct = async (p: Product) => { const s = await dbService.saveProduct(p); setProducts(prev => [mapDbToCamel(s), ...prev]); };
  const updateProduct = async (p: Product) => { const s = await dbService.saveProduct(p); setProducts(prev => prev.map(c => c.id === p.id ? mapDbToCamel(s) : c)); };
  const removeProduct = async (id: string) => { await dbService.deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); };

  const placeOrder = async (order: Order) => { const s = await dbService.saveOrder(order); setOrders(prev => [mapDbToCamel(s), ...prev]); setCart([]); };
  const updateOrder = async (order: Order) => { const s = await dbService.saveOrder(order); setOrders(prev => prev.map(o => o.id === order.id ? mapDbToCamel(s) : o)); };
  const updateOrderStatus = async (id: string, status: OrderStatus) => { await dbService.saveOrder({ id, status }); setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o)); };
  const updateProductionStep = async (id: string, productionStep: ProductionStep) => { await dbService.saveOrder({ id, productionStep }); setOrders(prev => prev.map(o => o.id === id ? { ...o, productionStep } : o)); };
  const removeOrder = async (id: string) => { await dbService.deleteOrder(id); setOrders(prev => prev.filter(o => o.id !== id)); };

  const registerNewUser = async (u: User) => { const s = await dbService.saveUser(u); setAllUsers(prev => [...prev, mapDbToCamel(s)]); setUser(mapDbToCamel(s)); };
  const updateAnyUser = async (u: User) => { const s = await dbService.saveUser(u); setAllUsers(prev => prev.map(x => x.id === u.id ? mapDbToCamel(s) : x)); };
  const removeUser = async (id: string) => { await dbService.deleteUser(id); setAllUsers(prev => prev.filter(u => u.id !== id)); };

  const addCoupon = async (c: Coupon) => { const s = await dbService.saveCoupon(c); setCoupons(prev => [mapDbToCamel(s), ...prev]); };
  const updateCoupon = async (c: Coupon) => { const s = await dbService.saveCoupon(c); setCoupons(prev => prev.map(curr => curr.id === c.id ? mapDbToCamel(s) : curr)); };
  const removeCoupon = async (id: string) => { await dbService.deleteCoupon(id); setCoupons(prev => prev.filter(c => c.id !== id)); };

  return (
    <StoreContext.Provider value={{
      cart, addToCart: (i) => setCart(prev => [...prev, i]), 
      removeFromCart: (id) => setCart(prev => prev.filter(i => i.id !== id)), 
      updateQuantity: (id, q) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, q)} : i)),
      user, setUser, adminUser, setAdminUser, workerUser, setWorkerUser,
      allUsers, wishlist, toggleWishlist: (id) => setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]),
      orders, placeOrder, updateOrder, updateOrderStatus, updateProductionStep, removeOrder,
      products, updateProduct, addProduct, removeProduct,
      fabrics, addFabric: async (f) => { await dbService.saveFabric(f); setFabrics(prev => [...prev, f]); }, removeFabric: async () => {},
      categories, coupons, addCoupon, updateCoupon, removeCoupon,
      banners, addBanner: async (b) => { const s = await dbService.saveBanner(b); setBanners(prev => [mapDbToCamel(s), ...prev]); }, 
      updateBanner: async (b) => { const s = await dbService.saveBanner(b); setBanners(prev => prev.map(c => c.id === b.id ? mapDbToCamel(s) : c)); }, 
      removeBanner: async (id) => { await dbService.deleteBanner(id); setBanners(prev => prev.filter(x => x.id !== id)); },
      notices, addNotice: async (n) => { const s = await dbService.saveNotice(n); setNotices(prev => [mapDbToCamel(s), ...prev]); }, 
      updateNotice: async (n) => { const s = await dbService.saveNotice(n); setNotices(prev => prev.map(c => c.id === n.id ? mapDbToCamel(s) : c)); },
      removeNotice: async (id) => { await dbService.deleteNotice(id); setNotices(prev => prev.filter(x => x.id !== id)); },
      offers, addOffer: async (o) => { const s = await dbService.saveOffer(o); setOffers(prev => [mapDbToCamel(s), ...prev]); }, 
      updateOffer: async (o) => { const s = await dbService.saveOffer(o); setOffers(prev => prev.map(c => c.id === o.id ? mapDbToCamel(s) : c)); },
      removeOffer: async (id) => { await dbService.deleteOffer(id); setOffers(prev => prev.filter(x => x.id !== id)); },
      giftCards, addGiftCard: async (gc) => { const s = await dbService.saveGiftCard(gc); setGiftCards(prev => [mapDbToCamel(s), ...prev]); },
      dues, addDue: async (d) => { const s = await dbService.saveDue(d); setDues(prev => [mapDbToCamel(s), ...prev]); }, 
      updateDue: async (d) => { const s = await dbService.saveDue(d); setDues(prev => prev.map(c => c.id === d.id ? mapDbToCamel(s) : c)); },
      removeDue: async (id) => { await dbService.deleteDue(id); setDues(prev => prev.filter(x => x.id !== id)); },
      bespokeServices, addBespokeService: async (s) => { const res = await dbService.saveBespokeService(s); setBespokeServices(prev => [mapDbToCamel(res), ...prev]); },
      updateBespokeService: async (s) => { const res = await dbService.saveBespokeService(s); setBespokeServices(prev => prev.map(c => c.id === s.id ? mapDbToCamel(res) : c)); },
      removeBespokeService: async (id) => { await dbService.deleteBespokeService(id); setBespokeServices(prev => prev.filter(x => x.id !== id)); },
      partnerBrands, addPartnerBrand: async (p) => { const s = await dbService.savePartner(p); setPartnerBrands(prev => [mapDbToCamel(s), ...prev]); },
      systemConfig, updateSystemConfig,
      notifications: [], 
      productRequests, addProductRequest: async (r) => { const s = await dbService.saveProductRequest(r); setProductRequests(prev => [mapDbToCamel(s), ...prev]); },
      materialRequests, addMaterialRequest: async (r) => { const s = await dbService.saveMaterialRequest(r); setMaterialRequests(prev => [mapDbToCamel(s), ...prev]); }, 
      updateMaterialRequestStatus: async (id, status) => { const s = await dbService.saveMaterialRequest({id, status}); setMaterialRequests(prev => prev.map(r => r.id === id ? mapDbToCamel(s) : r)); },
      reviews, addReview: async (r) => { const s = await dbService.saveReview(r); setReviews(prev => [mapDbToCamel(s), ...prev]); }, 
      updateReviewStatus: async (id, status) => { const s = await dbService.saveReview({id, status}); setReviews(prev => prev.map(r => r.id === id ? mapDbToCamel(s) : r)); },
      removeReview: async (id) => { await dbService.deleteReview(id); setReviews(prev => prev.filter(x => x.id !== id)); },
      isHydrated, syncToServer: async () => { await bootstrap(); },
      registerNewUser, updateAnyUser, removeUser, assignWorker: async () => {}, upcomingProducts: []
    }}>
      {isHydrated ? children : (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
           <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
           <div className="text-center">
             <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.5em] animate-pulse">PostgreSQL Handshake...</p>
             <p className="text-slate-600 text-[8px] font-black uppercase tracking-widest mt-2">Connecting to Authority</p>
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
