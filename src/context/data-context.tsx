
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Generator, Booking, Payment, Customer, Review, Inquiry } from '@/lib/types';
import { 
    getAllData,
    addBookingAction,
    updateBookingStatusAction,
    addCustomerAction,
    updateCustomerAction,
    addGeneratorAction,
    updateGeneratorAction,
    addPaymentAction,
    updatePaymentStatusAction,
    addReviewAction,
    addInquiryAction,
    updateInquiryStatusAction
} from '@/lib/data/service';

interface DataContextType {
    isLoaded: boolean;
    generators: Generator[];
    bookings: Booking[];
    payments: Payment[];
    customers: Customer[];
    reviews: Review[];
    inquiries: Inquiry[];
    addBooking: (bookingData: Omit<Booking, 'id' | 'status'> & { customerId: string }) => Promise<void>;
    updateBookingStatus: (bookingId: string, status: 'Approved' | 'Rejected') => Promise<void>;
    addCustomer: (customerData: Omit<Customer, 'id' | 'totalBookings'>) => Promise<Customer>;
    updateCustomer: (customerId: string, customerData: Partial<Omit<Customer, 'id' | 'totalBookings'>>) => Promise<void>;
    addGenerator: (generatorData: Omit<Generator, 'id' | 'featured' | 'description'>) => Promise<void>;
    updateGenerator: (generatorId: string, generatorData: Partial<Omit<Generator, 'id'>>) => Promise<void>;
    addPayment: (paymentData: Omit<Payment, 'id' | 'transactionDate'>) => Promise<void>;
    updatePaymentStatus: (paymentId: string, status: 'Paid' | 'Unpaid') => Promise<void>;
    addReview: (reviewData: Omit<Review, 'id' | 'date'>) => Promise<void>;
    addInquiry: (inquiryData: Omit<Inquiry, 'id' | 'date' | 'status'>) => Promise<void>;
    updateInquiryStatus: (inquiryId: string, status: 'New' | 'Contacted') => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [generators, setGenerators] = useState<Generator[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);

    const fetchData = useCallback(async () => {
        const data = await getAllData();
        setGenerators(data.generators);
        setBookings(data.bookings);
        setPayments(data.payments);
        setCustomers(data.customers);
        setReviews(data.reviews);
        setInquiries(data.inquiries || []);
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addBooking = async (bookingData: Omit<Booking, 'id' | 'status'> & { customerId: string }) => {
        await addBookingAction(bookingData);
        await fetchData(); // Re-fetch all data to ensure consistency
    };

    const updateBookingStatus = async (bookingId: string, status: 'Approved' | 'Rejected') => {
        await updateBookingStatusAction(bookingId, status);
        await fetchData();
    };

    const addCustomer = async (customerData: Omit<Customer, 'id' | 'totalBookings'>): Promise<Customer> => {
        const newCustomer = await addCustomerAction(customerData);
        await fetchData();
        return newCustomer;
    };

    const updateCustomer = async (customerId: string, customerData: Partial<Omit<Customer, 'id' | 'totalBookings'>>) => {
        await updateCustomerAction(customerId, customerData);
        await fetchData();
    };

    const addGenerator = async (generatorData: Omit<Generator, 'id' | 'featured' | 'description'>) => {
        await addGeneratorAction(generatorData);
        await fetchData();
    };

    const updateGenerator = async (generatorId: string, generatorData: Partial<Omit<Generator, 'id'>>) => {
        await updateGeneratorAction(generatorId, generatorData);
        await fetchData();
    };

    const addPayment = async (paymentData: Omit<Payment, 'id' | 'transactionDate'>) => {
        await addPaymentAction(paymentData);
        await fetchData();
    };

    const updatePaymentStatus = async (paymentId: string, status: 'Paid' | 'Unpaid') => {
        await updatePaymentStatusAction(paymentId, status);
        await fetchData();
    };

    const addReview = async (reviewData: Omit<Review, 'id' | 'date'>) => {
        await addReviewAction(reviewData);
        await fetchData();
    };

    const addInquiry = async (inquiryData: Omit<Inquiry, 'id' | 'date' | 'status'>) => {
        await addInquiryAction(inquiryData);
        await fetchData();
    };

    const updateInquiryStatus = async (inquiryId: string, status: 'New' | 'Contacted') => {
        await updateInquiryStatusAction(inquiryId, status);
        await fetchData();
    };

    return (
        <DataContext.Provider value={{
            isLoaded,
            generators, 
            bookings, 
            payments, 
            customers,
            reviews,
            inquiries,
            addBooking,
            updateBookingStatus,
            addCustomer,
            updateCustomer,
            addGenerator,
            updateGenerator,
            addPayment,
            updatePaymentStatus,
            addReview,
            addInquiry,
            updateInquiryStatus,
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
