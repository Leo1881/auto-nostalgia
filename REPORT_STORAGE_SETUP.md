# Report Storage Setup Guide

This guide will help you set up the new report storage functionality that allows customers to download previously generated assessment reports.

## What's New

- **Report Storage**: Generated PDF reports are now saved to Supabase Storage
- **Database Tracking**: Report metadata (URL, generation date, version) is stored in the database
- **Customer Access**: Customers can download saved reports without regenerating them
- **Smart UI**: Shows "Generate Report" button when no report exists, "Download Report" when available

## Setup Steps

### 1. Database Changes

Run the following SQL script in your Supabase SQL editor:

```sql
-- File: add_report_storage_fields.sql
-- This adds report storage fields to the assessment_requests table
```

### 2. Storage Bucket Setup

#### Manual Setup (Required)

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Click **Create a new bucket**
4. Set the following:
   - **Bucket name**: `reports`
   - **Public bucket**: ✅ Yes (so reports can be downloaded)
   - **File size limit**: 50MB (should be enough for PDFs)
5. Click **Create bucket**

#### Storage Policies

Run the following SQL script to set up proper access controls:

```sql
-- File: setup_storage_bucket.sql
-- This sets up RLS policies for the storage bucket
```

### 3. Code Changes

The following files have been updated:

- `src/lib/reportService.js` - Enhanced with storage functionality
- `src/components/customer/AssessmentHistory.jsx` - Added download button
- `src/components/assessor/MySchedule.jsx` - Updated to save reports
- `src/components/assessor/AssessmentHistory.jsx` - Updated to save reports

## How It Works

### For Assessors:

1. Click "Generate Report" on a completed assessment
2. PDF is generated and downloaded to their device
3. **NEW**: PDF is also saved to Supabase Storage
4. Database is updated with report URL and metadata

### For Customers:

1. If no report exists: Shows "Generate Report" button (assessor only)
2. If report exists: Shows "Download Report" button
3. Clicking download fetches the saved PDF from storage

## File Structure

Reports are stored in the following structure:

```
auto-nostalgia-files/
└── assessment_reports/
    ├── {assessment_id}_{registration}_{timestamp}.pdf
    ├── {assessment_id}_{registration}_{timestamp}.pdf
    └── ...
```

## Database Schema Changes

The `assessment_requests` table now includes:

- `report_url` (TEXT) - Public URL to the stored PDF
- `report_generated_at` (TIMESTAMP) - When the report was generated
- `report_version` (INTEGER) - Report version number (for future use)

## Testing

1. **Generate a Report**: As an assessor, complete an assessment and generate a report
2. **Check Storage**: Verify the PDF appears in your Supabase Storage bucket
3. **Check Database**: Verify the `report_url` field is populated in the database
4. **Customer Download**: As a customer, verify you can see and download the report

## Troubleshooting

### Common Issues:

1. **Storage Bucket Not Found**

   - Ensure you've created the `auto-nostalgia-files` bucket
   - Check that the bucket name matches exactly

2. **Permission Denied**

   - Run the storage policies SQL script
   - Ensure the user has the correct role (assessor/admin for uploads)

3. **Report Not Saving**
   - Check browser console for errors
   - Verify the assessment ID exists in the database
   - Check that the user has assessor privileges

### Debug Steps:

1. Check browser console for JavaScript errors
2. Check Supabase logs for database/storage errors
3. Verify the storage bucket exists and is public
4. Confirm the user has the correct role in the profiles table

## Future Enhancements

- **Report Versioning**: Track multiple versions of reports
- **Report Templates**: Different report formats/styles
- **Bulk Operations**: Generate reports for multiple assessments
- **Email Integration**: Automatically email reports to customers
- **Report Analytics**: Track report generation and download statistics
