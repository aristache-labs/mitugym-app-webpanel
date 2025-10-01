# TOTP QR Code System - Quick Reference Card

## 🚀 Quick Start

### 1. Setup TOTP for a Member
```bash
curl -X GET "http://localhost:3000/api/member/totp-setup/MEMBER_ID?api_key=YOUR_API_KEY"
```

### 2. Generate QR Code (Mobile App)
```typescript
import { TOTP, Secret } from 'otpauth';

const totp = new TOTP({
  issuer: 'MituGym',
  label: memberId,
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  secret: Secret.fromBase32(totpSecret)
});

const qrContent = `${memberId}:${totp.generate()}`;
```

### 3. Scan QR Code (Smart Check-in/out)
```bash
curl -X POST http://localhost:3000/api/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "member_id:123456",
    "api_key": "YOUR_API_KEY",
    "action": "auto"
  }'
```

## 📋 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/member/totp-setup/:id` | GET | Setup TOTP for member |
| `/api/checkin` | POST | Check-in or check-out |
| `/api/checkin/verify` | POST | Verify membership only |

## 🔑 QR Code Formats

```
TOTP:   bc11ca52-7c25-471e-bd28-5159f58bed10:464472
Legacy: bc11ca52-7c25-471e-bd28-5159f58bed10
```

## ⚙️ TOTP Settings

- **Code Length:** 6 digits
- **Refresh Rate:** 30 seconds
- **Valid Window:** 60 seconds (current + previous)
- **Algorithm:** SHA1
- **Secret Size:** 160 bits

## 🎯 Smart Action Detection

| Current State | Action Taken |
|---------------|--------------|
| Not checked in | → Check-in |
| Checked in | → Check-out |

**Use:** `"action": "auto"` or omit action parameter

## 🛡️ Rate Limits

| Type | Limit | Window |
|------|-------|--------|
| IP | 100 | per minute |
| API Key | 60 | per minute |
| Member | 20 | per minute |

## ❌ Common Errors

| Code | Error | Solution |
|------|-------|----------|
| 400 | Invalid QR format | Use `member_id:code` format |
| 401 | Invalid/expired code | Wait for fresh code |
| 403 | TOTP not configured | Run `/api/member/totp-setup` |
| 404 | Member not found | Check member ID |
| 429 | Rate limit exceeded | Wait for reset |

## ✅ Success Response Example

```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "checkin_id": "uuid",
    "member_id": "uuid",
    "member_name": "Andrei Cristache",
    "membership_status": "active",
    "plan_name": "Premium",
    "expires_at": "2025-12-31T23:59:59Z"
  }
}
```

## 🧪 Testing

```powershell
# Test complete workflow
node -e "
const { TOTP, Secret } = require('otpauth');
const secret = 'YOUR_SECRET';
const totp = new TOTP({
  issuer: 'MituGym',
  label: 'test',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  secret: Secret.fromBase32(secret)
});
console.log(totp.generate());
"
```

## 📱 Mobile App Checklist

- [ ] Install `otpauth` package
- [ ] Call TOTP setup endpoint
- [ ] Store secret securely (Keychain/Keystore)
- [ ] Generate QR every 30 seconds
- [ ] Display countdown timer
- [ ] Test check-in/check-out flow

## 🔧 Troubleshooting

**QR code expired immediately?**
- Check device time is accurate (enable NTP)
- Verify 30-second refresh interval

**Always getting 401?**
- Confirm correct TOTP secret
- Re-run setup if needed
- Check clock synchronization

**Rate limit issues?**
- Add delays between requests (min 3 seconds)
- Check for infinite loops

## 📚 Full Documentation

- **Complete Guide:** `docs/TOTP_QR_SYSTEM.md`
- **Implementation Summary:** `TOTP_IMPLEMENTATION_SUMMARY.md`
- **API Docs:** `docs/CHECKIN_API.md`

## 💡 Pro Tips

1. **Countdown Timer:** Show `30 - (now % 30)` seconds
2. **Preload Next Code:** Generate slightly before refresh
3. **Offline First:** TOTP works without internet
4. **Large QR:** Minimum 300x300px for easy scanning
5. **Error Handling:** Always show user-friendly messages

---

**Version:** 1.0.0 | **Last Updated:** Oct 1, 2025

