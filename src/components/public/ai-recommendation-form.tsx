
"use "
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { findGenerator } from '@/ai/flows/recommend-generator-flow';
import type { Generator } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const recommendationSchema = z.object({
  useCase: z.string({ required_error: "Please select a use case." }),
  powerNeeds: z.coerce.number().min(1, "Please enter your power requirement."),
  budget: z.string({ required_error: "Please select your budget." }),
});

type RecommendationFormValues = z.infer<typeof recommendationSchema>;

export function AiRecommendationForm() {
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState<Generator | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<RecommendationFormValues>({
        resolver: zodResolver(recommendationSchema),
    });

    const onSubmit = async (data: RecommendationFormValues) => {
        setLoading(true);
        setRecommendation(null);
        setError(null);
        try {
            const result = await findGenerator(data);
            if (result) {
                setRecommendation(result);
            } else {
                setError("Sorry, we couldn't find a matching generator based on your needs. Please try adjusting your criteria.");
            }
        } catch (e) {
            setError("An unexpected error occurred. Please try again later.");
            console.error(e);
        }
        setLoading(false);
    };
    
    if (recommendation) {
        return (
             <Card className="w-full">
                <CardHeader>
                    <CardTitle>We Recommend</CardTitle>
                    <CardDescription>Based on your needs, here is our top suggestion.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <Image
                            src={recommendation.imageUrl}
                            width={200}
                            height={150}
                            alt={recommendation.name}
                            data-ai-hint="power generator"
                            className="rounded-lg object-cover aspect-[4/3]"
                        />
                        <div className="space-y-2">
                             <h3 className="text-xl font-bold">{recommendation.name}</h3>
                             <p className="text-muted-foreground">{recommendation.description}</p>
                             <div className="flex gap-4 pt-2">
                                <Button asChild>
                                    <Link href={`/generators/${recommendation.id}`}>View Details</Link>
                                </Button>
                                <Button variant="ghost" onClick={() => setRecommendation(null)}>Start Over</Button>
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="useCase" render={({ field }) => (
                            <FormItem><FormLabel>What will you use it for?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a use case" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Home Backup">Home Backup</SelectItem>
                                        <SelectItem value="Construction Site">Construction Site</SelectItem>
                                        <SelectItem value="Outdoor Event">Outdoor Event</SelectItem>
                                        <SelectItem value="Commercial/Industrial">Commercial/Industrial</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="powerNeeds" render={({ field }) => (
                            <FormItem><FormLabel>What are your power needs (in kW)?</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="budget" render={({ field }) => (
                            <FormItem><FormLabel>What's your daily budget?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a budget range" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Economy">Economy ($0 - $200)</SelectItem>
                                        <SelectItem value="Standard">Standard ($201 - $500)</SelectItem>
                                        <SelectItem value="Premium">Premium ($501+)</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : "Get Recommendation"}
                        </Button>
                        {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
