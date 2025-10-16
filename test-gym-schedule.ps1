# Test Gym Schedule API Endpoint
# PowerShell script to test the /api/gym-schedule endpoint

Write-Host "=== Testing Gym Schedule API ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:3000"
$apiKey = $env:CHECKIN_API_KEY

if (-not $apiKey) {
    Write-Host "ERROR: CHECKIN_API_KEY environment variable not set" -ForegroundColor Red
    Write-Host "Please set it first: `$env:CHECKIN_API_KEY = 'your_api_key_here'" -ForegroundColor Yellow
    exit 1
}

# Days to test
$days = @("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")

Write-Host "Testing all days of the week..." -ForegroundColor Green
Write-Host ""

foreach ($day in $days) {
    $url = "$baseUrl/api/gym-schedule?api_key=$apiKey&day=$day"
    
    Write-Host "Testing $day..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
        
        if ($response.success) {
            $schedule = $response.schedule
            Write-Host "  ✓ Success" -ForegroundColor Green
            Write-Host "    Day: $($schedule.day_of_week)" -ForegroundColor White
            
            if ($schedule.is_closed) {
                Write-Host "    Status: CLOSED" -ForegroundColor Red
            } else {
                Write-Host "    Status: OPEN" -ForegroundColor Green
                Write-Host "    Hours: $($schedule.open_time) - $($schedule.close_time)" -ForegroundColor White
            }
        } else {
            Write-Host "  ✗ Failed: $($response.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test invalid day
Write-Host "Testing invalid day..." -ForegroundColor Cyan
try {
    $url = "$baseUrl/api/gym-schedule?api_key=$apiKey&day=invalid"
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    Write-Host "  ✗ Should have failed but didn't" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✓ Correctly rejected invalid day" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test missing API key
Write-Host "Testing missing API key..." -ForegroundColor Cyan
try {
    $url = "$baseUrl/api/gym-schedule?day=monday"
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    Write-Host "  ✗ Should have failed but didn't" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✓ Correctly rejected missing API key" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test invalid API key
Write-Host "Testing invalid API key..." -ForegroundColor Cyan
try {
    $url = "$baseUrl/api/gym-schedule?api_key=invalid_key&day=monday"
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    Write-Host "  ✗ Should have failed but didn't" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "  ✓ Correctly rejected invalid API key" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "=== Tests Complete ===" -ForegroundColor Cyan

