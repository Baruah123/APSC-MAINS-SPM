import { z } from 'zod';

export const mobileSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number')
});

export const otpSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
});

export const rollNumberSchema = z.object({
  rollNumber: z.string().min(1, 'Roll number is required')
});

export const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim().toLowerCase()
});

export const modeSchema = z.object({
  mode: z.enum(['online', 'offline'], { error: 'Please select a mock test mode' }),
  locationId: z.string().uuid("Please select a valid location").or(z.literal('')).optional(),
  secondLocationId: z.string().uuid("Please select a valid location").or(z.literal('')).optional()
}).refine(data => {
  if (data.mode === 'offline') {
    return data.locationId !== '' && data.secondLocationId !== '';
  }
  return true;
}, {
  message: "Both 1st and 2nd preferences are required for Offline mode",
  path: ["locationId"]
});

export const finalSubmissionSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  mock_test_mode: z.enum(['online', 'offline'], { error: 'Please select a mock test mode' }),
  preferred_location: z.string().uuid("Please select a valid location").or(z.literal('')).optional(),
  second_preferred_location: z.string().uuid("Please select a valid location").or(z.literal('')).optional(),
  acceptance: z.literal(true, {
    error: "You must accept the terms and conditions."
  })
});
