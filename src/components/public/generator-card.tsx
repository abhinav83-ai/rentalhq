
"use client";

import Image from 'next/image';
import type { Generator } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/public/add-to-cart-button';

interface GeneratorCardProps {
    generator: Generator;
}

const getAvailability = (generator: Generator) => {
    const availableCount = generator.units.filter(u => u.status === 'Available').length;
    if (availableCount > 0) {
        return { text: `${availableCount} Available`, variant: 'outline', className: 'border-green-600 text-green-600' } as const;
    }
    return { text: 'On Request', variant: 'secondary', className: '' } as const;
};

export function GeneratorCard({ generator }: GeneratorCardProps) {
    const availability = getAvailability(generator);

    return (
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <CardHeader className="p-0">
                <Image
                    src={generator.imageUrl}
                    width={600}
                    height={400}
                    alt={generator.name}
                    data-ai-hint="power generator"
                    className="aspect-video w-full object-cover"
                />
            </CardHeader>
            <CardContent className="p-6 grid gap-4 flex-grow">
                 <div className="flex justify-between items-start gap-2">
                    <CardTitle className="flex-1">{generator.name}</CardTitle>
                    <Badge variant={availability.variant} className={availability.className}>{availability.text}</Badge>
                </div>
                <div className="text-muted-foreground space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Capacity</span>
                        <span className="font-semibold text-foreground">{generator.capacity} kW</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fuel Type</span>
                        <span className="font-semibold text-foreground">{generator.fuelType}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Price / Day</span>
                        <span className="font-semibold text-foreground">${generator.pricePerDay.toLocaleString()}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-6 bg-muted/50 mt-auto">
                <AddToCartButton generator={generator} />
            </CardFooter>
        </Card>
    );
}
