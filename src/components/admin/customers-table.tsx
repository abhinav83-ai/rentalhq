
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
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, ListFilter, Search, X } from "lucide-react";
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
import type { Customer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/data-context";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "../ui/scroll-area";

const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  type: z.enum(["Online", "Offline"]),
});

type CustomerFormValues = z.infer<typeof customerSchema>;
type CustomerType = Customer['type'];

export function CustomersTable() {
  const { customers, addCustomer, updateCustomer } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  
  const [typeFilter, setTypeFilter] = useState<CustomerType | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      type: "Offline",
    },
  });

  const handleDialogOpen = (customer: Customer | null) => {
    setEditingCustomer(customer);
    if (customer) {
      form.reset(customer);
    } else {
      form.reset({ name: "", phone: "", address: "", type: "Offline" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: CustomerFormValues) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, data);
      toast({ title: "Success", description: "Customer updated successfully." });
    } else {
      await addCustomer(data);
      toast({ title: "Success", description: "Customer added successfully." });
    }
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  const filteredCustomers = useMemo(() => {
    let result = [...customers];
    if (searchTerm) {
        result = result.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    if (typeFilter !== 'All') {
        result = result.filter(c => c.type === typeFilter);
    }
    return result;
  }, [customers, typeFilter, searchTerm]);

  const isFiltered = typeFilter !== 'All' || searchTerm !== '';

  const resetFilters = () => {
    setTypeFilter('All');
    setSearchTerm('');
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={typeFilter === 'All'} onSelect={() => setTypeFilter('All')}>All</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={typeFilter === 'Online'} onSelect={() => setTypeFilter('Online')}>Online</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={typeFilter === 'Offline'} onSelect={() => setTypeFilter('Offline')}>Offline</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingCustomer(null);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto mt-2 sm:mt-0" onClick={() => handleDialogOpen(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the customer.
                    </DialogDescription>
                  </DialogHeader>
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="e.g., (123) 456-7890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Textarea placeholder="e.g., 123 Main St, Anytown, USA" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Online">Online</SelectItem>
                          <SelectItem value="Offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter>
                    <Button type="submit">Save Customer</Button>
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
                <button onClick={() => setSearchTerm('')} className="ml-1 rounded-full p-0.5 hover:bg-background/80"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {typeFilter !== 'All' && (
              <Badge variant="secondary" className="pl-2">
                Type: {typeFilter}
                <button onClick={() => setTypeFilter('All')} className="ml-1 rounded-full p-0.5 hover:bg-background/80"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            <Button variant="ghost" onClick={resetFilters} className="h-auto p-1 text-sm">Reset All</Button>
          </div>
        )}
      </div>
      <div className="rounded-md border mt-4">
        <ScrollArea className="w-full whitespace-nowrap">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Total Bookings</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="font-medium">{customer.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">{customer.phone}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">{customer.address}</div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={customer.type === 'Online' ? 'outline' : 'secondary'}
                    className={customer.type === 'Online' ? 'border-green-600 text-green-600' : ''}
                  >
                    {customer.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{customer.totalBookings}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleDialogOpen(customer)}>Edit</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </ScrollArea>
      </div>
    </>
  );
}
