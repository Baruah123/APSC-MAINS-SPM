-- Migration: Add second_preferred_location to registrations

ALTER TABLE registrations
ADD COLUMN second_preferred_location UUID NULL REFERENCES test_locations(id);
