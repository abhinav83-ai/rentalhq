
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, BookCheck, DollarSign, Star } from "lucide-react";
import { useData } from "@/context/data-context";
import { useMemo } from "react";

export function DashboardCards() {
  const { generators, bookings, payments } = useData();

  const { totalGenerators, activeBookings, monthlyIncome, mostRented } = useMemo(() => {
    const totalGenerators = generators.reduce((acc, generator) => acc + generator.units.length, 0);
    const activeBookings = bookings.filter(b => b.status === 'Approved').length;
    const monthlyIncome = payments
      .filter(p => p.status === 'Paid' && p.transactionDate.getMonth() === new Date().getMonth())
      .reduce((acc, p) => acc + p.amount, 0);
      
    const bookingCounts = bookings.reduce((acc, booking) => {
        acc[booking.generatorName] = (acc[booking.generatorName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostRented = Object.keys(bookingCounts).length > 0
        ? Object.entries(bookingCounts).sort((a, b) => b[1] - a[1])[0][0]
        : "N/A";

    return { totalGenerators, activeBookings, monthlyIncome, mostRented };
  }, [generators, bookings, payments]);


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Generators</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGenerators}</div>
          <p className="text-xs text-muted-foreground">+2 since last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
          <BookCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeBookings}</div>
          <p className="text-xs text-muted-foreground">+5 this month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${monthlyIncome.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Rented</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{mostRented}</div>
          <p className="text-xs text-muted-foreground">This month's top performer</p>
        </CardContent>
      </Card>
    </div>
  );
}
