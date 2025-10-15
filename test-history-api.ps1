# Test the /api/history endpoint
# Replace with your actual API key and URL

$apiKey = "847a6e2605d0674043fd8c6fef6e4f2ffb34fcfe8d5cd772636da8fc4b42bb78"
$baseUrl = "https://mitugym-app-webpanel-8jxo33igo-pateutzs-projects.vercel.app"

Write-Host "`n=== Testing /api/history Endpoint ===" -ForegroundColor Cyan

# Test 1: Get latest 10 records
Write-Host "`nTest 1: Get latest 10 records" -ForegroundColor Yellow
$url = "$baseUrl/api/history?api_key=$apiKey&limit=10"
try {
    $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✓ Success: $($data.success)" -ForegroundColor Green
    Write-Host "✓ Count: $($data.count)" -ForegroundColor Green
    
    if ($data.count -gt 0) {
        Write-Host "`nLatest Records:" -ForegroundColor Cyan
        $data.data | Select-Object -First 5 | ForEach-Object {
            Write-Host "  - $($_.member_name) | $($_.api_action) | $($_.created_at)" -ForegroundColor White
        }
    } else {
        Write-Host "  No records found" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get records with timestamp filter
Write-Host "`nTest 2: Get records since yesterday" -ForegroundColor Yellow
$yesterday = (Get-Date).AddDays(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.ffffff")
$url = "$baseUrl/api/history?api_key=$apiKey&limit=50&created_at=gte.$yesterday"
try {
    $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "✓ Success: $($data.success)" -ForegroundColor Green
    Write-Host "✓ Count: $($data.count)" -ForegroundColor Green
    Write-Host "  (Records since: $yesterday)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test with invalid API key
Write-Host "`nTest 3: Test authentication (should fail)" -ForegroundColor Yellow
$url = "$baseUrl/api/history?api_key=invalid_key&limit=10"
try {
    $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✗ Unexpected success - authentication should have failed!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Authentication properly rejected invalid API key" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Test with invalid limit
Write-Host "`nTest 4: Test parameter validation (limit too high)" -ForegroundColor Yellow
$url = "$baseUrl/api/history?api_key=$apiKey&limit=5000"
try {
    $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✗ Unexpected success - should have rejected limit > 1000!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ Parameter validation working correctly" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
Write-Host ""

