-- MediCare HMS Database Seeds for MySQL
-- Fills tables with realistic operational clinical data from the provided designs

USE medicare_hms;

-- Clear database contents first to ensure pristine seeds
DELETE FROM medical_records;
DELETE FROM appointments;
DELETE FROM patients;
DELETE FROM doctors;
DELETE FROM users;

-- 1. Seed Users (Plaintext passwords requested)
INSERT INTO users (id, username, email, full_name, password, role, profile_image) VALUES
-- Admin Accounts
(1, 'admin', 'admin@medicare.com', 'Admin User', 'admin', 'admin', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpDALEx-aw-kAkQu11pbFa2Cqwxvf9VfPmXmzbCDjySmfegS8nVG2wLrSPLtVVmpUJ3mTx9AuegCFINlIJdQo4hAS5XWEXnNVpv7VxPm81GjubaB_MJvmcOgXP8Nq39CpbyVVzdiEMvFelMiYBVpb_qIRFBW4LH2HsvRE8YLu1Xyql5jCGBpp1YVYh8swoDb5z0chqj1h3a5OSXB3Vglg1PBWLeLSnMx8EbythMUipMI1fCErlrlpXX-Wh6ulTxec-P9vJvx9U_PaY'),

-- Doctor Accounts
(2, 'dr_smith', 'j.smith@medicare.com', 'Dr. Julianne Smith', 'doctor', 'doctor', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCc84EHp1Rgwi4SepDZil3pkHHt-ujke01V9MFJcg-4j5YYWR8GteIzCKJNowJ3LJ0v7TpoZLhqOjiKBZ8QQh-n9WS_DIH3k8k1Tz7M49pfcYrkofcKHBcqSsfPXlwBVfxBo_nZc5FSvP-DxHBkPrXgcxEdiwy_3UlW8Xlv61JIUf7xYYDmPLj4pN2VDuh5JbKf9brxJY5zk1spS9AKuxAgw6OOmX54-Ywtm0cgJRTKM3oMiSBVspL8jNE_p6FHShY948C2Xirx3ANO'),
(3, 'dr_patel', 'a.patel@medicare.com', 'Dr. Amit Patel', 'doctor', 'doctor', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-aFgBDecqoN7cqIkQFbe4MAq2RNPmj0o8EFDYUt5z7_3_HqCYN5XLniX1HlAPbb-hGJ6CzqxXly87Hzjijc_xDCcY6wWdBZk3MjAmHZGZ8MpgpgGdkuIQYFMN6Xl1pd-hajkY-TEl1Dgt42EOZf0FHDPiXgDAsX_9CJxgMtWUcMeDO4fRfs__iYRYrQU66TK-JVLWPM5yK_59FAY1HnvZDssKeBVE0_YFVab9rNcRpXJr9uxhbkfOxcqnVxhr83RoGYZm5IkvYzo3'),
(4, 'dr_chen', 'r.chen@medicare.com', 'Dr. Robert Chen', 'doctor', 'doctor', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA-C4w5fH5HEdI3t-qnrtwbqUMXfcOQflvnu91p7ZZkVgb6Vcg_UT1XXmX_TWf7dDat6Astg32fL9q4EXNV0Bjoa21Q83boued62297UOXDQzsBllYGiHVm55ZPfHmmU2mTiGDwOU29r6dQ8zjEjHt_l-6j56vPKSpuZwQaOBBNm0hpp6Z0Ox48e9scQPcjRJE-GJJ03NSJNGXZi708bYyEhrXIf8GAYm-E3GR19g3MWHDGrWUIgTNutbhXv-pnNNOGFOjfSRaNUQv'),
(5, 'dr_hassan', 'dr.hassan@medicare.com', 'Dr. Hassan Al-Fayed', 'doctor', 'doctor', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmshLczIz47NWamart76id7U5dmbfwRqLLlN1ZNGX-f9Yu79uhYi822P0umpd6y9yeo8ZSk7moDd3if6p7YL1QTLuM0OSRYawrwTvivCEKM5VxiTpPl9IVsJ-KJHXfXvDzuoJwPzHJbjB9-PlDIO9bUU3KrlVKVAMk7v9QzHsg79PdwB210p9pXnLPYSrxPJVauaffZvw4xEvgUD6MKoIun9mFndYcGqSfoj_aW3pzlrcGi8-w-xGOXtNHbYzguZrX8HNgFFtGhGAx'),
(6, 'dr_jenkins', 's.jenkins@medicare.com', 'Dr. Sarah Jenkins', 'doctor', 'doctor', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv8U2UjY-b9CPYDqouPxt3pY70kKmYWvII9XUHE_rFGbNEF9qAGdyjycS37d_6cmYXocChN6SEu8naE9yFhlso8DPBGyg0cY8suSutAibvvR2aW37uzKQsguRTWLlC2XbVceN7_K18Vm3G71lIOjmMBSymJ2fya8vXuTxsJN6Ag1dK6PHUcNzYyvxcMkPlh_mjqPe-wm871GKEYxVbwD6B34Ah6cX00mp-ZLGDUf2yvh03SoeYuVRS87Tn0CsDJLJWmbp54jdu-mDk'),

-- Patient Accounts
(7, 'ahmed', 'ahmed@gmail.com', 'Ahmed Ali', 'patient', 'patient', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEe-Qv4hw3eVhKt8iZ1ObQ28pDYbBAX8k5yzgAF7f4WEZ4RVm1Hfn5XdR4ydHNq92zBtS36GY0ble76LGPh-rWwZ7DT7_idnu2nMPk0LsPPCQbS3WJ5PSJVE3fKdaAqwMnuLNXjB-AcZjYtxEr-hvLjViP3EWeC2udoNjyunLqVI6M7s7tZwDhgh6JoubiHYMIV64Y5YHe6Au3BJ8LdNScxPCGx4oxXI4A7iwRXl2HwrWLWZ4i8l519fWFhnWe73G3vIQymMwDOfAY'),
(8, 'eleanor_m', 'eleanor@gmail.com', 'Eleanor Mitchell', 'patient', 'patient', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUdQ6CZzTYpGTcvOMXB80h2MGUaY1w_StAR8orhKfIGPNN1p6jQD0Nyx-ugJ6mWDd1uBRUnIjHd0-t0hWeqPB3YdP9_rvz4FF60-qLfGjKxoUH-9AAeksgtwneNs29QWiMLKkWNFUylMtptY-7OoRdqBeArHOVnHOEDx_wQdEKRDB_bhkB_INKDIrsSog7tioFtcM-Lf9Taktq_XH-fojyz67HcU0qaZDF0v_2NTQwnZSLMBEzfWAzpgCcE_xcNfj81icYRx7wF7XL'),
(9, 'james_w', 'james.w@gmail.com', 'James Wilson', 'patient', 'patient', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDouka1EBUFVVzR0qUUkVykO2Znmwa2b8fjfFrZJ9M2ldWGEC0lSm5Xdq80uH5MMZBsrhjWCHbFtdnCVmOrx9HnE_xOKFTnW_0jBZe-lXSpRQ5fWPsu--MfZKm610dFAtSjp4JmFMOp31yDeJp-pSJMerZJ_1jnnjPKejzRwEcvSTc_UAHCkHGPRmGnQIE7tJTtg_twY8pfW717cjDhEGmV8uQpQYdP1W8mzI6TDGn8Q8oDpR7ucLT2NSkupiOj1bmrK50vqrJAc4uE'),
(10, 'sarah_c', 'sarah.c@gmail.com', 'Sarah Chen', 'patient', 'patient', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDq0aZPVMJeSdp79ovb3SqBTbDOkAD8NZqRT3Mjl6Mqew9J4qhp4lQrlV2ul3YIdC4luMLEuQLL5EbBegwanp7BRYDyXaKVIbRlILzvhTF145NFjgrJvdeuvRxPFjSAyj_fipKKdvDXE2flrxS6CpLU8S0PbKpqI5b8FH0oOeUt3lQJKH_vG5b-iAl0xRM3kKDbMC3VF400ikC8st28-RlRTzzwJ03QAQF7VScI8tGYsVn2RaAFUv-nSupaYbn79vaay8Sma5tc2XKX'),
(11, 'robert_b', 'robert.b@gmail.com', 'Robert Brown', 'patient', 'patient', NULL);


-- 2. Seed Doctors Table
INSERT INTO doctors (id, user_id, full_name, specialty, title, email, phone, status, availability_text, experience_years, languages) VALUES
('DR-8821', 2, 'Dr. Julianne Smith', 'Neurology', 'Senior Clinical Neurologist', 'j.smith@medicare.com', '+1 555-0144', 'Active', 'Daily', 18, 'English, Spanish'),
('DR-8822', 3, 'Dr. Amit Patel', 'Pediatrics', 'Resident Pediatrician', 'a.patel@medicare.com', '+1 555-0199', 'Active', 'Mon, Wed, Fri', 6, 'English, Hindi'),
('DR-8823', 4, 'Dr. Robert Chen', 'Neurology', 'Department Head', 'r.chen@medicare.com', '+1 555-0122', 'Active', 'Tue, Thu', 22, 'English, Mandarin'),
('DR-8824', 6, 'Dr. Sarah Jenkins', 'Cardiology', 'Senior Cardiologist', 's.jenkins@medicare.com', '+1 555-0123', 'Active', 'Mon, Wed', 12, 'English, French'),
('DR-8825', 5, 'Dr. Hassan Al-Fayed', 'Cardiology', 'Lead General Physician', 'dr.hassan@medicare.com', '+1 555-0155', 'Active', 'Mon, Wed, Sat', 15, 'English, Arabic');


-- 3. Seed Patients Table
INSERT INTO patients (id, user_id, full_name, gender, dob, blood_group, phone, address, emergency_contact_name, emergency_contact_phone, status, reg_date) VALUES
('PT-10293', 7, 'Ahmed Ali', 'Male', '1985-05-12', 'O+', '+1 456-928-1029', '42 Maple Street, Tel Aviv, Israel', 'Fatima Ali', '+1 456-928-1030', 'Active', '2024-01-10'),
('PT-8821', 8, 'Eleanor Mitchell', 'Female', '1982-06-14', 'A+', '+1 (555) 012-3456', '123 Pinecrest Ave, Haifa, Israel', 'Robert Mitchell', '+1 (555) 012-9876', 'Active', '2023-09-14'),
('PT-8822', 9, 'James Wilson', 'Male', '1978-09-12', 'B+', '+1 (555) 098-7654', '88 Gordon St, Tel Aviv, Israel', 'Sarah Wilson', '+1 (555) 098-1111', 'Active', '2023-08-22'),
('PT-8825', 10, 'Sarah Chen', 'Female', '1992-10-03', 'AB+', '+1 (555) 234-5678', '99 Rothschild Blvd, Tel Aviv, Israel', 'Dr. David Chen', '+1 (555) 234-1122', 'Active', '2023-08-22'),
('PT-8830', 11, 'Robert Brown', 'Male', '1974-01-19', 'O-', '+1 (555) 345-6789', '21 King George St, Jerusalem, Israel', 'Mary Brown', '+1 (555) 345-4422', 'Active', '2023-07-05');


-- 4. Seed Appointments Table
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, reason, clinical_notes, status) VALUES
('APT-2941', 'PT-8821', 'DR-8824', '2023-10-24', '10:30 AM', 'Routine cardiovascular screening and follow-up on previous EKG. Patient reports occasional palpitations.', 'Patient blood pressure was slightly elevated. Recommend reducing caffeine and monitoring rest.', 'Approved'),
('APT-2940', 'PT-8822', 'DR-8823', '2023-10-12', '02:15 PM', 'Follow-up on neurological status and migraine treatment review.', 'Symptoms are stabilized. Adjusted dosage of preventative treatment.', 'Completed'),
('APT-2939', 'PT-8825', 'DR-8825', '2023-09-28', '09:00 AM', 'Annual full physical exam and metabolic panel review.', 'Patient requested reschedule owing to travel schedules.', 'Cancelled'),
('APT-2938', 'PT-8830', 'DR-8824', '2023-11-05', '11:45 AM', 'Cardiology screening and check on blood pressure stability.', 'Pre-appointment vitals requested through triage.', 'Pending'),
('APT-2942', 'PT-10293', 'DR-8825', '2026-06-23', '09:00 AM', 'Routine check-up on cardiovascular systems', 'Lungs clear. No signs of infection. Keep ongoing therapy.', 'Approved');


-- 5. Seed Medical Records Table
INSERT INTO medical_records (id, patient_id, doctor_id, visit_date, symptoms, diagnosis, treatment_plan, internal_notes, signed_by) VALUES
('MR-9042', 'PT-8822', 'DR-8821', '2023-10-12', 'Persistent dry cough for 5 days, mild thoracic discomfort, nasal congestion, low-grade fever (38.2°C).', 'Acute Bronchitis (J20.9)', 'Albuterol Inhaler (1-2 puffs of standard medication), Guaifenesin (600mg every 12 hours), Rest and Hydration (minimum 2L daily).', 'Viral origin suspected. Lungs clear to percussion. Signed by Dr. Julianne Smith.', 'Dr. Julianne Smith'),
('MR-8812', 'PT-8825', 'DR-8821', '2023-10-10', 'Headaches, elevated blood pressure baseline, slight dizziness.', 'Hypertension II', 'Lisinopril 10mg daily morning, Sodium restriction nutrition parameters.', 'Continuous home baseline measurements required. Return in 30 days.', 'Dr. Julianne Smith'),
('MR-8750', 'PT-8830', 'DR-8821', '2023-10-08', 'Thirst frequency elevated, blood biochemistry indicates fasting plasma glucose levels slightly out of threshold.', 'Type 2 Diabetes', 'Metformin 500mg twice daily with meals, moderate lifestyle cardio exercise.', 'Highly compliant patient. Baseline lipid panel and HbA1c review.', 'Dr. Julianne Smith');
