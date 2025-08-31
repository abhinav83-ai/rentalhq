
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { Generator, Booking, Payment, Customer, Review, Inquiry } from '@/lib/types';

type AppData = {
    generators: Generator[];
    bookings: Booking[];
    payments: Payment[];
    customers: Customer[];
    reviews: Review[];
    inquiries: Inquiry[];
}

// Set the path to the data.json file
const dataPath = path.join(process.cwd(), "public", "data.json");

// Helper function to read the data from the JSON file
async function readData(): Promise<AppData> {
    try {
        const fileContent = await fs.readFile(dataPath, 'utf-8');
        const data = JSON.parse(fileContent);
        // Dates are stored as strings in JSON, so we need to parse them back to Date objects
        data.bookings.forEach((b: Booking) => {
            b.startDate = new Date(b.startDate);
            b.endDate = new Date(b.endDate);
        });
        data.payments.forEach((p: Payment) => {
            p.transactionDate = new Date(p.transactionDate);
        });
        data.reviews.forEach((r: Review) => {
            r.date = new Date(r.date);
        });
        if (data.inquiries) {
            data.inquiries.forEach((i: Inquiry) => {
                i.date = new Date(i.date);
            });
        }
        return data;
    } catch (error) {
        console.error('Error reading data file:', error);
        // If the file doesn't exist or is corrupted, return empty arrays
        return {
            generators: [],
            bookings: [],
            payments: [],
            customers: [],
            reviews: [],
            inquiries: [],
        };
    }
}

// Helper function to write data to the JSON file
async function writeData(data: AppData): Promise<void> {
    try {
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing data file:', error);
    }
}

// --- Public API for data access ---

export async function getAllData(): Promise<AppData> {
    return await readData();
}

// --- Server Actions for data mutation ---

export async function addBookingAction(bookingData: Omit<Booking, 'id' | 'status'> & { customerId: string }) {
    const data = await readData();
    const customer = data.customers.find(c => c.id === bookingData.customerId);
    if (!customer) throw new Error("Invalid customer.");

    const newBooking: Booking = {
        id: `B${String(data.bookings.length + 1).padStart(3, '0')}`,
        ...bookingData,
        status: 'Pending',
    };

    data.bookings.unshift(newBooking);
    const customerIndex = data.customers.findIndex(c => c.id === bookingData.customerId);
    data.customers[customerIndex].totalBookings += 1;
    
    await writeData(data);
    return newBooking;
}

export async function updateBookingStatusAction(bookingId: string, status: 'Approved' | 'Rejected') {
    const data = await readData();
    const bookingIndex = data.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) throw new Error("Booking not found.");

    const bookingToUpdate = data.bookings[bookingIndex];
    const oldStatus = bookingToUpdate.status;
    data.bookings[bookingIndex].status = status;

    // Update unit statuses based on booking status change
    if (status === 'Approved' && oldStatus !== 'Approved') {
        bookingToUpdate.bookedUnits.forEach(bookedUnit => {
            data.generators.forEach(g => {
                const unit = g.units.find(u => u.id === bookedUnit.id);
                if (unit) unit.status = 'Rented';
            });
        });
    } else if (status === 'Rejected' && oldStatus === 'Approved') {
        bookingToUpdate.bookedUnits.forEach(bookedUnit => {
            data.generators.forEach(g => {
                const unit = g.units.find(u => u.id === bookedUnit.id);
                if (unit) unit.status = 'Available';
            });
        });
    }
    
    await writeData(data);
    return data.bookings[bookingIndex];
}

export async function addCustomerAction(customerData: Omit<Customer, 'id' | 'totalBookings'>): Promise<Customer> {
    const data = await readData();
    const newCustomer: Customer = {
        id: `C${String(data.customers.length + 1).padStart(3, '0')}`,
        totalBookings: 0,
        ...customerData,
    };
    data.customers.push(newCustomer);
    await writeData(data);
    return newCustomer;
}

export async function updateCustomerAction(customerId: string, customerData: Partial<Omit<Customer, 'id' | 'totalBookings'>>) {
    const data = await readData();
    const customerIndex = data.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) throw new Error("Customer not found.");

    data.customers[customerIndex] = { ...data.customers[customerIndex], ...customerData };
    await writeData(data);
    return data.customers[customerIndex];
}

export async function addGeneratorAction(generatorData: Omit<Generator, 'id' | 'featured' | 'description'>) {
    const data = await readData();
    const newGenerator: Generator = {
        id: `M${String(data.generators.length + 1).padStart(3, '0')}`,
        featured: false,
        description: "", // Add a default description
        ...generatorData,
    };
    data.generators.push(newGenerator);
    await writeData(data);
    return newGenerator;
}

export async function updateGeneratorAction(generatorId: string, generatorData: Partial<Omit<Generator, 'id'>>) {
    const data = await readData();
    const generatorIndex = data.generators.findIndex(g => g.id === generatorId);
    if (generatorIndex === -1) throw new Error("Generator not found.");
    
    data.generators[generatorIndex] = { ...data.generators[generatorIndex], ...generatorData };
    await writeData(data);
    return data.generators[generatorIndex];
}

export async function addPaymentAction(paymentData: Omit<Payment, 'id' | 'transactionDate'>) {
    const data = await readData();
    const newPayment: Payment = {
        id: `P${String(data.payments.length + 1).padStart(3, '0')}`,
        transactionDate: new Date(),
        ...paymentData,
    };
    data.payments.unshift(newPayment);
    await writeData(data);
    return newPayment;
}

export async function updatePaymentStatusAction(paymentId: string, status: 'Paid' | 'Unpaid') {
    const data = await readData();
    const paymentIndex = data.payments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) throw new Error("Payment not found.");

    data.payments[paymentIndex].status = status;
    await writeData(data);
    return data.payments[paymentIndex];
}

export async function addReviewAction(reviewData: Omit<Review, 'id' | 'date'>) {
    const data = await readData();
    const newReview: Review = {
        id: `R${String(data.reviews.length + 1).padStart(3, '0')}`,
        date: new Date(),
        ...reviewData,
    };
    data.reviews.unshift(newReview);
    await writeData(data);
    return newReview;
}

export async function addInquiryAction(inquiryData: Omit<Inquiry, 'id' | 'date' | 'status'>) {
    const data = await readData();
    const newInquiry: Inquiry = {
        id: `I${String(data.inquiries.length + 1).padStart(3, '0')}`,
        date: new Date(),
        status: 'New',
        ...inquiryData,
    };
    data.inquiries.unshift(newInquiry);
    await writeData(data);
    return newInquiry;
}

export async function updateInquiryStatusAction(inquiryId: string, status: 'New' | 'Contacted') {
    const data = await readData();
    const inquiryIndex = data.inquiries.findIndex(i => i.id === inquiryId);
    if (inquiryIndex === -1) throw new Error("Inquiry not found.");

    data.inquiries[inquiryIndex].status = status;
    await writeData(data);
    return data.inquiries[inquiryIndex];
}
