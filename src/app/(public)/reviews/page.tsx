
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const reviewSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters."),
  rating: z.coerce.number().min(1, "Please select a rating.").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(500, "Comment cannot exceed 500 characters."),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function ReviewsPage() {
    const { reviews, addReview } = useData();
    const { toast } = useToast();

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            customerName: '',
            rating: 5,
            comment: ''
        }
    });

    const onSubmit = async (data: ReviewFormValues) => {
        await addReview(data);
        toast({
            title: "Review Submitted!",
            description: "Thank you for your feedback.",
        });
        form.reset();
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">Customer Testimonials</h1>
                <p className="max-w-3xl mx-auto text-muted-foreground md:text-xl mt-4">
                    See what our satisfied customers have to say about our service and equipment.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {reviews.map(review => (
                        <Card key={review.id}>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div>
                                        <CardTitle>{review.customerName}</CardTitle>
                                        <CardDescription>{format(review.date, 'PPP')}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{review.comment}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave a Review</CardTitle>
                            <CardDescription>Share your experience with us.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField control={form.control} name="customerName" render={({ field }) => (
                                        <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="John D." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="rating" render={({ field }) => (
                                        <FormItem className="space-y-3"><FormLabel>Rating</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} defaultValue={String(field.value)} className="flex">
                                                    {[1,2,3,4,5].map(value => (
                                                        <FormItem key={value} className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value={String(value)} id={`r${value}`} />
                                                            </FormControl>
                                                            <Label htmlFor={`r${value}`}>{value}</Label>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                        <FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="comment" render={({ field }) => (
                                        <FormItem><FormLabel>Your Feedback</FormLabel><FormControl><Textarea placeholder="Tell us about your rental..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <Button type="submit" className="w-full">Submit Review</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
