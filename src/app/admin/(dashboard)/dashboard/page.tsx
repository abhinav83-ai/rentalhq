
import { DashboardCards } from "@/components/admin/dashboard-cards";
import { BookingsTable } from "@/components/admin/bookings-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardCards />
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>
            An overview of the most recent customer bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable showViewAll={true} />
        </CardContent>
      </Card>
    </div>
  );
}
