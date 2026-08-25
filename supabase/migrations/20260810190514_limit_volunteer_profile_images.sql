/*
# Limit volunteer profile image uploads

1. Storage Changes
- Limits `volunteer-profiles` uploads to 5 MB.
- Allows only JPEG, PNG, WebP, and GIF image formats.

2. Safety
- This prevents oversized or non-image files from being stored through the profile uploader.
- No existing application or profile data is changed.
*/

UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
WHERE id = 'volunteer-profiles';