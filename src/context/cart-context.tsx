
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import type { CartItem, Generator } from '@/lib/types';
import type { DateRange } from 'react-day-picker';
import { useData } from './data-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CartContextType {
    cart: CartItem[];
    addToCart: (generator: Generator) => void;
    removeFromCart: (generatorId: string) => void;
    updateQuantity: (generatorId: string, quantity: number) => boolean; // Return boolean for success
    clearCart: () => void;
    cartCount: number;
    getTotalCost: (dateRange?: DateRange) => number;
    getAvailableUnits: (generatorId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const { generators } = useData();
    const { toast } = useToast();

    const getAvailableUnits = useCallback((generatorId: string): number => {
        const generator = generators.find(g => g.id === generatorId);
        if (!generator) return 0;
        return generator.units.filter(u => u.status === 'Available').length;
    }, [generators]);

    const addToCart = useCallback((generator: Generator) => {
        const availableUnits = getAvailableUnits(generator.id);
        const itemInCart = cart.find(item => item.generator.id === generator.id);
        const currentQuantity = itemInCart?.quantity || 0;

        if (availableUnits <= currentQuantity) {
            // This is a safeguard. The primary check should be in the UI component.
            console.error("Attempted to add an out-of-stock item to the cart.");
            return; 
        }

        setCart(prevCart => {
            if (itemInCart) {
                return prevCart.map(item =>
                    item.generator.id === generator.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { generator, quantity: 1 }];
        });

        toast({
            title: "Added to Cart!",
            description: `${generator.name} has been added to your cart.`,
            action: (
                <Button asChild variant="secondary" size="sm">
                    <Link href="/cart">View Cart</Link>
                </Button>
            ),
        });

    }, [cart, toast, getAvailableUnits]);

    const removeFromCart = useCallback((generatorId: string) => {
        setCart(prevCart => prevCart.filter(item => item.generator.id !== generatorId));
    }, []);

    const updateQuantity = useCallback((generatorId: string, quantity: number): boolean => {
        if (quantity <= 0) {
            removeFromCart(generatorId);
            return true;
        }
        
        const availableUnits = getAvailableUnits(generatorId);
        if (quantity > availableUnits) {
            return false; // Indicate failure
        }

        setCart(prevCart => prevCart.map(item =>
            item.generator.id === generatorId
                ? { ...item, quantity }
                : item
        ));
        return true; // Indicate success
    }, [removeFromCart, getAvailableUnits]);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const cartCount = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const getTotalCost = useCallback((dateRange?: DateRange): number => {
        if (!dateRange || !dateRange.from || !dateRange.to) {
            return 0;
        }

        const rentalDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24)) + 1;
        if (rentalDays <= 0) return 0;
        
        return cart.reduce((total, item) => {
            return total + (item.generator.pricePerDay * item.quantity * rentalDays);
        }, 0);

    }, [cart]);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            getTotalCost,
            getAvailableUnits,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

    