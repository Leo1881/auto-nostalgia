-- Test if admin can see assessment requests with reports
SELECT 
    id,
    user_id,
    vehicle_id,
    assigned_assessor_id,
    status,
    report_url,
    report_generated_at,
    created_at
FROM assessment_requests 
WHERE report_url IS NOT NULL
ORDER BY report_generated_at DESC
LIMIT 5;

-- Also check if admin profile exists and has correct role
SELECT id, full_name, email, role 
FROM profiles 
WHERE role = 'admin';



