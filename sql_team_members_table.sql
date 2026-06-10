-- SQL Query to create team_members table
-- Run this manually in your database

CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    bio TEXT,
    image_data LONGBLOB,
    image_type VARCHAR(50),
    image_size INT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional: Add some indexes for better performance
CREATE INDEX idx_display_order ON team_members(display_order);
CREATE INDEX idx_created_at ON team_members(created_at);