
import { BookingsTable } from "@/components/admin/bookings-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BookingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Management</CardTitle>
        <CardDescription>
          View and manage all customer bookings from both online and manual sources.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BookingsTable />
      </CardContent>
    </Card>
  );
}
