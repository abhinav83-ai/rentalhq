
import { GeneratorsTable } from "@/components/admin/generators-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GeneratorsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generator Management</CardTitle>
        <CardDescription>
          Add, edit, and manage your inventory of generators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GeneratorsTable />
      </CardContent>
    </Card>
  );
}
