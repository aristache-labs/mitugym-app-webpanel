# Check-in API Documentation

## Overview

The Check-in API provides secure endpoints for external devices (daemon/service) to handle member check-ins and check-outs using QR codes. The API validates membership status, expiration dates, and manages check-in/check-out records.

## Authentication

All API requests require an API key passed in the request body:

```json
{
  "api_key": "your_secure_api_key"
}
```

### Setting up API Key

1. Generate a secure API key:
   ```bash
   openssl rand -hex 32
   ```

2. Add to your `.env` file:
   ```env
   CHECKIN_API_KEY=your_generated_key_here
   ```

## Endpoints

### 1. Check-in/Check-out

**Endpoint:** `POST /api/checkin`

**Description:** Handles both check-in and check-out operations for members.

**Request Body:**
```json
{
  "qr_code": "member_id_or_unique_code",
  "api_key": "your_secure_api_key",
  "action": "checkin",  // or "checkout"
  "device_id": "optional_device_identifier"
}
```

**Success Response (Check-in):**
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "checkin_id": "uuid",
    "member_id": "uuid",
    "member_name": "John Doe",
    "membership_status": "active",
    "plan_name": "Monthly Unlimited",
    "expires_at": "2025-12-31T23:59:59Z"
  }
}
```

**Success Response (Check-out):**
```json
{
  "success": true,
  "message": "Check-out successful",
  "data": {
    "checkin_id": "uuid",
    "member_id": "uuid",
    "member_name": "John Doe",
    "membership_status": "active",
    "plan_name": "Monthly Unlimited",
    "expires_at": "2025-12-31T23:59:59Z",
    "duration_minutes": 65
  }
}
```

**Error Responses:**

- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Invalid API key
- **403 Forbidden** - Membership not active/expired
- **404 Not Found** - Member not found or no active check-in
- **409 Conflict** - Member already checked in
- **500 Internal Server Error** - Server error

**Example Error Response:**
```json
{
  "success": false,
  "message": "Membership has expired",
  "error": "Membership expired on 12/15/2024",
  "data": {
    "member_id": "uuid",
    "member_name": "John Doe",
    "membership_status": "expired",
    "expires_at": "2024-12-15T23:59:59Z"
  }
}
```

### 2. Verify Membership

**Endpoint:** `POST /api/checkin/verify`

**Description:** Verifies member eligibility without performing check-in. Useful for pre-validation.

**Request Body:**
```json
{
  "qr_code": "member_id_or_unique_code",
  "api_key": "your_secure_api_key"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Member is eligible for check-in",
  "data": {
    "member_id": "uuid",
    "member_name": "John Doe",
    "email": "john@example.com",
    "membership_status": "active",
    "plan_name": "Monthly Unlimited",
    "starts_at": "2024-01-01T00:00:00Z",
    "expires_at": "2025-12-31T23:59:59Z",
    "days_remaining": 120,
    "is_checked_in": false,
    "can_checkin": true,
    "validation_errors": []
  }
}
```

**Response with Errors:**
```json
{
  "success": true,
  "message": "Member cannot check in",
  "data": {
    "member_id": "uuid",
    "member_name": "John Doe",
    "email": "john@example.com",
    "membership_status": "expired",
    "plan_name": "Monthly Unlimited",
    "starts_at": "2024-01-01T00:00:00Z",
    "expires_at": "2024-12-15T23:59:59Z",
    "days_remaining": -15,
    "is_checked_in": false,
    "can_checkin": false,
    "validation_errors": [
      "Membership expired on 12/15/2024",
      "Membership status is expired"
    ]
  }
}
```

## Validation Rules

The API validates the following before allowing check-in:

1. **Member Exists**: QR code must match a valid member
2. **Membership Status**: Must be "active"
3. **Start Date**: Membership must have started (starts_at <= now)
4. **Expiration**: Membership must not be expired (expires_at > now)
5. **Not Checked In**: Member cannot be already checked in (for check-in action)
6. **Active Check-in Exists**: Must have active check-in (for check-out action)

## QR Code Format

The QR code should contain the member's unique identifier (UUID). This can be:
- The member's `id` from the profiles table
- A custom unique code you generate

**Example QR Code Content:**
```
bc11ca52-7c25-471e-bd28-5159f58bed10
```

## Usage Examples

### cURL Examples

**Check-in:**
```bash
curl -X POST https://your-domain.com/api/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "bc11ca52-7c25-471e-bd28-5159f58bed10",
    "api_key": "your_api_key_here",
    "action": "checkin",
    "device_id": "scanner_001"
  }'
```

**Check-out:**
```bash
curl -X POST https://your-domain.com/api/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "bc11ca52-7c25-471e-bd28-5159f58bed10",
    "api_key": "your_api_key_here",
    "action": "checkout",
    "device_id": "scanner_001"
  }'
```

**Verify:**
```bash
curl -X POST https://your-domain.com/api/checkin/verify \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "bc11ca52-7c25-471e-bd28-5159f58bed10",
    "api_key": "your_api_key_here"
  }'
```

### Python Example (Daemon/Service)

```python
import requests
import json

class GymCheckinClient:
    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.api_key = api_key
    
    def checkin(self, qr_code, device_id=None):
        """Perform check-in for a member"""
        payload = {
            "qr_code": qr_code,
            "api_key": self.api_key,
            "action": "checkin",
            "device_id": device_id
        }
        
        response = requests.post(
            f"{self.api_url}/api/checkin",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        return response.json()
    
    def checkout(self, qr_code, device_id=None):
        """Perform check-out for a member"""
        payload = {
            "qr_code": qr_code,
            "api_key": self.api_key,
            "action": "checkout",
            "device_id": device_id
        }
        
        response = requests.post(
            f"{self.api_url}/api/checkin",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        return response.json()
    
    def verify(self, qr_code):
        """Verify member eligibility"""
        payload = {
            "qr_code": qr_code,
            "api_key": self.api_key
        }
        
        response = requests.post(
            f"{self.api_url}/api/checkin/verify",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        return response.json()

# Usage
client = GymCheckinClient(
    api_url="https://your-domain.com",
    api_key="your_api_key_here"
)

# Verify before check-in
result = client.verify("member_qr_code")
if result["success"] and result["data"]["can_checkin"]:
    # Perform check-in
    checkin_result = client.checkin("member_qr_code", device_id="scanner_001")
    print(f"Check-in: {checkin_result['message']}")
else:
    print(f"Cannot check in: {', '.join(result['data']['validation_errors'])}")
```

## Security Considerations

1. **API Key Storage**: Never commit API keys to version control
2. **HTTPS Only**: Always use HTTPS in production
3. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
4. **IP Whitelisting**: Restrict API access to known device IPs
5. **Logging**: Monitor API usage for suspicious activity
6. **Key Rotation**: Periodically rotate API keys

## Error Handling

Always check the `success` field in the response:

```javascript
const response = await fetch('/api/checkin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

const result = await response.json();

if (result.success) {
  // Handle success
  console.log(result.message);
  console.log(result.data);
} else {
  // Handle error
  console.error(result.error);
  // Display validation errors if available
  if (result.data?.validation_errors) {
    console.error(result.data.validation_errors);
  }
}
```

## Support

For issues or questions, contact your system administrator.

