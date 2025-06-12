-- First, add unique constraint to register table's national_id column
ALTER TABLE register ADD CONSTRAINT register_national_id_key UNIQUE (national_id);

-- Create the progress_management table
CREATE TABLE progress_management (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_number TEXT NOT NULL REFERENCES register(national_id),
    application_submitted TEXT DEFAULT 'pending' CHECK (application_submitted IN ('pending', 'in_progress', 'complete', 'rejected')),
    document_uploaded TEXT DEFAULT 'pending' CHECK (document_uploaded IN ('pending', 'in_progress', 'complete', 'rejected')),
    payment_verified TEXT DEFAULT 'pending' CHECK (payment_verified IN ('pending', 'in_progress', 'complete', 'rejected')),
    application_review TEXT DEFAULT 'pending' CHECK (application_review IN ('pending', 'in_progress', 'complete', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on student_number for faster lookups
CREATE INDEX idx_progress_management_student_number ON progress_management(student_number);

-- Enable Row Level Security
ALTER TABLE progress_management ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all records
CREATE POLICY "Admins can view all progress management records"
    ON progress_management
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profile
            WHERE user_profile.id = auth.uid()
            AND user_profile.role = 'admin'
        )
    );

-- Create policy for admins to update all records
CREATE POLICY "Admins can update all progress management records"
    ON progress_management
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profile
            WHERE user_profile.id = auth.uid()
            AND user_profile.role = 'admin'
        )
    );

-- Create policy for students to view their own records
CREATE POLICY "Students can view their own progress management records"
    ON progress_management
    FOR SELECT
    TO authenticated
    USING (
        student_number IN (
            SELECT national_id 
            FROM register 
            WHERE register.user_id = auth.uid()
        )
    );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_progress_management_updated_at
    BEFORE UPDATE ON progress_management
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 