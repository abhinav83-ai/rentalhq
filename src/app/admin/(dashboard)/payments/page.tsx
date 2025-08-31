
import { PaymentsTable } from "@/components/admin/payments-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Tracking</CardTitle>
        <CardDescription>
          Monitor and manage all booking-related payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PaymentsTable />
      </CardContent>
    </Card>
  );
}
