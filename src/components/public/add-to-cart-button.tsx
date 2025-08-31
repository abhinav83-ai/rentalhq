
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import type { Generator } from '@/lib/types';
import { OutOfStockModal } from '@/components/public/out-of-stock-modal';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface AddToCartButtonProps {
    generator: Generator;
}

export function AddToCartButton({ generator }: AddToCartButtonProps) {
    const { addToCart, cart, updateQuantity, getAvailableUnits, removeFromCart } = useCart();
    const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
    
    const itemInCart = cart.find(item => item.generator.id === generator.id);
    const quantityInCart = itemInCart?.quantity || 0;
    const totalAvailableUnits = getAvailableUnits(generator.id);
    const trulyAvailableUnits = totalAvailableUnits - quantityInCart;

    const handleBookNowClick = () => {
        if (trulyAvailableUnits > 0) {
            addToCart(generator);
        } else {
            setShowOutOfStockModal(true);
        }
    };
    
    const handleUpdateQuantity = (newQuantity: number) => {
        const success = updateQuantity(generator.id, newQuantity);
        if (!success) {
            setShowOutOfStockModal(true);
        }
    };

    return (
        <>
            {quantityInCart > 0 ? (
                <div className="flex items-center justify-between w-full">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleUpdateQuantity(quantityInCart - 1)}>
                        {quantityInCart === 1 ? <Trash2 className="h-4 w-4 text-destructive"/> : <Minus className="h-4 w-4"/>}
                    </Button>
                    <span className="w-10 text-center font-medium">{quantityInCart}</span>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleUpdateQuantity(quantityInCart + 1)}>
                        <Plus className="h-4 w-4"/>
                    </Button>
                </div>
            ) : (
                <Button 
                    className="w-full"
                    onClick={handleBookNowClick}
                >
                    Book Now
                </Button>
            )}

            {showOutOfStockModal && (
                <OutOfStockModal
                    generator={generator}
                    isOpen={showOutOfStockModal}
                    onClose={() => setShowOutOfStockModal(false)}
                />
            )}
        </>
    );
}
