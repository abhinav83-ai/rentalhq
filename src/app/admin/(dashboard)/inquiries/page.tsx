
import { InquiriesTable } from "@/components/admin/inquiries-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InquiriesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Inquiries</CardTitle>
        <CardDescription>
          Manage and track customer inquiries for out-of-stock generators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InquiriesTable />
      </CardContent>
    </Card>
  );
}
