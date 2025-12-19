
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, User, Order, OrderStatus, Fabric, Coupon, ProductRequest, Banner, Review, ProductionStep } from './types.ts';
import { PRODUCTS as INITIAL_PRODUCTS } from './constants.tsx';

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
  updateAnyUser: (user: User) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  productRequests: ProductRequest[];
  addProductRequest: (req: ProductRequest) => Promise<void>;
  reviews: Review[];
  addReview: (review: Review) => Promise<void>;
  updateReviewStatus: (reviewId: string, status: 'approved' | 'pending') => Promise<void>;
  removeReview: (id: string) => Promise<void>;
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
  REQUESTS: 'mt_db_requests',
  REVIEWS: 'mt_db_reviews',
  CATEGORIES: 'mt_db_categories'
};

const INITIAL_REVIEWS: Review[] = [
  { id: 'r1', userName: "Arif Ahmed", comment: "The bespoke suit I ordered fits like a dream. Mehedi's attention to detail is world-class!", rating: 5, date: "2 weeks ago", status: 'approved' },
  { id: 'r2', userName: "Sultana Razia", comment: "The quality of the Jamdani fabric is exquisite. Best tailor in Savar by far.", rating: 5, date: "1 month ago", status: 'approved' },
];

const INITIAL_CATEGORIES = ['Men', 'Women', 'Kids', 'Fabrics', 'Custom Tailoring'];

const INITIAL_FABRICS: Fabric[] = [
  { id: 'f1', name: 'Premium Linen', image: 'https://picsum.photos/seed/linen/400/400', description: 'Breathable summer-ready linen blend.' },
  { id: 'f2', name: 'Italian Cotton', image: 'https://picsum.photos/seed/cotton/400/400', description: 'Giza cotton for executive shirts.' }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getStored = (key: string, fallback: any) => {
    const item = localStorage.getItem(key);
    try {
      const parsed = item ? JSON.parse(item) : null;
      if (Array.isArray(fallback) && (!parsed || !Array.isArray(parsed))) return fallback;
      return parsed || fallback;
    } catch {
      return fallback;
    }
  };

  const [cart, setCart] = useState<CartItem[]>(() => getStored(KEYS.CART, []));
  const [user, setUser] = useState<User | null>(() => getStored(KEYS.USER, null));
  const [adminUser, setAdminUser] = useState<User | null>(() => getStored(KEYS.ADMIN, null));
  const [workerUser, setWorkerUser] = useState<User | null>(() => getStored(KEYS.WORKER, null));
  const [allUsers, setAllUsers] = useState<User[]>(() => getStored(KEYS.USERS, []));
  const [wishlist, setWishlist] = useState<string[]>(() => getStored(KEYS.WISHLIST, []));
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = getStored(KEYS.ORDERS, []);
    if (stored.length === 0) {
      return [{
        id: 'MT-77821',
        date: new Date().toISOString(),
        status: 'In Progress',
        productionStep: 'Stitching',
        paymentStatus: 'Partially Paid',
        total: 12500,
        subtotal: 12500,
        paidAmount: 3750,
        dueAmount: 8750,
        paymentMethod: 'Bespoke Advance (30%)',
        items: [{ id: 'demo-1', productId: 'p1', quantity: 1, price: 12500, name: 'Sample Bespoke Suit', image: 'https://picsum.photos/seed/besp/400/600', isCustomOrder: true }],
        address: 'Dhonaid, Ashulia, Savar, Dhaka',
        customerName: 'Sample Patron',
        customerEmail: 'patron@example.com'
      }];
    }
    return stored;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const stored = getStored(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return stored.length === 0 ? INITIAL_PRODUCTS : stored;
  });

  const [fabrics, setFabrics] = useState<Fabric[]>(() => {
    const stored = getStored(KEYS.FABRICS, INITIAL_FABRICS);
    return stored.length === 0 ? INITIAL_FABRICS : stored;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const stored = getStored(KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return stored.length === 0 ? INITIAL_CATEGORIES : stored;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => getStored(KEYS.COUPONS, []));
  
  const [banners, setBanners] = useState<Banner[]>(() => {
    const initial = [{ id: 'b1', title: 'Summer Bespoke', subtitle: 'Crafting excellence for the new season.', imageUrl: 'https://images.unsplash.com/photo-1594932224828-b4b059b6f6f9?q=80&w=2080&auto=format&fit=crop', linkUrl: '/shop', isActive: true }];
    const stored = getStored(KEYS.BANNERS, initial);
    return stored.length === 0 ? initial : stored;
  });

  const [productRequests, setProductRequests] = useState<ProductRequest[]>(() => getStored(KEYS.REQUESTS, []));
  
  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = getStored(KEYS.REVIEWS, INITIAL_REVIEWS);
    return stored.length === 0 ? INITIAL_REVIEWS : stored;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync Logic
  const sync = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  useEffect(() => { sync(KEYS.CART, cart); }, [cart]);
  useEffect(() => { sync(KEYS.WISHLIST, wishlist); }, [wishlist]);
  useEffect(() => { sync(KEYS.PRODUCTS, products); }, [products]);
  useEffect(() => { sync(KEYS.ORDERS, orders); }, [orders]);
  useEffect(() => { sync(KEYS.USERS, allUsers); }, [allUsers]);
  useEffect(() => { sync(KEYS.FABRICS, fabrics); }, [fabrics]);
  useEffect(() => { sync(KEYS.COUPONS, coupons); }, [coupons]);
  useEffect(() => { sync(KEYS.BANNERS, banners); }, [banners]);
  useEffect(() => { sync(KEYS.REQUESTS, productRequests); }, [productRequests]);
  useEffect(() => { sync(KEYS.REVIEWS, reviews); }, [reviews]);
  useEffect(() => { sync(KEYS.CATEGORIES, categories); }, [categories]);
  
  useEffect(() => { 
    if (user) sync(KEYS.USER, user);
    else localStorage.removeItem(KEYS.USER);
  }, [user]);

  useEffect(() => {
    if (adminUser) sync(KEYS.ADMIN, adminUser);
    else localStorage.removeItem(KEYS.ADMIN);
  }, [adminUser]);

  useEffect(() => {
    if (workerUser) sync(KEYS.WORKER, workerUser);
    else localStorage.removeItem(KEYS.WORKER);
  }, [workerUser]);

  const resetSystemData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setFabrics(INITIAL_FABRICS);
    setReviews(INITIAL_REVIEWS);
    setOrders([{
      id: 'MT-77821',
      date: new Date().toISOString(),
      status: 'In Progress',
      productionStep: 'Queue',
      paymentStatus: 'Partially Paid',
      total: 12500,
      subtotal: 12500,
      paidAmount: 3750,
      dueAmount: 8750,
      paymentMethod: 'Bespoke Advance (30%)',
      items: [],
      address: 'Dhonaid, Ashulia, Savar, Dhaka',
      customerName: 'Sample Patron',
      customerEmail: 'patron@example.com'
    }]);
  };

  // Actions
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

  const placeOrder = async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setCart([]);
  };

  const updateOrder = async (order: Order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const updateProductionStep = async (orderId: string, productionStep: ProductionStep) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, productionStep } : o));
  };

  const removeOrder = async (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const addProduct = async (product: Product) => setProducts(prev => [product, ...prev]);
  const updateProduct = async (product: Product) => setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  const removeProduct = async (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const registerNewUser = async (u: User) => { setAllUsers(prev => [...prev, u]); setUser(u); };
  const updateAnyUser = async (u: User) => { setAllUsers(prev => prev.map(x => x.id === u.id ? u : x)); if (user?.id === u.id) setUser(u); };
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
  const addReview = async (review: Review) => setReviews(prev => [review, ...prev]);
  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'pending') => setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
  const removeReview = async (id: string) => setReviews(prev => prev.filter(r => r.id !== id));

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      user, setUser, adminUser, setAdminUser, workerUser, setWorkerUser,
      allUsers, wishlist, toggleWishlist,
      orders, placeOrder, updateOrder, updateOrderStatus, removeOrder, updateProductionStep,
      products, updateProduct, addProduct, removeProduct,
      fabrics, addFabric, removeFabric,
      categories, addCategory, removeCategory,
      coupons, addCoupon, removeCoupon, updateCoupon,
      banners, addBanner, removeBanner, updateBanner,
      registerNewUser, updateAnyUser, removeUser,
      productRequests, addProductRequest,
      reviews, addReview, updateReviewStatus, removeReview,
      isLoading, resetSystemData
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
