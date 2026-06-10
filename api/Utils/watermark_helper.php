<?php

/**
 * Generates a Tilted, Transparent Tile for Watermarking.
 * Returns raw binary data (BLOB).
 */
function createStudentWatermarkBlob($phoneNumber)
{
    // 1. TILE SIZE (Small 300x300 for repeating pattern)
    $width = 300;
    $height = 300;
    $image = imagecreatetruecolor($width, $height);

    // 2. TRANSPARENCY
    imagealphablending($image, false);
    imagesavealpha($image, true);
    $transparent = imagecolorallocatealpha($image, 0, 0, 0, 127);
    imagefill($image, 0, 0, $transparent);

    // 3. TEXT COLOR (Dark Grey, Semi-Transparent)
    // Alpha 90 means it is visible but see-through
    $textColor = imagecolorallocatealpha($image, 50, 50, 50, 90);

    // 4. FIND FONT FILE
    // We check for 'ARIAL.TTF'
    $fontPath = __DIR__ . '/ARIAL.TTF';
    if (!file_exists($fontPath)) {
        $fontPath = __DIR__ . '/arial.ttf';
    }
    if (!file_exists($fontPath)) {
        $fontPath = __DIR__ . '/font.ttf';
    }

    // --- OPTION A: If Font Exists (Best Quality) ---
    if (file_exists($fontPath)) {
        imagealphablending($image, true);

        $fontSize = 22;
        $angle = 45;

        // Center logic
        $bbox = imagettfbbox($fontSize, $angle, $fontPath, $phoneNumber);
        $textW = $bbox[2] - $bbox[6];
        $textH = $bbox[3] - $bbox[7];

        $x = ($width / 2) - ($textW / 2);
        $y = ($height / 2) + ($textH / 2);

        imagettftext($image, $fontSize, $angle, $x, $y, $textColor, $fontPath, $phoneNumber);
    }
    // --- OPTION B: Emergency Fallback (Force Rotate) ---
    else {
        // Create a temporary canvas
        $tempW = 200;
        $tempH = 50;
        $tempImg = imagecreatetruecolor($tempW, $tempH);

        // Make temp transparent
        imagealphablending($tempImg, false);
        imagesavealpha($tempImg, true);
        $tempTrans = imagecolorallocatealpha($tempImg, 0, 0, 0, 127);
        imagefill($tempImg, 0, 0, $tempTrans);

        // Write text (Horizontal)
        $fallbackColor = imagecolorallocatealpha($tempImg, 50, 50, 50, 80);
        imagestring($tempImg, 5, 10, 15, $phoneNumber, $fallbackColor);

        // Rotate the entire image 45 degrees
        $rotated = imagerotate($tempImg, 45, $transparent);

        // Paste into center
        imagealphablending($image, true);
        $rotW = imagesx($rotated);
        $rotH = imagesy($rotated);
        imagecopy($image, $rotated, ($width - $rotW) / 2, ($height - $rotH) / 2, 0, 0, $rotW, $rotH);

        imagedestroy($tempImg);
        imagedestroy($rotated);
    }

    // 5. Output
    ob_start();
    imagepng($image);
    $imageData = ob_get_contents();
    ob_end_clean();
    imagedestroy($image);

    return $imageData;
}
?>