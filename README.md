Role SQL query : 
INSERT INTO roles (roleId, "roleName", description) VALUES
(1, 'Admin', 'Someone who manages the system''s backend operations including user roles, database control, bug tracking, and platform stability.'),
(2, 'EPC Staff', 'Someone who handles payment gateway operations, verifies successful transactions, and ensures secure and smooth financial flows.'),
(3, 'Accounting Staff', 'Someone who manages payment records, transaction tracking, revenue reporting, and financial reconciliation'),
(4, 'Complaint Handler', 'Someone who receives, reviews, and resolves user-submitted complaints regarding services or partners.'),
(5, 'Support Staff', 'Someone who communicates with users through the chat system to assist with inquiries, bookings, or escalated support.'),
(6, 'Service Partner', 'A garage, repair shop, or service provider that registers on the platform to offer services like repairs, washing, maintenance, etc.'),
(7, 'Customer', 'A registered individual who uses the platform to request services, book appointments, send SOS requests, and interact with service providers.'),
(8, 'Guest', 'Someone who visits the platform without an account, can browse services and locations but cannot make bookings.');
