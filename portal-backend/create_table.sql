-- Create user_mail table
CREATE TABLE IF NOT EXISTS user_mail (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    alamat TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_mail_email ON user_mail(email);

-- Insert sample data (optional)
INSERT INTO user_mail (email, nama, no_hp, alamat) VALUES 
    ('admin@dprkp.go.id', 'Administrator', '081234567890', 'Jl. Sudirman No. 1, Jakarta'),
    ('user@dprkp.go.id', 'User Test', '081234567891', 'Jl. Thamrin No. 2, Jakarta')
ON CONFLICT (email) DO NOTHING; 