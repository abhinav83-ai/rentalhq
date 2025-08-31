import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

// Type for searchParams
interface ConfirmationPageProps {
  searchParams?: {
    bookingId?: string;
  };
}

export default function ConfirmationPage({ searchParams }: { searchParams: { bookingId?: string } })  {
  const bookingId = searchParams?.bookingId || 'N/A';

  return (
    <div className="container flex items-center justify-center flex-1 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Booking Request Sent!</CardTitle>
          <CardDescription>
            Your request has been successfully submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your booking ID is <span className="font-semibold text-foreground">{bookingId}</span>. 
            We will contact you shortly via phone to confirm the details and payment.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
