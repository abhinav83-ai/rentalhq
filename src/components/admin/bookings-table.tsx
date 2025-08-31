
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
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
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, ArrowUpRight, ListFilter, ArrowDownUp, Search, X, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import type { Booking } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useData } from "@/context/data-context";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

type BookingStatus = Booking['status'];
type SortDirection = 'asc' | 'desc';

interface BookingsTableProps {
  showViewAll?: boolean;
}

const bookingSchema = z.object({
  customerId: z.string({ required_error: "Please select a customer." }),
  generatorId: z.string({ required_error: "Please select a generator model." }),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  dates: z.object({
    from: z.date({ required_error: "Start date is required." }),
    to: z.date({ required_error: "End date is required." }),
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export function BookingsTable({ showViewAll = false }: BookingsTableProps) {
  const { bookings, updateBookingStatus, customers, generators, addBooking } = useData();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'All'>('All');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState("");
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      quantity: 1,
      dates: {
        from: new Date(),
        to: addDays(new Date(), 7),
      },
    },
  });

  const selectedGeneratorId = form.watch("generatorId");
  
  const availableUnitsForSelectedModel = useMemo(() => {
    if (!selectedGeneratorId) return 0;
    const generator = generators.find(g => g.id === selectedGeneratorId);
    return generator ? generator.units.filter(u => u.status === 'Available').length : 0;
  }, [selectedGeneratorId, generators]);
  
  useEffect(() => {
    form.register("quantity", { max: { value: availableUnitsForSelectedModel, message: `Only ${availableUnitsForSelectedModel} units available.` } });
  }, [availableUnitsForSelectedModel, form]);


  const handleApprove = async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'Approved');
    toast({ title: "Success", description: `Booking ${bookingId} has been approved.` });
  };

  const handleReject = async () => {
    if (selectedBooking) {
      await updateBookingStatus(selectedBooking.id, 'Rejected');
      toast({ title: "Success", description: `Booking ${selectedBooking.id} has been rejected.`, variant: "destructive" });
      setIsRejectDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const openRejectDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsRejectDialogOpen(true);
  };

  const openDetailsDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsDialogOpen(true);
  };
  
  const handleAddBooking = async (data: BookingFormValues) => {
    const customer = customers.find(c => c.id === data.customerId);
    const generator = generators.find(g => g.id === data.generatorId);

    if (!customer || !generator) {
      toast({ variant: "destructive", title: "Error", description: "Invalid customer or generator selected." });
      return;
    }
    
    if (data.quantity > availableUnitsForSelectedModel) {
        form.setError("quantity", { type: "manual", message: `Only ${availableUnitsForSelectedModel} units are available.` });
        return;
    }
    
    const availableUnits = generator.units.filter(u => u.status === 'Available').slice(0, data.quantity);

    const rentalDays = Math.ceil((data.dates.to.getTime() - data.dates.from.getTime()) / (1000 * 3600 * 24));
    const totalCost = generator.pricePerDay * data.quantity * rentalDays;

    await addBooking({
        customerId: customer.id,
        customerName: customer.name,
        generatorId: generator.id,
        generatorName: `${generator.name} (x${data.quantity})`,
        startDate: data.dates.from,
        endDate: data.dates.to,
        source: 'Manual',
        bookedUnits: availableUnits.map(u => ({ id: u.id, serialNumber: u.serialNumber })),
        totalCost,
    });
    
    toast({ title: "Success", description: "New booking has been created." });
    setIsAddDialogOpen(false);
    form.reset();
  };

  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'Approved':
        return 'outline';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  const getStatusClass = (status: Booking['status']) => {
    switch (status) {
      case 'Approved':
        return 'border-green-600 text-green-600';
      case 'Pending':
        return 'border-amber-600 text-amber-600';
      case 'Rejected':
         return 'border-red-600 text-red-600 bg-red-500/10';
      default:
        return '';
    }
  };

  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    if (searchTerm) {
      result = result.filter(booking =>
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.generatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(booking => booking.status === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = a.startDate.getTime();
      const dateB = b.startDate.getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return result;
  }, [bookings, statusFilter, sortDirection, searchTerm]);

  const displayedBookings = showViewAll ? filteredAndSortedBookings.slice(0, 5) : filteredAndSortedBookings;
  
  const isFiltered = statusFilter !== 'All' || searchTerm !== '' || sortDirection !== 'desc';

  const resetFilters = () => {
    setStatusFilter('All');
    setSearchTerm('');
    setSortDirection('desc');
  };

  return (
    <>
      {!showViewAll && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search bookings..."
                      className="pl-8 w-full sm:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter by Status
                      </span>
                      {statusFilter !== 'All' && <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">{1}</Badge>}
                  </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={statusFilter === 'All'}
                        onSelect={() => setStatusFilter('All')}
                    >
                        All
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={statusFilter === 'Pending'}
                        onSelect={() => setStatusFilter('Pending')}
                    >
                        Pending
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={statusFilter === 'Approved'}
                        onSelect={() => setStatusFilter('Approved')}
                    >
                        Approved
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={statusFilter === 'Rejected'}
                        onSelect={() => setStatusFilter('Rejected')}
                    >
                        Rejected
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-10 gap-1"
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                  <ArrowDownUp className="h-3.5 w-3.5" />
                  <span>Sort by Date</span>
              </Button>
            </div>
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="w-full sm:w-auto mt-2 sm:mt-0">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Booking
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Manual Booking</DialogTitle>
                        <DialogDescription>
                            Enter the details for a new offline or phone booking.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddBooking)} className="space-y-4">
                             <FormField control={form.control} name="customerId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a customer" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="generatorId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Generator Model</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a generator" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {generators.map(g => <SelectItem key={g.id} value={g.id}>{g.name} ({g.capacity} kW)</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="quantity" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl><Input type="number" min="1" max={availableUnitsForSelectedModel} {...field} /></FormControl>
                                     <p className="text-xs text-muted-foreground">{availableUnitsForSelectedModel} units available for this model.</p>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="dates" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Rental Period</FormLabel>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value.from && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value.from ? (field.value.to ? `${format(field.value.from, "LLL dd, y")} - ${format(field.value.to, "LLL dd, y")}` : format(field.value.from, "LLL dd, y")) : <span>Pick a date range</span>}
                                        </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={field.value.from}
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            numberOfMonths={1}
                                        />
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <DialogFooter>
                                <Button type="submit">Create Booking</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
             </Dialog>
          </div>
          {isFiltered && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active Filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="pl-2">
                  Search: &quot;{searchTerm}&quot;
                  <button onClick={() => setSearchTerm('')} className="ml-1 rounded-full p-0.5 hover:bg-background/80">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== 'All' && (
                 <Badge variant="secondary" className="pl-2">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('All')} className="ml-1 rounded-full p-0.5 hover:bg-background/80">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {sortDirection !== 'desc' && (
                 <Badge variant="secondary" className="pl-2">
                  Sort: Ascending
                  <button onClick={() => setSortDirection('desc')} className="ml-1 rounded-full p-0.5 hover:bg-background/80">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
               <Button variant="ghost" onClick={resetFilters} className="h-auto p-1 text-sm">
                Reset All
              </Button>
            </div>
          )}
        </div>
      )}
      <div className="rounded-md border mt-4">
        <ScrollArea className="w-full whitespace-nowrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Generator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="font-medium">{booking.customerName}</div>
                  <div className="text-sm text-muted-foreground">{booking.id}</div>
                </TableCell>
                <TableCell>{booking.generatorName}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(booking.status)} className={getStatusClass(booking.status)}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  ${booking.totalCost.toLocaleString()}
                </TableCell>
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
                      <DropdownMenuItem onSelect={() => handleApprove(booking.id)} disabled={booking.status === 'Approved'}>
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => openRejectDialog(booking)} disabled={booking.status === 'Rejected'} className="text-destructive focus:text-destructive">
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => openDetailsDialog(booking)}>View Details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {displayedBookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </ScrollArea>
        {showViewAll && bookings.length > 5 && (
          <div className="flex items-center justify-end p-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/bookings">
                View All
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently reject the booking for <span className="font-semibold">{selectedBooking?.customerName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedBooking(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>
              Reject Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-lg">
              <DialogHeader>
                  <DialogTitle>Booking Details</DialogTitle>
                  <DialogDescription>
                      Full details for booking ID: {selectedBooking?.id}
                  </DialogDescription>
              </DialogHeader>
              {selectedBooking && (
                  <div className="space-y-4 py-4 text-sm">
                      <div className="grid grid-cols-3 gap-2">
                          <p className="font-semibold text-muted-foreground">Booking ID</p>
                          <p className="col-span-2">{selectedBooking.id}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                          <p className="font-semibold text-muted-foreground">Customer Name</p>
                          <p className="col-span-2">{selectedBooking.customerName}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                          <p className="font-semibold text-muted-foreground">Generator</p>
                          <p className="col-span-2">{selectedBooking.generatorName}</p>
                      </div>
                       <div className="grid grid-cols-3 gap-2">
                          <p className="font-semibold text-muted-foreground">Rental Period</p>
                          <p className="col-span-2">{format(selectedBooking.startDate, 'PPP')} - {format(selectedBooking.endDate, 'PPP')}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                          <p className="font-semibold text-muted-foreground">Total Cost</p>
                          <p className="col-span-2">${selectedBooking.totalCost.toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                          <p className="font-semibold text-muted-foreground">Status</p>
                           <div className="col-span-2">
                                <Badge variant={getStatusVariant(selectedBooking.status)} className={`w-fit ${getStatusClass(selectedBooking.status)}`}>
                                    {selectedBooking.status}
                                </Badge>
                           </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                          <p className="font-semibold text-muted-foreground">Source</p>
                          <p className="col-span-2">{selectedBooking.source}</p>
                      </div>
                       <div className="grid grid-cols-3 gap-2 items-start">
                          <p className="font-semibold text-muted-foreground">Booked Units</p>
                          <div className="col-span-2 space-y-1">
                              {selectedBooking.bookedUnits.map(unit => (
                                  <p key={unit.id} className="font-mono text-xs bg-muted p-1 rounded-sm">{unit.serialNumber}</p>
                              ))}
                          </div>
                      </div>
                  </div>
              )}
          </DialogContent>
      </Dialog>
    </>
  );
}
