import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      // await AsyncStorage.removeItem('products');
      const productsFromAS = await AsyncStorage.getItem('@gomarket:products');

      if (productsFromAS) {
        console.log('AS', productsFromAS);
        setProducts(JSON.parse(productsFromAS));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(prod => {
          if (prod.id === id) {
            return { ...prod, quantity: prod.quantity + 1 };
          }

          return prod;
        });
        return updatedProducts;
      });

      await AsyncStorage.setItem(
        '@gomarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(prod => {
          if (prod.id === id && prod.quantity > 0) {
            return { ...prod, quantity: prod.quantity - 1 };
          }

          return prod;
        });

        return updatedProducts;
      });

      await AsyncStorage.setItem(
        '@gomarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(prod => product.id === prod.id);

      if (productExists) {
        increment(product.id);
      } else {
        setProducts(prevProducts => [
          ...prevProducts,
          { ...product, quantity: 1 },
        ]);
      }

      await AsyncStorage.setItem(
        '@gomarket:products',
        JSON.stringify(products),
      );
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
