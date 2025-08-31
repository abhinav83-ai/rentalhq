
import type { Generator, Booking, Payment, Customer, Review } from './types';

// This file is now a fallback and primarily for seeding the data.json file.
// The main source of truth is now src/lib/data/data.json and the service.ts file.

export const generators: Generator[] = [
  {
    id: 'M001',
    name: 'CAT G3516',
    capacity: 1500,
    pricePerDay: 500,
    pricePerMonth: 12000,
    imageUrl: 'https://picsum.photos/400/300',
    fuelType: 'Diesel',
    featured: true,
    description: "A high-performance diesel generator suitable for large-scale industrial needs. Reliable and efficient.",
    units: [
      { id: 'G001', serialNumber: 'CAT-2023-001', status: 'Available' },
      { id: 'G002', serialNumber: 'CAT-2023-002', status: 'Rented' },
      { id: 'G003', serialNumber: 'CAT-2023-003', status: 'Maintenance' },
      { id: 'G008', serialNumber: 'CAT-2023-004', status: 'Available' },
    ],
  },
  {
    id: 'M002',
    name: 'Cummins QSK60',
    capacity: 2000,
    pricePerDay: 750,
    pricePerMonth: 18000,
    imageUrl: 'https://picsum.photos/400/301',
    fuelType: 'Diesel',
    featured: true,
    description: "Top-of-the-line power generation for critical applications. Unmatched performance and durability.",
    units: [
      { id: 'G004', serialNumber: 'CUM-2023-001', status: 'Available' }
    ],
  },
  {
    id: 'M003',
    name: 'Generac SD200',
    capacity: 200,
    pricePerDay: 150,
    pricePerMonth: 3500,
    imageUrl: 'https://picsum.photos/400/302',
    fuelType: 'Petrol',
    featured: false,
    description: "A versatile and portable petrol generator, perfect for residential backup or small events.",
    units: [
      { id: 'G005', serialNumber: 'GEN-2023-001', status: 'Rented' }
    ],
  },
  {
    id: 'M004',
    name: 'Kohler KD1000',
    capacity: 1000,
    pricePerDay: 400,
    pricePerMonth: 9500,
    imageUrl: 'https://picsum.photos/400/303',
    fuelType: 'Diesel',
    featured: true,
    description: "A powerful and compact diesel generator, ideal for mid-sized commercial or construction use.",
    units: [
      { id: 'G006', serialNumber: 'KOH-2023-001', status: 'Maintenance' },
      { id: 'G007', serialNumber: 'KOH-2023-002', status: 'Available' },
    ],
  },
];

export const customers: Customer[] = [
  {
    id: 'C001',
    name: 'Alice Johnson',
    phone: '555-123-4567',
    address: '123 Maple St, Springfield, IL',
    totalBookings: 1,
    type: 'Online',
  },
  {
    id: 'C002',
    name: 'Bob Williams',
    phone: '555-987-6543',
    address: '456 Oak Ave, Shelbyville, IL',
    totalBookings: 1,
    type: 'Offline',
  },
  {
    id: 'C003',
    name: 'Charlie Brown',
    phone: '555-555-1212',
    address: '789 Pine Ln, Capital City, IL',
    totalBookings: 1,
    type: 'Online',
  },
];


export const bookings: Booking[] = [
    {
        id: 'B001',
        customerName: 'Alice Johnson',
        generatorId: 'M002',
        generatorName: 'Cummins QSK60',
        startDate: new Date(new Date().setDate(new Date().getDate() - 5)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        status: 'Approved',
        source: 'Online',
        bookedUnits: [{ id: 'G004', serialNumber: 'CUM-2023-001' }],
        totalCost: 7500,
    },
    {
        id: 'B002',
        customerName: 'Bob Williams',
        generatorId: 'M003',
        generatorName: 'Generac SD200',
        startDate: new Date(new Date().setDate(new Date().getDate() - 2)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        status: 'Pending',
        source: 'Manual',
        bookedUnits: [{ id: 'G005', serialNumber: 'GEN-2023-001' }],
        totalCost: 1800,
    },
    {
        id: 'B003',
        customerName: 'Charlie Brown',
        generatorId: 'M001',
        generatorName: 'CAT G3516',
        startDate: new Date(new Date().setDate(new Date().getDate() - 10)),
        endDate: new Date(new Date().setDate(new Date().getDate() - 3)),
        status: 'Rejected',
        source: 'Online',
        bookedUnits: [],
        totalCost: 3500,
    },
];

export const payments: Payment[] = [
    {
        id: 'P001',
        bookingId: 'B001',
        amount: 7500,
        method: 'Credit Card',
        status: 'Paid',
        transactionDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    },
    {
        id: 'P002',
        bookingId: 'B002',
        amount: 1800,
        method: 'Cash',
        status: 'Unpaid',
        transactionDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    }
];

export const reviews: Review[] = [
    {
        id: 'R001',
        customerName: 'Construction Co.',
        rating: 5,
        comment: 'The CAT G3516 was a beast! Powered our entire construction site without a single issue for a whole month. Delivery was on time and professional.',
        date: new Date('2024-05-15'),
    },
    {
        id: 'R002',
        customerName: 'Event Planners Inc.',
        rating: 4,
        comment: 'We rented two Kohler generators for an outdoor wedding. They were quiet and reliable. One had a minor issue but support was quick to resolve it.',
        date: new Date('2024-06-20'),
    },
    {
        id: 'R003',
        customerName: 'Sarah L.',
        rating: 5,
        comment: 'Needed a backup generator for my home during a storm warning. The Generac SD200 was perfect. The booking process online was super easy!',
        date: new Date('2024-07-02'),
    }
];
