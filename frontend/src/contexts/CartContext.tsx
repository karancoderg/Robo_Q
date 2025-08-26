import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Item, CartItem } from '@/types';
import toast from 'react-hot-toast';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: Item; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartContextType extends CartState {
  addItem: (item: Item, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (cartItem) => cartItem.item._id === item._id
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        newItems = state.items.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        newItems = [...state.items, { item, quantity }];
      }

      const total = newItems.reduce(
        (sum, cartItem) => sum + cartItem.item.price * cartItem.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        (cartItem) => cartItem.item._id !== action.payload
      );
      const total = newItems.reduce(
        (sum, cartItem) => sum + cartItem.item.price * cartItem.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: itemId });
      }

      const newItems = state.items.map((cartItem) =>
        cartItem.item._id === itemId ? { ...cartItem, quantity } : cartItem
      );
      const total = newItems.reduce(
        (sum, cartItem) => sum + cartItem.item.price * cartItem.quantity,
        0
      );
      const itemCount = newItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0 };

    default:
      return state;
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  });

  const addItem = (item: Item, quantity: number = 1) => {
    if (!item.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
    toast.success(`${item.name} added to cart`);
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    toast.success('Item removed from cart');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (itemId: string): number => {
    const cartItem = state.items.find((item) => item.item._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
