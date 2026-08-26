import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  try {
    // Check authentication here if needed, but since it's under /api/admin, 
    // it's likely protected by middleware.ts.
    
    // Fetch all locations for mapping
    const { data: locations } = await supabaseAdmin.from('test_locations').select('id, name');
    const locationMap: Record<string, string> = locations?.reduce((acc: any, loc: any) => {
      acc[loc.id] = loc.name;
      return acc;
    }, {}) || {};

    // Fetch all registrations
    const { data: registrations, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Format data for Excel
    const formattedData = registrations.map((reg) => ({
      'Registration ID': reg.registration_id,
      'Candidate Name': reg.candidate_name,
      'Roll Number': reg.roll_number,
      'Mobile Number': reg.mobile_number, // xlsx might treat as number, we can force string if needed
      'Email': reg.email,
      'Gender': reg.gender,
      'Date of Birth': reg.date_of_birth,
      'Category': reg.category,
      'Test Mode': reg.mock_test_mode === 'offline' ? 'Offline' : 'Online',
      'Preferred Center 1': reg.mock_test_mode === 'offline' && reg.preferred_location ? (locationMap[reg.preferred_location] || reg.preferred_location) : 'N/A',
      'Preferred Center 2': reg.mock_test_mode === 'offline' && reg.second_preferred_location ? (locationMap[reg.second_preferred_location] || reg.second_preferred_location) : 'N/A',
      'Course Enrolled': reg.course_enrolled_in || 'N/A',
      'Other Course Details': reg.other_course_details || '',
      'Year of Enrollment': reg.year_of_enrollment || '',
      'Month of Enrollment': reg.month_of_enrollment || '',
      'Batch Timing': reg.batch_timing || '',
      'Transaction ID': reg.transaction_id,
      'Status': reg.status,
      'Remarks': reg.remarks || '',
      'Registration Date': new Date(reg.created_at).toLocaleString(),
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    // Force mobile number to be a string in Excel so it doesn't lose leading zeros
    // (A bit complex with xlsx, but usually json_to_sheet treats strings as strings if they have non-numeric or if we use raw: false)
    // Actually, setting the column width is also nice.
    const wscols = [
      { wch: 20 }, // Registration ID
      { wch: 30 }, // Candidate Name
      { wch: 15 }, // Roll Number
      { wch: 15 }, // Mobile Number
      { wch: 30 }, // Email
      { wch: 10 }, // Gender
      { wch: 15 }, // Date of Birth
      { wch: 15 }, // Category
      { wch: 10 }, // Test Mode
      { wch: 25 }, // Preferred Center 1
      { wch: 25 }, // Preferred Center 2
      { wch: 35 }, // Course Enrolled
      { wch: 30 }, // Other Course Details
      { wch: 20 }, // Year of Enrollment
      { wch: 20 }, // Month of Enrollment
      { wch: 20 }, // Batch Timing
      { wch: 25 }, // Transaction ID
      { wch: 15 }, // Status
      { wch: 40 }, // Remarks
      { wch: 25 }, // Registration Date
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="registrations_export.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating excel:', error);
    return NextResponse.json({ error: 'Failed to generate excel' }, { status: 500 });
  }
}
