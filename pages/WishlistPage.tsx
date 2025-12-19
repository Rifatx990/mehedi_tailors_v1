
import React from 'react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../constants';
import { Link } from 'react-router-dom';
import { TrashIcon, ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline';

const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const favoriteProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  const handleAddToCart = (product: any) => {
    addToCart({
      id: `cart-${product.id}`,
      productId: product.id,
      name: product.name,
      image: product.image,
      quantity: 1,
      isCustomOrder: false,
      price: product.discountPrice || product.price
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className="py-32 container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
            <HeartIcon className="w-12 h-12 text-slate-300" />
          </div>
        </div>
        <h1 className="text-5xl font-bold serif mb-6">Your Wishlist is Empty</h1>
        <p className="text-slate-500 mb-10 max-w-md mx-auto">
          Keep track of your favorite fabrics and bespoke designs. Start exploring our collection and save what you love!
        </p>
        <Link to="/shop" className="bg-slate-900 text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-slate-800 transition">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold serif">My Favorites</h1>
            <p className="text-slate-500 mt-2">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved for later</p>
          </div>
          <Link to="/shop" className="text-sm font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 transition">
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-500">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={product.name} />
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-amber-600 shadow-lg hover:bg-amber-600 hover:text-white transition"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">{product.category}</p>
                <h3 className="text-xl font-bold serif mb-4">{product.name}</h3>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-medium">Price</span>
                    <span className="text-xl font-bold text-slate-900">
                      BDT {(product.discountPrice || product.price).toLocaleString()}
                    </span>
                  </div>
                  {product.discountPrice && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Sale
                    </span>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="flex-grow bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 hover:bg-slate-800 transition shadow-lg shadow-slate-100"
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>
                  <Link 
                    to={`/product/${product.id}`}
                    className="px-6 border border-slate-200 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center hover:bg-slate-50 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
