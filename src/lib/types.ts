

export type GeneratorUnit = {
  id: string;
  serialNumber: string;
  status: 'Available' | 'Rented' | 'Maintenance';
};

export type Generator = {
  id: string;
  name: string;
  capacity: number; // in kW
  pricePerDay: number;
  pricePerMonth: number;
  imageUrl: string;
  units: GeneratorUnit[];
  fuelType: 'Diesel' | 'Petrol';
  featured: boolean;
  description: string;
};

export type Booking = {
  id: string;
  customerName: string;
  generatorId: string; 
  generatorName: string;
  startDate: Date;
  endDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  source: 'Online' | 'Manual';
  bookedUnits: { id: string; serialNumber: string }[];
  totalCost: number;
};

export type Payment = {
  id: string;
  bookingId: string;
  amount: number;
  method: string;
  status: 'Paid' | 'Unpaid';
  transactionDate: Date;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalBookings: number;
  type: 'Online' | 'Offline';
};

export type Review = {
    id: string;
    customerName: string;
    rating: number; // 1-5
    comment: string;
    date: Date;
};

export type Inquiry = {
    id: string;
    customerName: string;
    customerPhone: string;
    generatorId: string;
    generatorName: string;
    date: Date;
    status: 'New' | 'Contacted';
};

export type CartItem = {
    generator: Generator;
    quantity: number;
};
