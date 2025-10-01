$apiKey = "847a6e2605d0674043fd8c6fef6e4f2ffb34fcfe8d5cd772636da8fc4b42bb78"
$member1 = "bc11ca52-7c25-471e-bd28-5159f58bed10"
$member2 = "f55cdecd-a99e-4df9-b4f6-71db877f5623"

Write-Host "`n=== Testing Member 1: $member1 ===" -ForegroundColor Cyan

# Verify Member 1
Write-Host "`n1. Verifying Member 1..." -ForegroundColor Yellow
$verifyBody = @{qr_code=$member1; api_key=$apiKey} | ConvertTo-Json
$verify1 = Invoke-RestMethod -Uri "http://localhost:3000/api/checkin/verify" -Method POST -ContentType "application/json" -Body $verifyBody
Write-Host "  Member: $($verify1.data.member_name)" -ForegroundColor Green
Write-Host "  Status: $($verify1.data.membership_status)" -ForegroundColor Green
Write-Host "  Can Check-in: $($verify1.data.can_checkin)" -ForegroundColor Green
Write-Host "  Is Checked-in: $($verify1.data.is_checked_in)" -ForegroundColor Green

# Checkout Member 1 if checked in
if ($verify1.data.is_checked_in) {
    Write-Host "`n2. Checking out Member 1..." -ForegroundColor Yellow
    $checkoutBody = @{qr_code=$member1; api_key=$apiKey; action="checkout"} | ConvertTo-Json
    $checkout1 = Invoke-RestMethod -Uri "http://localhost:3000/api/checkin" -Method POST -ContentType "application/json" -Body $checkoutBody
    Write-Host "  $($checkout1.message)" -ForegroundColor Green
}

# Checkin Member 1
Write-Host "`n3. Checking in Member 1..." -ForegroundColor Yellow
$checkinBody = @{qr_code=$member1; api_key=$apiKey; action="checkin"} | ConvertTo-Json
$checkin1 = Invoke-RestMethod -Uri "http://localhost:3000/api/checkin" -Method POST -ContentType "application/json" -Body $checkinBody
Write-Host "  $($checkin1.message)" -ForegroundColor Green
Write-Host "  Member: $($checkin1.data.member_name)" -ForegroundColor Green

Write-Host "`n`n=== Testing Member 2: $member2 ===" -ForegroundColor Cyan

# Verify Member 2
Write-Host "`n1. Verifying Member 2..." -ForegroundColor Yellow
$verifyBody2 = @{qr_code=$member2; api_key=$apiKey} | ConvertTo-Json
$verify2 = Invoke-RestMethod -Uri "http://localhost:3000/api/checkin/verify" -Method POST -ContentType "application/json" -Body $verifyBody2
Write-Host "  Member: $($verify2.data.member_name)" -ForegroundColor Green
Write-Host "  Status: $($verify2.data.membership_status)" -ForegroundColor Green
Write-Host "  Can Check-in: $($verify2.data.can_checkin)" -ForegroundColor Green
Write-Host "  Is Checked-in: $($verify2.data.is_checked_in)" -ForegroundColor Green

# Checkout Member 2 if checked in
if ($verify2.data.is_checked_in) {
    Write-Host "`n2. Checking out Member 2..." -ForegroundColor Yellow
    $checkoutBody2 = @{qr_code=$member2; api_key=$apiKey; action="checkout"} | ConvertTo-Json
    $checkout2 = Invoke-RestMethod -Uri "http://localhost:3000/api/checkin" -Method POST -ContentType "application/json" -Body $checkoutBody2
    Write-Host "  $($checkout2.message)" -ForegroundColor Green
}

# Checkin Member 2
Write-Host "`n3. Checking in Member 2..." -ForegroundColor Yellow
$checkinBody2 = @{qr_code=$member2; api_key=$apiKey; action="checkin"} | ConvertTo-Json
$checkin2 = Invoke-RestMethod -Uri "http://localhost:3000/api/checkin" -Method POST -ContentType "application/json" -Body $checkinBody2
Write-Host "  $($checkin2.message)" -ForegroundColor Green
Write-Host "  Member: $($checkin2.data.member_name)" -ForegroundColor Green

Write-Host "`n`n=== All Tests Complete ===" -ForegroundColor Cyan
Write-Host "Check Settings > Activity Logs > API Logs to see the results!" -ForegroundColor Yellow

