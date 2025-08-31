
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Generator } from '@/lib/types';
import { useData } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface OutOfStockModalProps {
    generator: Generator;
    isOpen: boolean;
    onClose: () => void;
}

const inquirySchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters."),
  customerPhone: z.string().min(10, "Please enter a valid phone number."),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

enum InquiryStep {
  Form,
  Otp,
  Confirmation,
}

export function OutOfStockModal({ generator, isOpen, onClose }: OutOfStockModalProps) {
  const { addInquiry } = useData();
  const { toast } = useToast();
  const [step, setStep] = useState<InquiryStep>(InquiryStep.Form);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  
  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { customerName: '', customerPhone: '' },
  });

  const handleModalClose = () => {
    onClose();
    // Reset state after a short delay to allow for closing animation
    setTimeout(() => {
        form.reset();
        setStep(InquiryStep.Form);
        setIsLoading(false);
        setOtp('');
    }, 300);
  };

  const handleInquirySubmit = (data: InquiryFormValues) => {
    setIsLoading(true);
    // Simulate sending an OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(InquiryStep.Otp);
    }, 1000);
  };

  const handleOtpVerification = async () => {
    setIsLoading(true);
    const formData = form.getValues();
    
    // Simulate OTP verification
    setTimeout(async () => {
      try {
        await addInquiry({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          generatorId: generator.id,
          generatorName: generator.name,
        });
        
        handleModalClose();
        toast({
            title: "Request Received!",
            description: "We have received your inquiry and will contact you shortly.",
        });

      } catch (error) {
        console.error("Failed to submit inquiry:", error);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "There was an error submitting your request. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const renderStepContent = () => {
    switch(step) {
      case InquiryStep.Form:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Inquire Availability</DialogTitle>
              <DialogDescription>
                This generator is currently out of stock. Please provide your details, and we'll notify you when it's available.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleInquirySubmit)} className="space-y-4 pt-4">
                <FormField control={form.control} name="customerName" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="customerPhone" render={({ field }) => (
                  <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Inquiry
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        );
      case InquiryStep.Otp:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Verify Your Phone Number</DialogTitle>
              <DialogDescription>
                We've sent a one-time password (OTP) to your phone. Please enter it below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
                <div className="flex flex-col space-y-2">
                    <Label htmlFor="otp">OTP Code</Label>
                    <Input id="otp" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
                    <p className="text-xs text-muted-foreground">For this demo, any 6-digit code will work.</p>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setStep(InquiryStep.Form)} disabled={isLoading}>Back</Button>
                <Button onClick={handleOtpVerification} disabled={isLoading || otp.length !== 6}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Submit
                </Button>
            </DialogFooter>
          </>
        );
       case InquiryStep.Confirmation:
        return (
          <div className="text-center py-8">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Inquiry Submitted!</h2>
            <p className="text-muted-foreground mt-2">
                Thank you for your interest. We will contact you as soon as the {generator.name} is available.
            </p>
            <Button onClick={handleModalClose} className="mt-6">Close</Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
