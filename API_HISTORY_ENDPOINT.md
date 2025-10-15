# 📜 API History Endpoint Documentation

## 🎯 Overview

The `/api/history` endpoint provides access to check-in/check-out history from the `api_logs` table, enabling your Flutter desktop app to sync server data.

## 🔗 Endpoint

```
GET /api/history
```

## 🔑 Authentication

Requires API key authentication via query parameter:

```
api_key=your_checkin_api_key
```

## 📥 Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `api_key` | string | ✅ Yes | - | API authentication key |
| `limit` | integer | ❌ No | 100 | Number of records to return (min: 1, max: 1000) |
| `created_at` | string | ❌ No | - | Filter by timestamp (format: `gte.2025-10-08T23:06:59.135565`) |

### Timestamp Filter Operators

The `created_at` parameter supports the following operators:

- `gte.{timestamp}` - Greater than or equal to
- `gt.{timestamp}` - Greater than
- `lte.{timestamp}` - Less than or equal to
- `lt.{timestamp}` - Less than
- `eq.{timestamp}` - Equal to
- `{timestamp}` - Defaults to `gte` if no operator specified

**Timestamp Format:** ISO 8601 with microseconds
```
2025-10-08T23:06:59.135565
```

## 📤 Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "endpoint": "/api/checkin",
      "method": "POST",
      "status_code": 200,
      "member_id": "bc11ca52-7c25-471e-bd28-5159f58bed10",
      "member_name": "Andrei Cristache",
      "api_action": "checkin",
      "success": true,
      "error_message": null,
      "response_data": {
        "checkin_id": "c12191f5-5088-489c-a468-fabd9bc20882",
        "member_id": "bc11ca52-7c25-471e-bd28-5159f58bed10",
        "member_name": "Andrei Cristache",
        "avatar_url": "https://example.supabase.co/storage/v1/object/public/avatars/member.jpg",
        "membership_status": "active",
        "plan_name": "FITNESS 1 LUNĂ",
        "expires_at": "2025-10-17T03:00:00+03:00"
      },
      "ip_address": "192.168.1.100",
      "duration_ms": 245,
      "created_at": "2025-10-08T23:06:59.135565+00:00"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "endpoint": "/api/checkin",
      "method": "POST",
      "status_code": 200,
      "member_id": "bc11ca52-7c25-471e-bd28-5159f58bed10",
      "member_name": "Andrei Cristache",
      "api_action": "checkout",
      "success": true,
      "error_message": null,
      "response_data": {
        "checkin_id": "c12191f5-5088-489c-a468-fabd9bc20882",
        "member_id": "bc11ca52-7c25-471e-bd28-5159f58bed10",
        "member_name": "Andrei Cristache",
        "avatar_url": "https://example.supabase.co/storage/v1/object/public/avatars/member.jpg",
        "membership_status": "active",
        "plan_name": "FITNESS 1 LUNĂ",
        "expires_at": "2025-10-17T03:00:00+03:00",
        "duration_minutes": 116
      },
      "ip_address": "192.168.1.100",
      "duration_ms": 189,
      "created_at": "2025-10-08T21:10:15.234567+00:00"
    }
  ],
  "count": 2
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Invalid query parameters",
  "error": "limit: Number must be less than or equal to 1000"
}
```

### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "message": "Invalid API key",
  "error": "Authentication failed"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Failed to fetch history",
  "error": "Database connection error"
}
```

## 📋 Response Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | string | No | Unique log entry ID (UUID) |
| `endpoint` | string | No | API endpoint (always `/api/checkin`) |
| `method` | string | No | HTTP method (always `POST`) |
| `status_code` | integer | No | HTTP status code (200, 401, 403, etc.) |
| `member_id` | string | Yes | Member UUID |
| `member_name` | string | Yes | Full name of the member |
| `api_action` | string | Yes | Action type: `checkin` or `checkout` |
| `success` | boolean | No | Whether the operation was successful |
| `error_message` | string | Yes | Error description if failed |
| `response_data` | object | Yes | Full API response data (includes avatar_url) |
| `ip_address` | string | Yes | Client IP address |
| `duration_ms` | integer | Yes | API request duration in milliseconds |
| `created_at` | string | No | ISO 8601 timestamp with timezone |

## 🎯 Example Requests

### Get Latest 100 Records

```bash
curl -X GET "https://your-domain.vercel.app/api/history?api_key=YOUR_API_KEY"
```

### Get Latest 50 Records

```bash
curl -X GET "https://your-domain.vercel.app/api/history?api_key=YOUR_API_KEY&limit=50"
```

### Get Records Since Specific Timestamp

```bash
curl -X GET "https://your-domain.vercel.app/api/history?api_key=YOUR_API_KEY&created_at=gte.2025-10-08T23:06:59.135565"
```

### Get Records Between Timestamps (requires multiple calls)

```bash
# Get records after a certain time
curl -X GET "https://your-domain.vercel.app/api/history?api_key=YOUR_API_KEY&created_at=gte.2025-10-08T00:00:00.000000&limit=1000"

# Then filter in your app for records before a certain time
```

## 🔄 Syncing Strategy for Flutter App

### Initial Sync

```dart
Future<List<LogEntry>> initialSync() async {
  final response = await http.get(
    Uri.parse('https://your-domain.vercel.app/api/history')
        .replace(queryParameters: {
      'api_key': apiKey,
      'limit': '1000', // Get maximum records
    }),
  );
  
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return (data['data'] as List)
        .map((e) => LogEntry.fromJson(e))
        .toList();
  }
  throw Exception('Failed to sync');
}
```

### Incremental Sync

```dart
Future<List<LogEntry>> incrementalSync(DateTime lastSyncTime) async {
  // Format: gte.2025-10-08T23:06:59.135565
  final timestamp = lastSyncTime.toIso8601String();
  
  final response = await http.get(
    Uri.parse('https://your-domain.vercel.app/api/history')
        .replace(queryParameters: {
      'api_key': apiKey,
      'created_at': 'gte.$timestamp',
      'limit': '500',
    }),
  );
  
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return (data['data'] as List)
        .map((e) => LogEntry.fromJson(e))
        .toList();
  }
  throw Exception('Failed to sync');
}
```

### Polling for New Records

```dart
Timer.periodic(Duration(seconds: 30), (_) async {
  final lastSync = await getLastSyncTime();
  final newRecords = await incrementalSync(lastSync);
  
  if (newRecords.isNotEmpty) {
    await saveToLocalDatabase(newRecords);
    await updateLastSyncTime(DateTime.now());
    print('Synced ${newRecords.length} new records');
  }
});
```

## 🗂️ Data Model for Flutter

```dart
class LogEntry {
  final String id;
  final String endpoint;
  final String method;
  final int statusCode;
  final String? memberId;
  final String? memberName;
  final String? apiAction; // 'checkin' or 'checkout'
  final bool success;
  final String? errorMessage;
  final Map<String, dynamic>? responseData;
  final String? ipAddress;
  final int? durationMs;
  final DateTime createdAt;

  LogEntry({
    required this.id,
    required this.endpoint,
    required this.method,
    required this.statusCode,
    this.memberId,
    this.memberName,
    this.apiAction,
    required this.success,
    this.errorMessage,
    this.responseData,
    this.ipAddress,
    this.durationMs,
    required this.createdAt,
  });

  factory LogEntry.fromJson(Map<String, dynamic> json) {
    return LogEntry(
      id: json['id'],
      endpoint: json['endpoint'],
      method: json['method'],
      statusCode: json['status_code'],
      memberId: json['member_id'],
      memberName: json['member_name'],
      apiAction: json['api_action'],
      success: json['success'],
      errorMessage: json['error_message'],
      responseData: json['response_data'],
      ipAddress: json['ip_address'],
      durationMs: json['duration_ms'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  // Convenience getters
  String? get avatarUrl => responseData?['avatar_url'];
  String? get membershipStatus => responseData?['membership_status'];
  String? get planName => responseData?['plan_name'];
  int? get durationMinutes => responseData?['duration_minutes'];
}
```

## 🔒 Security Features

- ✅ **API Key Authentication**: Required for all requests
- ✅ **Filter by Endpoint**: Only returns `/api/checkin` logs
- ✅ **Rate Limit**: Subject to same rate limits as other endpoints
- ✅ **Read-Only**: GET endpoint only, no modifications
- ✅ **No Cache**: Responses include cache-control headers

## ⚡ Performance

- **Default Limit**: 100 records per request
- **Maximum Limit**: 1000 records per request
- **Order**: Latest records first (descending by `created_at`)
- **Response Time**: ~100-300ms for typical queries

## 📊 Use Cases

1. **Dashboard Statistics**: Show total check-ins/check-outs
2. **Member History**: Display per-member activity
3. **Offline Sync**: Keep local database updated
4. **Reports**: Generate activity reports
5. **Audit Trail**: Track all check-in operations
6. **Troubleshooting**: Debug failed check-ins

## 🐛 Error Handling

```dart
try {
  final history = await fetchHistory();
  // Process history
} catch (e) {
  if (e is HttpException) {
    switch (e.statusCode) {
      case 401:
        showError('Invalid API key');
        break;
      case 400:
        showError('Invalid parameters');
        break;
      case 503:
        showError('Server unavailable');
        break;
      default:
        showError('Failed to fetch history');
    }
  }
}
```

## 🧪 Testing

### PowerShell Test

```powershell
$apiKey = "YOUR_API_KEY"
$url = "https://your-domain.vercel.app/api/history?api_key=$apiKey&limit=10"

$response = Invoke-WebRequest -Uri $url -Method GET
$data = $response.Content | ConvertFrom-Json

Write-Host "Success: $($data.success)"
Write-Host "Count: $($data.count)"
Write-Host "Records:"
$data.data | Format-Table member_name, api_action, created_at
```

### cURL Test

```bash
curl -X GET \
  "https://your-domain.vercel.app/api/history?api_key=YOUR_API_KEY&limit=10" \
  -H "Accept: application/json" | jq
```

## 📝 Notes

- Records are ordered by `created_at` descending (newest first)
- Only check-in/check-out logs are returned (filtered by `endpoint = '/api/checkin'`)
- The `response_data` field contains the full API response, including `avatar_url`
- Timestamps are in UTC timezone
- Use incremental sync with `created_at` filter for efficient polling

---

**Endpoint:** `/api/history`  
**Status:** ✅ Ready for Production  
**Version:** 1.0  
**Last Updated:** October 2, 2025

