# **App Name**: RentalHQ Admin

## Core Features:

- Admin Authentication: Secure the /admin/* routes using Firebase Auth. Only whitelisted admin accounts can access the admin panel.
- Dashboard Overview: Display summary cards for total generators, active bookings, monthly income, and the most rented generator.
- Generator Management: Enable admins to add, edit, and delete generators, setting fields like capacity, price per day/month, image, and status (Available/Not Available).
- Booking Management: Allow admins to view all bookings with customer details, generator information, and dates. Admins can approve, reject, or update booking status.
- Payment Tracking: Enable tracking payments linked to bookings, including booking ID, user ID, amount, method, and status (Paid/Unpaid). Allow marking payments as Paid/Unpaid.
- Content Summarization Tool: AI tool that allows summarization of long customer reviews or feedback to identify key points, to use when deciding how to configure future options of the Generator Management System. Uses an LLM under the hood. Uses an LLM under the hood.

## Style Guidelines:

- Primary color: HSL(210, 75%, 50%) - A vibrant blue (#1E90FF) to convey trust and professionalism.
- Background color: HSL(210, 20%, 95%) - A very light, desaturated blue (#F0F8FF) for a clean and modern look.
- Accent color: HSL(180, 65%, 40%) - A contrasting teal (#32C896) for interactive elements and highlights, ensuring calls to action stand out.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines, 'Inter' (sans-serif) for body. 'Space Grotesk' is great for a tech feel. 'Inter' is very readable for longer blocks of text.
- Implement a responsive layout with a sidebar navigation that collapses on mobile. Use Ant Design CSS for styling the tables (Generators, Bookings, Payments) and forms (Modal/Drawer for Add/Edit Generators).
- Utilize simple, clear icons from a library like FontAwesome or Heroicons for navigation and status indicators, maintaining consistency throughout the admin panel.
- Add subtle animations for transitions and feedback, such as modal appearance or status updates. Ensure animations are smooth and do not distract from the user experience.