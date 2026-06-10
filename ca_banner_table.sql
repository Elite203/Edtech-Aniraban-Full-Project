CREATE TABLE IF NOT EXISTS ca_banner_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    banner_image LONGBLOB,
    insta_link TEXT,
    fb_link TEXT,
    wa_link TEXT,
    li_link TEXT,
    tg_link TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initialize with a default row
INSERT INTO ca_banner_settings (id, insta_link, fb_link, wa_link, li_link, tg_link)
VALUES (1, '#', '#', '#', '#', '#')
ON DUPLICATE KEY UPDATE id=id;
