
"use client";

import { useState, useMemo } from "react";
import { useData } from "@/context/data-context";
import type { Inquiry } from "@/lib/types";
import { format } from "date-fns";
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
import { MoreHorizontal, ListFilter, Search, X, ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type InquiryStatus = Inquiry['status'];
type SortDirection = 'asc' | 'desc';

export function InquiriesTable() {
  const { inquiries, updateInquiryStatus } = useData();
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'All'>('All');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateStatus = async (inquiryId: string, status: InquiryStatus) => {
    await updateInquiryStatus(inquiryId, status);
    toast({ title: "Status Updated", description: `Inquiry marked as ${status}.` });
  };

  const getStatusClass = (status: InquiryStatus) => {
    switch (status) {
      case 'New':
        return 'border-blue-600 text-blue-600';
      case 'Contacted':
        return 'border-green-600 text-green-600';
      default:
        return '';
    }
  };

  const filteredAndSortedInquiries = useMemo(() => {
    let result = [...inquiries];

    if (searchTerm) {
      result = result.filter(inquiry =>
        inquiry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.generatorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(inquiry => inquiry.status === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = a.date.getTime();
      const dateB = b.date.getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [inquiries, statusFilter, sortDirection, searchTerm]);

  const isFiltered = statusFilter !== 'All' || searchTerm !== '';

  const resetFilters = () => {
    setStatusFilter('All');
    setSearchTerm('');
    setSortDirection('desc');
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search inquiries..."
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
                <DropdownMenuCheckboxItem checked={statusFilter === 'All'} onSelect={() => setStatusFilter('All')}>All</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilter === 'New'} onSelect={() => setStatusFilter('New')}>New</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilter === 'Contacted'} onSelect={() => setStatusFilter('Contacted')}>Contacted</DropdownMenuCheckboxItem>
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
            <Button variant="ghost" onClick={resetFilters} className="h-auto p-1 text-sm">Reset All</Button>
            </div>
        )}
      </div>

      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Generator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedInquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell>
                  <div className="font-medium">{inquiry.customerName}</div>
                  <div className="text-sm text-muted-foreground">{inquiry.customerPhone}</div>
                </TableCell>
                <TableCell>{inquiry.generatorName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusClass(inquiry.status)}>
                    {inquiry.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(inquiry.date, 'PPP')}</TableCell>
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
                      <DropdownMenuItem onSelect={() => handleUpdateStatus(inquiry.id, 'Contacted')} disabled={inquiry.status === 'Contacted'}>
                        Mark as Contacted
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleUpdateStatus(inquiry.id, 'New')} disabled={inquiry.status === 'New'}>
                        Mark as New
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredAndSortedInquiries.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                    No inquiries found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
