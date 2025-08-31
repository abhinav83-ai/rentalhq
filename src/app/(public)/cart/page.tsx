
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Minus, Plus, Trash2, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useData } from '@/context/data-context';
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from '@/components/ui/label';
import { OutOfStockModal } from '@/components/public/out-of-stock-modal';
import type { Generator } from '@/lib/types';

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  address: z.string().min(5, "Please enter a valid address."),
  dates: z.object({
    from: z.date({ required_error: "Start date is required." }),
    to: z.date({ required_error: "End date is required." }),
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function CartPage() {
  const router = useRouter();
  const { customers, addCustomer, addBooking } = useData();
  const { cart, updateQuantity, removeFromCart, clearCart, getTotalCost } = useCart();
  const [date, setDate] = useState<DateRange | undefined>({ from: new Date(), to: addDays(new Date(), 7)});
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [bookingId, setBookingId] = useState('');
  
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const [outOfStockGenerator, setOutOfStockGenerator] = useState<Generator | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { dates: { from: date?.from, to: date?.to }},
  });

  const totalCost = getTotalCost(date);
  const rentalDays = date?.from && date?.to ? Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 3600 * 24)) +1 : 0;

  const handleUpdateQuantity = (generator: Generator, newQuantity: number) => {
    const success = updateQuantity(generator.id, newQuantity);
    if (!success) {
      setOutOfStockGenerator(generator);
      setShowOutOfStockModal(true);
    }
  };

  const onSubmit = (data: BookingFormValues) => {
    // In a real app, you'd send an OTP here. We'll simulate it.
    setShowOtpDialog(true);
  };
  
  const handleOtpVerification = async () => {
    const formData = form.getValues();
    // Find if customer already exists, if not, create one
    let customer = customers.find(c => c.phone === formData.phone);
    if (!customer) {
        const newCustomerData = {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            type: 'Online' as const,
        };
        customer = await addCustomer(newCustomerData);
    }
    
    // Logic to select specific units - this part is tricky without a proper inventory system.
    // For now, we'll assume the units are available and let the backend handle real allocation.
    // This is a simplified representation.
    let bookedUnits: { id: string; serialNumber: string }[] = [];
    const tempGenerators = JSON.parse(JSON.stringify(cart.map(i => i.generator)));

    cart.forEach(item => {
        const availableUnits = tempGenerators
            .find((g: Generator) => g.id === item.generator.id)?.units
            .filter((u: any) => u.status === 'Available');
        
        const unitsToBook = availableUnits.slice(0, item.quantity);
        unitsToBook.forEach((u: any) => {
            bookedUnits.push({ id: u.id, serialNumber: u.serialNumber });
        });
    });
    
    const newBookingId = 'B' + String(Math.random()).substring(2, 8);
    setBookingId(newBookingId);

    // Create a single booking for the entire cart
    await addBooking({
        customerId: customer.id,
        customerName: customer.name,
        generatorId: cart.map(i => i.generator.id).join(', '), // Could be multiple models
        generatorName: cart.map(i => `${i.generator.name} (x${i.quantity})`).join(', '),
        startDate: formData.dates.from,
        endDate: formData.dates.to,
        totalCost,
        bookedUnits,
        source: 'Online',
    });
    
    clearCart();
    setShowOtpDialog(false);
    setShowConfirmationDialog(true);
  };

  const handleConfirmationClose = () => {
      setShowConfirmationDialog(false);
      router.push(`/confirmation?bookingId=${bookingId}`);
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingCartIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added any generators yet.</p>
        <Button asChild className="mt-6">
          <Link href="/generators">Browse Generators</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 font-headline">Your Rental Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
                <Card key={item.generator.id} className="flex flex-col sm:flex-row items-center p-4">
                     <Image
                        src={item.generator.imageUrl}
                        width={120}
                        height={90}
                        alt={item.generator.name}
                        data-ai-hint="power generator"
                        className="rounded-md object-cover aspect-[4/3] w-full sm:w-[120px]"
                    />
                    <div className="ml-0 sm:ml-4 mt-4 sm:mt-0 flex-grow w-full">
                        <h3 className="font-semibold">{item.generator.name}</h3>
                        <p className="text-sm text-muted-foreground">${item.generator.pricePerDay.toLocaleString()} / day</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.generator, item.quantity - 1)}><Minus className="h-4 w-4"/></Button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleUpdateQuantity(item.generator, item.quantity + 1)}><Plus className="h-4 w-4"/></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-0 sm:ml-4 mt-4 sm:mt-0 text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.generator.id)}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </Card>
            ))}
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>Fill out the form below to reserve your generators.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem><FormLabel>Delivery Address</FormLabel><FormControl><Textarea placeholder="123 Main St, Anytown, USA" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="dates" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Rental Period</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (date.to ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}` : format(date.from, "LLL dd, y")) : <span>Pick a date range</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={date?.from}
                              selected={date}
                              onSelect={(range) => { setDate(range); field.onChange(range); }}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <div className="space-y-2">
                      <div className="flex justify-between"><span>Subtotal ({rentalDays} days)</span> <span>${totalCost.toLocaleString()}</span></div>
                      <div className="flex justify-between text-lg font-bold"><span>Total</span> <span>${totalCost.toLocaleString()}</span></div>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        This is a booking request. We will contact you to confirm availability and process payment.
                    </AlertDescription>
                   </Alert>
                  <Button type="submit" className="w-full" size="lg">Request to Book</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Your Phone Number</AlertDialogTitle>
            <AlertDialogDescription>
              We've sent a one-time password (OTP) to your phone. Please enter it below to confirm your booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="otp">OTP Code</Label>
            <Input 
              id="otp" 
              placeholder="123456" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
            <p className="text-xs text-muted-foreground">For this demo, any 6-digit code will work.</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOtpVerification} disabled={otp.length !== 6}>Verify & Book</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Request Sent!</AlertDialogTitle>
            <AlertDialogDescription>
              Your request has been submitted. We will contact you shortly to confirm availability and process payment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmationClose}>View Confirmation</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    {showOutOfStockModal && outOfStockGenerator && (
        <OutOfStockModal
            generator={outOfStockGenerator}
            isOpen={showOutOfStockModal}
            onClose={() => {
                setShowOutOfStockModal(false);
                setOutOfStockGenerator(null);
            }}
        />
    )}
    </>
  );
}

function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    )
}
