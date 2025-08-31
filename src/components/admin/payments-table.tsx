
"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Payment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/data-context";

const paymentSchema = z.object({
  bookingId: z.string({ required_error: "Please select a booking." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  method: z.string().min(3, { message: "Method must be at least 3 characters." }),
  status: z.enum(["Paid", "Unpaid"]),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function PaymentsTable() {
  const { payments, bookings, addPayment, updatePaymentStatus } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      method: "Credit Card",
      status: "Paid",
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    await addPayment(data);
    toast({ title: "Success", description: "Payment added successfully." });
    setIsDialogOpen(false);
    form.reset();
  };
  
  const handleUpdateStatus = async (paymentId: string, status: 'Paid' | 'Unpaid') => {
    await updatePaymentStatus(paymentId, status);
    toast({ title: "Status Updated", description: `Payment ${paymentId} marked as ${status}.` });
  };

  const getStatusVariant = (status: Payment['status']) => {
    switch (status) {
      case 'Paid':
        return 'outline';
      case 'Unpaid':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusClass = (status: Payment['status']) => {
    switch (status) {
      case 'Paid':
        return 'border-green-600 text-green-600';
      case 'Unpaid':
        return 'border-red-600 text-red-600 bg-red-500/10';
      default:
        return '';
    }
  };

  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments;
    return payments.filter(payment =>
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payments, searchTerm]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Search by Booking ID or Payment ID..."
                  className="pl-8 sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Add New Payment</DialogTitle>
                    <DialogDescription>
                      Fill in the details to add a new payment record.
                    </DialogDescription>
                  </DialogHeader>

                  <FormField
                    control={form.control}
                    name="bookingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Booking</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a booking" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bookings.map((booking) => (
                              <SelectItem key={booking.id} value={booking.id}>
                                {booking.customerName} ({booking.id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Credit Card" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Unpaid">Unpaid</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">Add Payment</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        {searchTerm && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Active Filters:</span>
            <Badge variant="secondary" className="pl-2">
              Search: &quot;{searchTerm}&quot;
              <button onClick={() => setSearchTerm('')} className="ml-1 rounded-full p-0.5 hover:bg-background/80">
                <X className="h-3 w-3" />
              </button>
            </Badge>
            <Button variant="ghost" onClick={() => setSearchTerm('')} className="h-auto p-1 text-sm">
              Reset All
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead className="hidden sm:table-cell">Method</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.bookingId}</TableCell>
                <TableCell className="hidden sm:table-cell">{payment.method}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant={getStatusVariant(payment.status)} className={getStatusClass(payment.status)}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {payment.transactionDate.toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">${payment.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => handleUpdateStatus(payment.id, 'Paid')} disabled={payment.status === 'Paid'}>
                        Mark as Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleUpdateStatus(payment.id, 'Unpaid')} disabled={payment.status === 'Unpaid'}>
                        Mark as Unpaid
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
