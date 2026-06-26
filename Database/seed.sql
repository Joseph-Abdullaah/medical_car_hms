-- ============================================================
-- MediCare HMS — Seed Data
-- Run after schema.sql has been applied to medicare_hms.
-- Passwords are stored as plain text (demo project only).
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE Medical_Records;
TRUNCATE TABLE Appointments;
TRUNCATE TABLE Patient_Profiles;
TRUNCATE TABLE Doctor_Profiles;
TRUNCATE TABLE Users;
TRUNCATE TABLE Departments;

SET FOREIGN_KEY_CHECKS = 1;

-- ── 1. DEPARTMENTS ──────────────────────────────────────────
INSERT INTO Departments (dept_id, dept_name) VALUES
(1, 'Cardiology'),
(2, 'Neurology'),
(3, 'Pediatrics'),
(4, 'Orthopedics'),
(5, 'General Medicine'),
(6, 'Dermatology');

-- ── 2. USERS ────────────────────────────────────────────────
-- Admin
INSERT INTO Users (user_id, username, password, role) VALUES
(1, 'admin', 'admin123', 'ADMIN');

-- Doctors (user_id 2–11)
INSERT INTO Users (user_id, username, password, role) VALUES
(2,  'dr.wilson',    'doctor123', 'DOCTOR'),
(3,  'dr.chen',      'doctor123', 'DOCTOR'),
(4,  'dr.martinez',  'doctor123', 'DOCTOR'),
(5,  'dr.thompson',  'doctor123', 'DOCTOR'),
(6,  'dr.johnson',   'doctor123', 'DOCTOR'),
(7,  'dr.park',      'doctor123', 'DOCTOR'),
(8,  'dr.brown',     'doctor123', 'DOCTOR'),
(9,  'dr.nguyen',    'doctor123', 'DOCTOR'),
(10, 'dr.lee',       'doctor123', 'DOCTOR'),
(11, 'dr.rodriguez', 'doctor123', 'DOCTOR');

-- Patients (user_id 12–41)
INSERT INTO Users (user_id, username, password, role) VALUES
(12, 'emma.harris',     'patient123', 'PATIENT'),
(13, 'liam.johnson',    'patient123', 'PATIENT'),
(14, 'sophia.williams', 'patient123', 'PATIENT'),
(15, 'noah.brown',      'patient123', 'PATIENT'),
(16, 'olivia.jones',    'patient123', 'PATIENT'),
(17, 'james.garcia',    'patient123', 'PATIENT'),
(18, 'ava.miller',      'patient123', 'PATIENT'),
(19, 'william.davis',   'patient123', 'PATIENT'),
(20, 'isabella.wilson', 'patient123', 'PATIENT'),
(21, 'benjamin.moore',  'patient123', 'PATIENT'),
(22, 'mia.taylor',      'patient123', 'PATIENT'),
(23, 'elijah.anderson', 'patient123', 'PATIENT'),
(24, 'charlotte.thomas','patient123', 'PATIENT'),
(25, 'lucas.jackson',   'patient123', 'PATIENT'),
(26, 'amelia.white',    'patient123', 'PATIENT'),
(27, 'henry.harris',    'patient123', 'PATIENT'),
(28, 'harper.martin',   'patient123', 'PATIENT'),
(29, 'alexander.lee',   'patient123', 'PATIENT'),
(30, 'evelyn.perez',    'patient123', 'PATIENT'),
(31, 'daniel.thompson', 'patient123', 'PATIENT'),
(32, 'abigail.clark',   'patient123', 'PATIENT'),
(33, 'matthew.lewis',   'patient123', 'PATIENT'),
(34, 'emily.robinson',  'patient123', 'PATIENT'),
(35, 'jackson.walker',  'patient123', 'PATIENT'),
(36, 'scarlett.hall',   'patient123', 'PATIENT'),
(37, 'sebastian.young', 'patient123', 'PATIENT'),
(38, 'victoria.allen',  'patient123', 'PATIENT'),
(39, 'aiden.king',      'patient123', 'PATIENT'),
(40, 'luna.wright',     'patient123', 'PATIENT'),
(41, 'owen.scott',      'patient123', 'PATIENT');

-- ── 3. DOCTOR PROFILES ──────────────────────────────────────
INSERT INTO Doctor_Profiles (user_id, full_name, dept_id) VALUES
(2,  'Dr. James Wilson',      1),  -- Cardiology
(3,  'Dr. Sarah Chen',        1),  -- Cardiology
(4,  'Dr. Roberto Martinez',  2),  -- Neurology
(5,  'Dr. Emily Thompson',    2),  -- Neurology
(6,  'Dr. Michael Johnson',   3),  -- Pediatrics
(7,  'Dr. Lisa Park',         3),  -- Pediatrics
(8,  'Dr. David Brown',       4),  -- Orthopedics
(9,  'Dr. Minh Nguyen',       5),  -- General Medicine
(10, 'Dr. Jennifer Lee',      5),  -- General Medicine
(11, 'Dr. Ana Rodriguez',     6);  -- Dermatology

-- ── 4. PATIENT PROFILES ─────────────────────────────────────
INSERT INTO Patient_Profiles (user_id, full_name, blood_type, gender, phone, address) VALUES
(12, 'Emma Harris',      'A+',  'Female', '(555) 201-3847', '14 Birchwood Lane, Springfield, IL'),
(13, 'Liam Johnson',     'O+',  'Male',   '(555) 302-5961', '7 Maple Drive, Riverside, CA'),
(14, 'Sophia Williams',  'B+',  'Female', '(555) 403-7082', '33 Oak Street, Portland, OR'),
(15, 'Noah Brown',       'AB+', 'Male',   '(555) 504-8193', '22 Elm Avenue, Denver, CO'),
(16, 'Olivia Jones',     'O-',  'Female', '(555) 605-9204', '9 Pine Court, Austin, TX'),
(17, 'James Garcia',     'A-',  'Male',   '(555) 706-0315', '56 Cedar Blvd, Seattle, WA'),
(18, 'Ava Miller',       'B-',  'Female', '(555) 807-1426', '41 Willow Way, Nashville, TN'),
(19, 'William Davis',    'O+',  'Male',   '(555) 908-2537', '18 Poplar Road, Charlotte, NC'),
(20, 'Isabella Wilson',  'A+',  'Female', '(555) 109-3648', '63 Spruce Lane, Boston, MA'),
(21, 'Benjamin Moore',   'AB-', 'Male',   '(555) 210-4759', '5 Fir Street, Phoenix, AZ'),
(22, 'Mia Taylor',       'O+',  'Female', '(555) 311-5860', '87 Aspen Avenue, Minneapolis, MN'),
(23, 'Elijah Anderson',  'B+',  'Male',   '(555) 412-6971', '29 Walnut Drive, Detroit, MI'),
(24, 'Charlotte Thomas', 'A+',  'Female', '(555) 513-7082', '11 Chestnut Blvd, Atlanta, GA'),
(25, 'Lucas Jackson',    'O-',  'Male',   '(555) 614-8193', '44 Hickory Court, Dallas, TX'),
(26, 'Amelia White',     'B+',  'Female', '(555) 715-9204', '72 Magnolia Way, San Antonio, TX'),
(27, 'Henry Harris',     'A-',  'Male',   '(555) 816-0315', '3 Redwood Lane, Las Vegas, NV'),
(28, 'Harper Martin',    'O+',  'Female', '(555) 917-1426', '58 Sycamore Road, Kansas City, MO'),
(29, 'Alexander Lee',    'AB+', 'Male',   '(555) 018-2537', '16 Laurel Street, Columbus, OH'),
(30, 'Evelyn Perez',     'A+',  'Female', '(555) 119-3648', '39 Cypress Avenue, Jacksonville, FL'),
(31, 'Daniel Thompson',  'O+',  'Male',   '(555) 220-4759', '67 Palmetto Drive, Indianapolis, IN'),
(32, 'Abigail Clark',    'B-',  'Female', '(555) 321-5860', '24 Juniper Blvd, Memphis, TN'),
(33, 'Matthew Lewis',    'A+',  'Male',   '(555) 422-6971', '48 Dogwood Court, Louisville, KY'),
(34, 'Emily Robinson',   'O-',  'Female', '(555) 523-7082', '81 Sequoia Way, Baltimore, MD'),
(35, 'Jackson Walker',   'AB+', 'Male',   '(555) 624-8193', '6 Bamboo Lane, Milwaukee, WI'),
(36, 'Scarlett Hall',    'A-',  'Female', '(555) 725-9204', '35 Holly Road, Albuquerque, NM'),
(37, 'Sebastian Young',  'B+',  'Male',   '(555) 826-0315', '52 Ivy Street, Tucson, AZ'),
(38, 'Victoria Allen',   'O+',  'Female', '(555) 927-1426', '19 Boxwood Avenue, Fresno, CA'),
(39, 'Aiden King',       'A+',  'Male',   '(555) 028-2537', '73 Azalea Drive, Sacramento, CA'),
(40, 'Luna Wright',      'B-',  'Female', '(555) 129-3648', '42 Dahlia Blvd, Omaha, NE'),
(41, 'Owen Scott',       'O+',  'Male',   '(555) 230-4759', '8 Iris Court, Raleigh, NC');

-- ── 5. APPOINTMENTS ─────────────────────────────────────────
-- Statuses: ~10 COMPLETED (past), ~8 CONFIRMED (upcoming),
--           ~8 PENDING (upcoming), ~7 CANCELLED (mixed)

-- COMPLETED — past visits
INSERT INTO Appointments (appointment_id, patient_id, doctor_id, appointment_date, status) VALUES
(1,  12, 2,  '2025-11-03 09:00:00', 'COMPLETED'),
(2,  13, 4,  '2025-11-17 10:30:00', 'COMPLETED'),
(3,  14, 6,  '2025-12-02 08:30:00', 'COMPLETED'),
(4,  15, 8,  '2025-12-15 14:00:00', 'COMPLETED'),
(5,  16, 9,  '2026-01-08 11:00:00', 'COMPLETED'),
(6,  17, 10, '2026-01-22 09:30:00', 'COMPLETED'),
(7,  18, 3,  '2026-02-05 15:30:00', 'COMPLETED'),
(8,  19, 5,  '2026-02-19 08:00:00', 'COMPLETED'),
(9,  20, 7,  '2026-03-04 10:00:00', 'COMPLETED'),
(10, 21, 11, '2026-03-18 13:00:00', 'COMPLETED'),
(11, 22, 2,  '2026-04-01 09:00:00', 'COMPLETED'),
(12, 23, 4,  '2026-04-14 14:30:00', 'COMPLETED'),

-- CONFIRMED — upcoming visits
(13, 24, 2,  '2026-07-07 09:00:00', 'CONFIRMED'),
(14, 25, 3,  '2026-07-09 10:30:00', 'CONFIRMED'),
(15, 26, 4,  '2026-07-14 11:00:00', 'CONFIRMED'),
(16, 27, 5,  '2026-07-16 08:30:00', 'CONFIRMED'),
(17, 28, 6,  '2026-07-21 14:00:00', 'CONFIRMED'),
(18, 29, 8,  '2026-07-23 15:30:00', 'CONFIRMED'),
(19, 30, 9,  '2026-08-04 09:30:00', 'CONFIRMED'),
(20, 31, 10, '2026-08-06 13:00:00', 'CONFIRMED'),

-- PENDING — awaiting confirmation
(21, 32, 2,  '2026-07-28 10:00:00', 'PENDING'),
(22, 33, 3,  '2026-07-30 11:30:00', 'PENDING'),
(23, 34, 5,  '2026-08-11 09:00:00', 'PENDING'),
(24, 35, 6,  '2026-08-13 14:00:00', 'PENDING'),
(25, 36, 7,  '2026-08-18 08:30:00', 'PENDING'),
(26, 37, 9,  '2026-08-20 10:30:00', 'PENDING'),
(27, 38, 10, '2026-09-01 15:00:00', 'PENDING'),
(28, 39, 11, '2026-09-03 09:30:00', 'PENDING'),

-- CANCELLED
(29, 40, 4,  '2026-01-15 10:00:00', 'CANCELLED'),
(30, 41, 6,  '2026-02-10 14:30:00', 'CANCELLED'),
(31, 12, 8,  '2026-03-25 09:00:00', 'CANCELLED'),
(32, 13, 10, '2026-04-20 11:00:00', 'CANCELLED'),
(33, 14, 2,  '2026-05-12 08:30:00', 'CANCELLED'),
(34, 15, 3,  '2026-06-03 13:00:00', 'CANCELLED'),
(35, 16, 11, '2026-06-17 15:30:00', 'CANCELLED');

-- ── 6. MEDICAL RECORDS ──────────────────────────────────────
-- One record per COMPLETED appointment (appointment_id 1–12).

INSERT INTO Medical_Records (record_id, patient_id, doctor_id, diagnosis, prescription, visit_date) VALUES
(1,  12, 2,
 'Hypertension Stage 1',
 'Lisinopril 10 mg once daily. Monitor BP weekly. Low-sodium diet. Follow-up in 4 weeks.',
 '2025-11-03 09:00:00'),

(2,  13, 4,
 'Tension Headache (G44.2)',
 'Ibuprofen 400 mg as needed (max 3x daily). Rest and hydration. Avoid screen time >2h. Return if pain persists >5 days.',
 '2025-11-17 10:30:00'),

(3,  14, 6,
 'Acute Upper Respiratory Infection (J06.9)',
 'Rest for 5 days. Paracetamol 500 mg every 6 h if temp >38°C. Saline nasal spray. Plenty of fluids.',
 '2025-12-02 08:30:00'),

(4,  15, 8,
 'Lumbar Strain (M54.5)',
 'Naproxen 500 mg twice daily with food x 7 days. Ice pack 20 min 3x daily. Physiotherapy referral issued.',
 '2025-12-15 14:00:00'),

(5,  16, 9,
 'Type 2 Diabetes Mellitus — Initial Diagnosis (E11.9)',
 'Metformin 500 mg twice daily with meals. HbA1c recheck in 3 months. Dietary counselling arranged. Fasting glucose log advised.',
 '2026-01-08 11:00:00'),

(6,  17, 10,
 'Seasonal Allergic Rhinitis (J30.1)',
 'Cetirizine 10 mg once daily. Fluticasone nasal spray 2 puffs each nostril morning. Avoid known allergens. Review in 6 weeks.',
 '2026-01-22 09:30:00'),

(7,  18, 3,
 'Atrial Fibrillation — Paroxysmal (I48.0)',
 'Apixaban 5 mg twice daily. Rate control: Bisoprolol 2.5 mg once daily. Holter monitor requested. Cardiology follow-up in 2 weeks.',
 '2026-02-05 15:30:00'),

(8,  19, 5,
 'Migraine without Aura (G43.0)',
 'Sumatriptan 50 mg at onset (max 2 doses/24h). Propranolol 40 mg daily for prophylaxis. Migraine diary requested. Neurology follow-up in 6 weeks.',
 '2026-02-19 08:00:00'),

(9,  20, 7,
 'Acute Otitis Media — Bilateral (H66.0)',
 'Amoxicillin 500 mg three times daily x 10 days. Paracetamol for pain. ENT referral if no improvement in 72 h.',
 '2026-03-04 10:00:00'),

(10, 21, 11,
 'Acne Vulgaris — Moderate (L70.0)',
 'Benzoyl peroxide 5% gel once daily (evening). Clindamycin 1% topical twice daily. Avoid oily cosmetics. Review in 8 weeks.',
 '2026-03-18 13:00:00'),

(11, 22, 2,
 'Stable Angina Pectoris (I20.8)',
 'Aspirin 75 mg daily. GTN spray sublingual as needed for chest pain. Atorvastatin 40 mg at night. Stress ECG arranged.',
 '2026-04-01 09:00:00'),

(12, 23, 4,
 'Cervicogenic Headache (G44.841)',
 'Physiotherapy x 6 sessions referred. Diclofenac 50 mg twice daily with food x 5 days. Neck ergonomics advice given.',
 '2026-04-14 14:30:00');
