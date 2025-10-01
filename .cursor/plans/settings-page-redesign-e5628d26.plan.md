<!-- e5628d26-1712-4621-a469-82390639658a 34243ee2-605d-453a-a3d8-ea39dd66cf21 -->
# Rotating QR Code Security System

## Overview

Implement a production-ready rotating QR code system using **TOTP (Time-based One-Time Password)** algorithm - the same technology used in Google Authenticator and most 2FA systems. This provides maximum security while being battle-tested and standardized.

## Design Decisions (Best Practices)

### 1. **QR Code Content** - TOTP Token

**Format:** `{member_id}:{6-digit-totp-code}`

- Example: `bc11ca52-7c25-471e-bd28-5159f58bed10:847293`
- **Why TOTP:**
  - Industry standard (RFC 6238)
  - Proven security
  - Time-synchronized without network dependency
  - Impossible to forge without secret key

### 2. **Token Generation** - React Native App

- Generate client-side using TOTP algorithm
- Uses member-specific secret stored securely
- Refreshes every 30 seconds automatically
- No API calls needed for QR generation

### 3. **Validation Window** - 60 seconds (2 time steps)

- Accept current token (0-30s old)
- Accept previous token (30-60s old)
- **Grace period prevents:**
  - Clock drift issues
  - Network delays
  - Scanner processing time
- Rejects tokens >60s old

### 4. **Secret Key** - Member-Specific Secrets

- Each member gets unique TOTP secret on account creation
- Stored in database: `profiles.totp_secret` (base32 encoded)
- 160-bit entropy (industry standard)
- Never transmitted, only used for validation

### 5. **Implementation Scope**

**Phase 1: Backend (This Plan)**

- Add `totp_secret` column to profiles table
- Create token generation endpoint for mobile app setup
- Update check-in API to validate TOTP tokens
- Add TOTP validation library

**Phase 2: Mobile App** (Future)

- Generate TOTP codes every 30 seconds
- Display as QR code (member_id:totp_code format)
- Auto-refresh UI countdown

## Technical Implementation

### Database Changes

Add TOTP secret column to profiles:

```sql
ALTER TABLE profiles 
ADD COLUMN totp_secret TEXT;

-- Create index for faster lookups
CREATE INDEX idx_profiles_totp ON profiles(id, totp_secret);
```

### New API Endpoints

**1. GET `/api/member/totp-setup/:memberId`**

- Generates and returns TOTP secret for member
- Called once during mobile app setup
- Returns: secret, QR setup URL, backup codes

**2. POST `/api/checkin` (Updated)**

- Changes QR validation from direct member ID to TOTP verification
- Format: `{member_id}:{totp_code}`
- Validates TOTP before proceeding
- **Smart Action Detection:**
  - If member NOT checked in → Perform check-in
  - If member IS checked in → Perform check-out
  - Single endpoint handles both actions automatically

**3. Mobile App Flow:**

- Member opens app → Shows rotating QR (member_id:totp)
- **Entering gym:** Scan QR → API detects no active check-in → Check-in
- **Leaving gym:** Scan same QR → API detects active check-in → Check-out
- No manual action selection needed!

### Security Features

1. **Replay Attack Prevention**

   - Each TOTP code valid for max 60 seconds
   - Cannot reuse old codes after window expires

2. **Brute Force Protection** 

   - Rate limiting already in place (IP, API key, member)
   - 6-digit code = 1 million combinations
   - With rate limiting: practically impossible to brute force in 60s

3. **Secret Protection**

   - Secrets never sent to client after initial setup
   - Encrypted at rest in database (if RLS enabled)
   - Only admin service role can access

4. **Time Synchronization**

   - Uses UTC timestamps
   - 30-second time steps standard
   - Tolerates ±30s clock drift

## Files to Create/Modify

### New Files

1. `src/lib/totp.ts` - TOTP generation and validation utilities
2. `src/app/api/member/totp-setup/[memberId]/route.ts` - TOTP setup endpoint
3. Database migration script for adding totp_secret column

### Modified Files

1. `src/app/api/checkin/route.ts` - Update QR validation logic
2. `src/app/api/checkin/verify/route.ts` - Update verification logic
3. `src/types/index.ts` - Add TOTP types
4. `src/lib/data.ts` - Update member queries to include totp_secret

### NPM Package

Install `otpauth` - Lightweight, secure TOTP library

```bash
npm install otpauth
```

## Implementation Steps

### Step 1: Install Dependencies

- Add otpauth package for TOTP

### Step 2: Database Migration

- Add totp_secret column to profiles
- Generate secrets for existing members

### Step 3: Create TOTP Utilities

- Generate secrets
- Create TOTP tokens
- Validate TOTP tokens with time window

### Step 4: Create Setup Endpoint

- API to generate and store member TOTP secret
- Return secret for mobile app configuration

### Step 5: Update Check-in API

- Parse QR format (member_id:totp_code)
- Validate TOTP before proceeding
- Maintain backward compatibility

### Step 6: Testing

- Test token generation
- Test validation window (current + previous)
- Test expired token rejection
- Test rate limiting with TOTP

## Security Considerations

✅ **Advantages:**

- Industry-standard security
- Offline token generation
- No database lookup for every QR refresh
- Resistant to replay attacks
- Time-limited validity

⚠️ **Important Notes:**

- Mobile app and server must have accurate time (NTP sync)
- Backup mechanism needed if member loses phone
- Admin should be able to regenerate secrets if compromised

## Backward Compatibility

During transition period:

- Check if QR contains `:` separator
- If yes: Parse as `member_id:totp` (new system)
- If no: Treat as direct `member_id` (old system)
- Gradually migrate all members to TOTP

## Success Metrics

- 99.9% validation success rate
- <100ms validation time
- Zero security incidents
- Seamless user experience
- 30-second QR refresh cycle

### To-dos

- [ ] Create reusable Tabs component with gradient styling matching dashboard design
- [ ] Create Collapsible component with smooth animations and chevron icons
- [ ] Refactor TimezoneSettings to compact horizontal grid layout without Card wrapper
- [ ] Refactor RateLimitSettings to 2-3 column grid layout without Card wrapper
- [ ] Update ApiLogTable to support stats-only display mode for collapsed state
- [ ] Restructure settings page.tsx with tabbed interface and collapsible sections