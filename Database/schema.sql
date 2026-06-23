-- MediCare HMS Database Schema for MySQL
-- Create database if it does exist, or define tables directly

CREATE DATABASE IF NOT EXISTS medicare_hms;
USE medicare_hms;

-- Users Table
-- Holds login accounts for Patients, Doctors, and Administrators
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Stored as cleartext as requested
    role ENUM('admin', 'doctor', 'patient') NOT NULL,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Doctors Table
-- Holds medical staff profiles
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(50) PRIMARY KEY, -- e.g., DR-8821
    user_id INT,
    full_name VARCHAR(150) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL, -- e.g., 'Senior Cardiologist'
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    status ENUM('Active', 'Inactive', 'In Visit') DEFAULT 'Active',
    availability_text VARCHAR(255) DEFAULT 'Daily',
    experience_years INT DEFAULT 0,
    languages VARCHAR(255) DEFAULT 'English',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_doctor_specialty (specialty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Patients Table
-- Holds clinical profiles with demographic details
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY, -- e.g., PT-8821 or PT-10293
    user_id INT,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    dob DATE NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    emergency_contact_name VARCHAR(150) NOT NULL,
    emergency_contact_phone VARCHAR(50) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    reg_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_patient_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Appointments Table
-- Manages visits booked by patients or scheduled by administrators
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY, -- e.g., APT-2941
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(50) NOT NULL, -- e.g., '10:30 AM'
    reason TEXT NOT NULL,
    clinical_notes TEXT,
    status ENUM('Pending', 'Approved', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Medical Records Table
-- Contains clinical history, primary diagnoses, and treatment plans
CREATE TABLE IF NOT EXISTS medical_records (
    id VARCHAR(50) PRIMARY KEY, -- e.g., MR-9042
    patient_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    visit_date DATE NOT NULL,
    symptoms TEXT NOT NULL,
    diagnosis VARCHAR(255) NOT NULL, -- ICD-10 or Clinical Description
    treatment_plan TEXT NOT NULL,
    internal_notes TEXT,
    signed_by VARCHAR(150) NOT NULL, -- Doctor Signature
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_record_patient (patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
