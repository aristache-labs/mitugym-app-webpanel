-- =============================================================================
-- MEMBER STATUS MONITORING & MANAGEMENT SCRIPTS
-- =============================================================================
-- This file contains useful SQL queries for monitoring and managing member statuses
-- in the Supabase database.

-- -----------------------------------------------------------------------------
-- 1. VIEW ALL SCHEDULED CRON JOBS
-- -----------------------------------------------------------------------------
-- Shows all scheduled jobs including the daily member status update
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active,
  CASE 
    WHEN jobname = 'daily-member-status-update' THEN '🔄 Runs at midnight Romania time (22:00 UTC)'
    WHEN jobname = 'auto-checkout-realtime' THEN '🚪 Runs every 4 hours'
    WHEN jobname = 'cleanup-invalid-checkins' THEN '🧹 Runs hourly'
    WHEN jobname = 'expire-old-announcements' THEN '📢 Runs every 12 hours'
    ELSE 'Other job'
  END as description
FROM cron.job 
ORDER BY jobname;


-- -----------------------------------------------------------------------------
-- 2. CHECK CRON JOB EXECUTION HISTORY
-- -----------------------------------------------------------------------------
-- View the last 10 executions of the daily member status update job
SELECT 
  jobid,
  runid,
  status,
  return_message,
  start_time AT TIME ZONE 'Europe/Bucharest' as start_time_romania,
  end_time AT TIME ZONE 'Europe/Bucharest' as end_time_romania,
  EXTRACT(MILLISECONDS FROM (end_time - start_time)) as duration_ms
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-member-status-update')
ORDER BY start_time DESC 
LIMIT 10;


-- -----------------------------------------------------------------------------
-- 3. VIEW MEMBER STATUS OVERVIEW
-- -----------------------------------------------------------------------------
-- Shows all members with their stored vs calculated status
SELECT 
  first_name,
  last_name,
  email,
  stored_status,
  calculated_status,
  starts_at,
  expires_at,
  CASE 
    WHEN status_needs_update THEN '⚠️ NEEDS UPDATE'
    ELSE '✅ In Sync'
  END as sync_status
FROM member_statuses
ORDER BY 
  status_needs_update DESC,
  last_name, 
  first_name;


-- -----------------------------------------------------------------------------
-- 4. CHECK FOR OUT-OF-SYNC STATUSES
-- -----------------------------------------------------------------------------
-- Shows only members whose stored status doesn't match calculated status
SELECT 
  first_name || ' ' || last_name as member_name,
  email,
  stored_status as current_in_db,
  calculated_status as should_be,
  starts_at,
  expires_at,
  CASE 
    WHEN starts_at > CURRENT_DATE THEN 'Plan not started yet'
    WHEN expires_at < NOW() THEN 'Plan expired'
    ELSE 'Plan is active'
  END as reason
FROM member_statuses
WHERE status_needs_update = true
ORDER BY last_name, first_name;


-- -----------------------------------------------------------------------------
-- 5. MANUALLY TRIGGER STATUS UPDATE (ALL MEMBERS)
-- -----------------------------------------------------------------------------
-- Run this to immediately update all member statuses
SELECT update_all_member_statuses() as members_updated;


-- -----------------------------------------------------------------------------
-- 6. MANUALLY TRIGGER DAILY UPDATE FUNCTION
-- -----------------------------------------------------------------------------
-- Run this to test the full daily update process
SELECT * FROM daily_member_status_update();


-- -----------------------------------------------------------------------------
-- 7. VIEW STATUS DISTRIBUTION
-- -----------------------------------------------------------------------------
-- Shows count of members by status
SELECT 
  calculated_status,
  COUNT(*) as member_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM member_statuses), 2) as percentage
FROM member_statuses
GROUP BY calculated_status
ORDER BY member_count DESC;


-- -----------------------------------------------------------------------------
-- 8. VIEW MEMBERS BY STATUS TYPE
-- -----------------------------------------------------------------------------
-- Pending Members (Plan not started yet)
SELECT 
  first_name || ' ' || last_name as member_name,
  email,
  starts_at,
  expires_at,
  DATE_PART('day', starts_at - CURRENT_DATE) as days_until_start
FROM member_statuses
WHERE calculated_status = 'pending'
ORDER BY starts_at;

-- Active Members
SELECT 
  first_name || ' ' || last_name as member_name,
  email,
  starts_at,
  expires_at,
  DATE_PART('day', expires_at - NOW()) as days_until_expiry
FROM member_statuses
WHERE calculated_status = 'active'
ORDER BY expires_at;

-- Expired Members
SELECT 
  first_name || ' ' || last_name as member_name,
  email,
  starts_at,
  expires_at,
  DATE_PART('day', NOW() - expires_at) as days_since_expired
FROM member_statuses
WHERE calculated_status = 'expired'
ORDER BY expires_at DESC;


-- -----------------------------------------------------------------------------
-- 9. DISABLE/ENABLE THE DAILY STATUS UPDATE JOB
-- -----------------------------------------------------------------------------
-- Disable the job (in case you need to stop automatic updates)
-- UPDATE cron.job 
-- SET active = false 
-- WHERE jobname = 'daily-member-status-update';

-- Enable the job (to resume automatic updates)
-- UPDATE cron.job 
-- SET active = true 
-- WHERE jobname = 'daily-member-status-update';


-- -----------------------------------------------------------------------------
-- 10. DELETE THE CRON JOB (if needed)
-- -----------------------------------------------------------------------------
-- Use this only if you want to completely remove the scheduled job
-- SELECT cron.unschedule('daily-member-status-update');


-- -----------------------------------------------------------------------------
-- 11. VIEW CURRENT TIME IN ROMANIA
-- -----------------------------------------------------------------------------
-- Useful for verifying the cron schedule
SELECT 
  NOW() as utc_time,
  NOW() AT TIME ZONE 'Europe/Bucharest' as romania_time,
  CURRENT_DATE as today,
  EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'Europe/Bucharest')) as current_hour_romania;


-- -----------------------------------------------------------------------------
-- 12. AUDIT: VIEW RECENT STATUS CHANGES
-- -----------------------------------------------------------------------------
-- If you have audit logging enabled, this shows recent member status changes
SELECT 
  actor_id,
  action,
  entity,
  resource_name,
  changes->>'status' as status_change,
  created_at AT TIME ZONE 'Europe/Bucharest' as changed_at_romania
FROM audit_logs
WHERE entity = 'member' 
  AND changes ? 'status'
ORDER BY created_at DESC
LIMIT 20;


-- =============================================================================
-- NOTES:
-- =============================================================================
-- • The daily status update runs at 22:00 UTC (midnight Romania time)
-- • Statuses are also automatically updated when a member record is modified
-- • The calculate_member_status() function accounts for Romania timezone (UTC+2/+3)
-- • Use member_statuses view to check if any members are out of sync
-- =============================================================================

