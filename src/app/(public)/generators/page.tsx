
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/data-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Generator } from '@/lib/types';
import { GeneratorCard } from '@/components/public/generator-card';

type FuelTypeFilter = Generator['fuelType'] | 'All';

export default function GeneratorsPage() {
    const { generators } = useData();
    
    const { maxCapacity, maxPrice } = useMemo(() => {
        if (generators.length === 0) {
            return { maxCapacity: 1000, maxPrice: 500 };
        }
        return {
            maxCapacity: Math.max(...generators.map(g => g.capacity)),
            maxPrice: Math.max(...generators.map(g => g.pricePerDay)),
        };
    }, [generators]);

    const [capacityFilter, setCapacityFilter] = useState<number>(maxCapacity);
    const [priceFilter, setPriceFilter] = useState<number>(maxPrice);
    const [fuelTypeFilter, setFuelTypeFilter] = useState<FuelTypeFilter>('All');
    
    // Set initial filter values once max values are calculated
    useEffect(() => {
        setCapacityFilter(maxCapacity);
        setPriceFilter(maxPrice);
    }, [maxCapacity, maxPrice]);

    const filteredGenerators = useMemo(() => {
        return generators.filter(g => 
            g.capacity <= capacityFilter &&
            g.pricePerDay <= priceFilter &&
            (fuelTypeFilter === 'All' || g.fuelType === fuelTypeFilter)
        );
    }, [generators, capacityFilter, priceFilter, fuelTypeFilter]);


    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">Our Generator Fleet</h1>
                <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl mt-4">
                    Browse our selection of top-tier generators. We have the right power solution for your home, event, or job site.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="capacity-filter" className="flex justify-between mb-2">
                                    <span>Max Capacity</span>
                                    <span>{capacityFilter.toLocaleString()} kW</span>
                                </Label>
                                <Slider
                                    id="capacity-filter"
                                    min={0}
                                    max={maxCapacity}
                                    step={50}
                                    value={[capacityFilter]}
                                    onValueChange={(value) => setCapacityFilter(value[0])}
                                />
                            </div>
                             <div>
                                <Label htmlFor="price-filter" className="flex justify-between mb-2">
                                    <span>Max Price / Day</span>
                                    <span>${priceFilter.toLocaleString()}</span>
                                </Label>
                                <Slider
                                    id="price-filter"
                                    min={0}
                                    max={maxPrice}
                                    step={10}
                                    value={[priceFilter]}
                                    onValueChange={(value) => setPriceFilter(value[0])}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block">Fuel Type</Label>
                                <RadioGroup value={fuelTypeFilter} onValueChange={(value: FuelTypeFilter) => setFuelTypeFilter(value)} className="flex flex-wrap gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="All" id="fuel-all" />
                                        <Label htmlFor="fuel-all">All</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Diesel" id="fuel-diesel" />
                                        <Label htmlFor="fuel-diesel">Diesel</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Petrol" id="fuel-petrol" />
                                        <Label htmlFor="fuel-petrol">Petrol</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
                
                <main className="md:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGenerators.map(generator => (
                            <GeneratorCard key={generator.id} generator={generator} />
                        ))}
                         {filteredGenerators.length === 0 && (
                            <p className="col-span-full text-center text-muted-foreground">No generators match your criteria. Try adjusting the filters.</p>
                         )}
                    </div>
                </main>
            </div>
        </div>
    );
}
