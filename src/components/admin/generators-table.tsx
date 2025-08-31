
"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, type FC } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { MoreHorizontal, PlusCircle, ListFilter, Search, X, ArrowDownUp, Trash2, ChevronDown, ChevronRight } from "lucide-react";
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
import type { Generator, GeneratorUnit } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useData } from "@/context/data-context";

const unitSchema = z.object({
  id: z.string(),
  serialNumber: z.string().min(3, "Serial number must be at least 3 characters."),
  status: z.enum(["Available", "Rented", "Maintenance"]),
});

const generatorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  capacity: z.coerce.number().positive({ message: "Capacity must be a positive number." }),
  pricePerDay: z.coerce.number().positive({ message: "Price/Day must be a positive number." }),
  pricePerMonth: z.coerce.number().positive({ message: "Price/Month must be a positive number." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  fuelType: z.enum(['Diesel', 'Petrol']),
  units: z.array(unitSchema).min(0),
});

type GeneratorFormValues = z.infer<typeof generatorSchema>;
type GeneratorStatus = GeneratorUnit['status'];
type SortKey = 'capacity' | 'pricePerDay';
type SortDirection = 'asc' | 'desc';

const getStatusVariant = (status: GeneratorStatus) => {
  switch (status) {
    case 'Available': return 'outline';
    case 'Rented': return 'secondary';
    case 'Maintenance': return 'destructive';
    default: return 'default';
  }
};

const getStatusClass = (status: GeneratorStatus) => {
  switch (status) {
    case 'Available': return 'border-green-600 text-green-600';
    case 'Rented': return 'border-blue-600 text-blue-600';
    case 'Maintenance': return 'border-amber-600 text-amber-600 bg-amber-500/10';
    default: return '';
  }
};

const GeneratorRow: FC<{ 
  generator: Generator;
  onEdit: (generator: Generator) => void;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ generator, onEdit, isExpanded, onToggle }) => {
  const statusCounts = useMemo(() => {
    return generator.units.reduce((acc, unit) => {
      acc[unit.status] = (acc[unit.status] || 0) + 1;
      return acc;
    }, {} as Record<GeneratorStatus, number>);
  }, [generator.units]);

  const hasMultipleUnits = generator.units.length > 1;
  console.log(generator, "generator");
  
  return (
    <>
      <TableRow>
        <TableCell>
          {hasMultipleUnits ? (
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
             <span className="inline-block w-8 h-8"></span>
          )}
        </TableCell>
        <TableCell className="hidden sm:table-cell">
          <Image
            alt={generator.name}
            className="aspect-square rounded-md object-cover"
            data-ai-hint="power generator"
            height="64"
            src={generator.imageUrl}
            width="64"
          />
        </TableCell>
        <TableCell>
          <div className="font-medium">{generator.name}</div>
          <div className="text-sm text-muted-foreground">{generator.units.length} {generator.units.length > 1 ? 'units' : 'unit'}</div>
        </TableCell>
        <TableCell>
            <div className="flex flex-wrap gap-1">
                {Object.entries(statusCounts).map(([status, count]) => (
                    <Badge key={status} variant={getStatusVariant(status as GeneratorStatus)} className={getStatusClass(status as GeneratorStatus)}>
                        {count} {status}
                    </Badge>
                ))}
            </div>
        </TableCell>
        <TableCell className="hidden md:table-cell">{generator.capacity} kW</TableCell>
        <TableCell className="hidden md:table-cell">${generator.pricePerDay.toLocaleString()}</TableCell>
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
              <DropdownMenuItem onClick={() => onEdit(generator)}>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      {isExpanded && hasMultipleUnits && (
        <TableRow>
          <TableCell colSpan={7} className="p-0">
            <div className="p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">Individual Units</h4>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Serial Number</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {generator.units.map(unit => (
                            <TableRow key={unit.id}>
                                <TableCell>{unit.serialNumber}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(unit.status)} className={getStatusClass(unit.status)}>
                                        {unit.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};


export function GeneratorsTable() {
  const { generators, addGenerator, updateGenerator } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGenerator, setEditingGenerator] = useState<Generator | null>(null);
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<GeneratorStatus | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'capacity', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const form = useForm<GeneratorFormValues>({
    resolver: zodResolver(generatorSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "units",
  });

  useEffect(() => {
    if (editingGenerator) {
      form.reset(editingGenerator);
    } else {
      form.reset({
        name: "",
        capacity: 0,
        pricePerDay: 0,
        pricePerMonth: 0,
        imageUrl: `https://picsum.photos/400/${300 + generators.length}`,
        fuelType: 'Diesel',
        units: [{ id: `U${Date.now()}`, serialNumber: "", status: "Available" }],
      });
    }
  }, [editingGenerator, form, isDialogOpen, generators.length]);


  const handleDialogOpen = (generator: Generator | null) => {
    setEditingGenerator(generator);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: GeneratorFormValues) => {
    if (editingGenerator) {
      await updateGenerator(editingGenerator.id, data);
      toast({ title: "Success", description: "Generator model updated successfully." });
    } else {
      await addGenerator(data);
      toast({ title: "Success", description: "Generator model added successfully." });
    }
    setIsDialogOpen(false);
    setEditingGenerator(null);
  };
  
  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredAndSortedGenerators = useMemo(() => {
    let result = generators.filter(g => g.units.length > 0);

    if (searchTerm) {
        result = result.filter(g => 
            g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.units.some(u => u.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    if (statusFilter !== 'All') {
        result = result.filter(g => g.units.some(u => u.status === statusFilter));
    }
    
    result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    return result;
  }, [generators, statusFilter, sortConfig, searchTerm]);

  const isFiltered = statusFilter !== 'All' || searchTerm !== '' || sortConfig.key !== 'capacity' || sortConfig.direction !== 'desc';

  const resetFilters = () => {
    setStatusFilter('All');
    setSearchTerm('');
    setSortConfig({ key: 'capacity', direction: 'desc' });
  }
  
  const getSortLabel = (key: SortKey, direction: SortDirection) => {
    const label = key === 'capacity' ? 'Capacity' : 'Price/Day';
    const dir = direction === 'asc' ? 'Asc' : 'Desc';
    return `${label} (${dir})`;
  }

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
              <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search models or serials..."
                      className="pl-8 sm:w-[200px] lg:w-[300px]"
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
                  <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Filter by Unit Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked={statusFilter === 'All'} onSelect={() => setStatusFilter('All')}>All</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={statusFilter === 'Available'} onSelect={() => setStatusFilter('Available')}>Available</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={statusFilter === 'Rented'} onSelect={() => setStatusFilter('Rented')}>Rented</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={statusFilter === 'Maintenance'} onSelect={() => setStatusFilter('Maintenance')}>Maintenance</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 gap-1">
                      <ArrowDownUp className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Sort</span>
                  </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={sortConfig.key === 'capacity'} onSelect={() => handleSort('capacity')}>Capacity</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={sortConfig.key === 'pricePerDay'} onSelect={() => handleSort('pricePerDay')}>Price/Day</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingGenerator(null);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleDialogOpen(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Generator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>{editingGenerator ? "Edit Generator Model" : "Add New Generator Model"}</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the generator model and manage its individual units.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Model Details</h3>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="e.g., CAT G3516" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="capacity" render={({ field }) => (
                            <FormItem><FormLabel>Capacity (kW)</FormLabel><FormControl><Input type="number" placeholder="1500" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="pricePerDay" render={({ field }) => (
                            <FormItem><FormLabel>Price/Day ($)</FormLabel><FormControl><Input type="number" placeholder="500" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="pricePerMonth" render={({ field }) => (
                            <FormItem><FormLabel>Price/Month ($)</FormLabel><FormControl><Input type="number" placeholder="12000" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="fuelType" render={({ field }) => (
                            <FormItem><FormLabel>Fuel Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Diesel">Diesel</SelectItem>
                                        <SelectItem value="Petrol">Petrol</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://picsum.photos/400/300" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Manage Units</h3>
                            <Button type="button" size="sm" variant="outline" onClick={() => append({ id: `U${Date.now()}`, serialNumber: '', status: 'Available' })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Unit
                            </Button>
                        </div>
                        {fields.length > 0 && (
                          <>
                            <Separator />
                            <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
                              {fields.map((field, index) => (
                                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-2 border rounded-md">
                                      <div className="col-span-5">
                                          <FormField control={form.control} name={`units.${index}.serialNumber`} render={({ field }) => (
                                              <FormItem><FormLabel className="text-xs">Serial Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                          )}/>
                                      </div>
                                      <div className="col-span-6">
                                        <Controller
                                            control={form.control}
                                            name={`units.${index}.status`}
                                            render={({ field }) => (
                                              <FormItem><FormLabel className="text-xs">Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Available">Available</SelectItem>
                                                        <SelectItem value="Rented">Rented</SelectItem>
                                                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                              <FormMessage /></FormItem>
                                            )}
                                        />
                                      </div>
                                      <div className="col-span-1 pt-7">
                                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)}>
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                      </div>
                                  </div>
                              ))}
                            </div>
                          </>
                        )}
                         {form.formState.errors.units && typeof form.formState.errors.units.message === 'string' && (
                            <p className="text-sm font-medium text-destructive">{form.formState.errors.units.message}</p>
                        )}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">Save Generator</Button>
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
            {statusFilter !== 'All' && (
                <Badge variant="secondary" className="pl-2">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('All')} className="ml-1 rounded-full p-0.5 hover:bg-background/80"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {(sortConfig.key !== 'capacity' || sortConfig.direction !== 'desc') && (
              <Badge variant="secondary" className="pl-2">
                Sort: {getSortLabel(sortConfig.key, sortConfig.direction)}
                <button onClick={() => setSortConfig({ key: 'capacity', direction: 'desc' })} className="ml-1 rounded-full p-0.5 hover:bg-background/80"><X className="h-3 w-3" /></button>
              </Badge>
            )}
            <Button variant="ghost" onClick={resetFilters} className="h-auto p-1 text-sm">Reset All</Button>
          </div>
        )}
      </div>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status Overview</TableHead>
              <TableHead className="hidden md:table-cell">Capacity</TableHead>
              <TableHead className="hidden md:table-cell">Price/Day</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedGenerators.map((generator) => (
              <GeneratorRow 
                key={generator.id} 
                generator={generator} 
                onEdit={handleDialogOpen}
                isExpanded={!!expandedRows[generator.id]}
                onToggle={() => toggleRow(generator.id)}
              />
            ))}
             {filteredAndSortedGenerators.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                    No generators found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
