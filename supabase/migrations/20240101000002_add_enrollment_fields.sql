-- Add course enrollment fields to registrations table
ALTER TABLE registrations
ADD COLUMN course_enrolled_in text,
ADD COLUMN other_course_details text,
ADD COLUMN year_of_enrollment text,
ADD COLUMN month_of_enrollment text,
ADD COLUMN batch_timing text;
