
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useData } from '@/context/data-context';
import { ArrowRight, CheckCircle, Settings, Clock } from 'lucide-react';
import { AddToCartButton } from '@/components/public/add-to-cart-button';

export default function HomePage() {
  const { generators } = useData();
  const featuredGenerators = generators.filter(g => g.featured);

  return (
    <div className="flex flex-col min-h-screen">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card relative">
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10" />
           <Image
                src="https://picsum.photos/1800/1000"
                fill
                alt="Hero Background"
                data-ai-hint="industrial equipment"
                className="object-cover"
            />
          <div className="container px-4 md:px-6 z-20 relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-foreground">
                    Reliable Power, When You Need It Most
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Your trusted source for high-quality generator rentals. We offer a wide range of models to meet any power demand for your events, job sites, or emergency needs.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/generators">
                      Browse Generators <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="featured-generators" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Featured Generators</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out our most popular and reliable generators, perfect for a variety of needs.
                </p>
              </div>
            </div>
            <div className="mx-auto grid grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {featuredGenerators.map(generator => (
                <Card key={generator.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                  <CardHeader className="p-0">
                    <Image
                      src={generator.imageUrl}
                      width="600"
                      height="400"
                      alt={generator.name}
                      data-ai-hint="power generator"
                      className="aspect-video w-full object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-6 grid gap-4 flex-grow">
                    <CardTitle>{generator.name}</CardTitle>
                    <CardDescription>{generator.description}</CardDescription>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Capacity</span>
                      <span className="font-semibold text-foreground">{generator.capacity} kW</span>
                    </div>
                     <div className="flex justify-between items-center text-muted-foreground">
                      <span>Price / Day</span>
                      <span className="font-semibold text-foreground">${generator.pricePerDay.toLocaleString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 bg-muted/50">
                    <AddToCartButton generator={generator} />
                  </CardFooter>
                </Card>
              ))}
            </div>
             <div className="text-center">
                <Button asChild variant="outline">
                    <Link href="/generators">
                        View All Generators
                    </Link>
                </Button>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">How It Works</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Renting a generator is easy with our straightforward process.
                        </p>
                    </div>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center text-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <Settings className="w-10 h-10 text-primary"/>
                        </div>
                        <h3 className="text-xl font-bold">1. Select Your Generator</h3>
                        <p className="text-muted-foreground">Browse our catalog or use our AI recommender to find the perfect generator for your needs.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <Clock className="w-10 h-10 text-primary"/>
                        </div>
                        <h3 className="text-xl font-bold">2. Choose Your Dates</h3>
                        <p className="text-muted-foreground">Select your desired rental period using our simple calendar in the cart.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                            <CheckCircle className="w-10 h-10 text-primary"/>
                        </div>
                        <h3 className="text-xl font-bold">3. Confirm & Book</h3>
                        <p className="text-muted-foreground">Review your order, provide your details, and confirm your booking. We'll handle the rest!</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
  );
}
