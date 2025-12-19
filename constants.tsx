
import { Product, Category } from './types.ts';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Premium Silk Panjabi',
    category: Category.MEN,
    price: 4500,
    discountPrice: 3800,
    image: 'https://picsum.photos/seed/panjabi/600/800',
    images: [
      'https://picsum.photos/seed/panjabi/600/800',
      'https://picsum.photos/seed/panjabi2/600/800',
      'https://picsum.photos/seed/panjabi3/600/800'
    ],
    description: 'Exquisite silk panjabi with hand-crafted embroidery. Perfect for special occasions.',
    fabricType: 'Silk',
    availableSizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Deep Blue', 'Maroon'],
    inStock: true,
    isFeatured: true
  },
  {
    id: 'p2',
    name: 'Italian Cotton Fabric - Navy',
    category: Category.FABRICS,
    price: 1200,
    image: 'https://picsum.photos/seed/fabric1/600/800',
    images: [
      'https://picsum.photos/seed/fabric1/600/800',
      'https://picsum.photos/seed/fabric2/600/800'
    ],
    description: 'High-quality breathable Italian cotton. Ideal for shirts.',
    fabricType: 'Cotton',
    availableSizes: ['Per Meter'],
    colors: ['Navy'],
    inStock: true,
    isFeatured: true
  },
  {
    id: 'p3',
    name: 'Bespoke Business Suit',
    category: Category.CUSTOM,
    price: 15000,
    image: 'https://picsum.photos/seed/suit/600/800',
    images: [
      'https://picsum.photos/seed/suit/600/800',
      'https://picsum.photos/seed/suit2/600/800',
      'https://picsum.photos/seed/suit3/600/800'
    ],
    description: 'Tailor-made to your exact measurements. Premium wool blend.',
    fabricType: 'Wool Blend',
    availableSizes: ['Custom'],
    colors: ['Charcoal', 'Black'],
    inStock: true,
    isFeatured: true
  },
  {
    id: 'p4',
    name: 'Traditional Jamdani Saree',
    category: Category.WOMEN,
    price: 12500,
    image: 'https://picsum.photos/seed/saree/600/800',
    images: [
      'https://picsum.photos/seed/saree/600/800',
      'https://picsum.photos/seed/saree2/600/800'
    ],
    description: 'Handwoven authentic Jamdani saree with gold Zari work.',
    fabricType: 'Cotton-Silk Mix',
    availableSizes: ['Standard'],
    colors: ['Red', 'Emerald'],
    inStock: true
  }
];
