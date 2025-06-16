-- Create the notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('success', 'warning', 'info', 'error')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recipient_id UUID REFERENCES auth.users(id),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on recipient_id for faster lookups
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);

-- Create an index on created_at for faster sorting
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications
    FOR SELECT
    TO authenticated
    USING (recipient_id = auth.uid());

-- Create policy for admins to view all notifications
CREATE POLICY "Admins can view all notifications"
    ON notifications
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profile
            WHERE user_profile.id = auth.uid()
            AND user_profile.role = 'admin'
        )
    );

-- Create policy for admins to create notifications
CREATE POLICY "Admins can create notifications"
    ON notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profile
            WHERE user_profile.id = auth.uid()
            AND user_profile.role = 'admin'
        )
    );

-- Create policy for users to update their own notifications (for marking as read)
CREATE POLICY "Users can update their own notifications"
    ON notifications
    FOR UPDATE
    TO authenticated
    USING (recipient_id = auth.uid());

-- Create policy for admins to delete notifications
CREATE POLICY "Admins can delete notifications"
    ON notifications
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profile
            WHERE user_profile.id = auth.uid()
            AND user_profile.role = 'admin'
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
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 