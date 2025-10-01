$apiKey = "847a6e2605d0674043fd8c6fef6e4f2ffb34fcfe8d5cd772636da8fc4b42bb78"
$member1 = "bc11ca52-7c25-471e-bd28-5159f58bed10"

Write-Host "`n=== Testing Checkout for Andrei Cristache ===" -ForegroundColor Cyan

Write-Host "`n1. Verifying current status..." -ForegroundColor Yellow
$verifyBody = @{qr_code=$member1; api_key=$apiKey} | ConvertTo-Json
$verify = Invoke-RestMethod -Uri "http://localhost:3000/api/checkin/verify" -Method POST -ContentType "application/json" -Body $verifyBody
Write-Host "  Member: $($verify.data.member_name)" -ForegroundColor Green
Write-Host "  Is Checked-in: $($verify.data.is_checked_in)" -ForegroundColor Green

Write-Host "`n2. Checking out member..." -ForegroundColor Yellow
$checkoutBody = @{qr_code=$member1; api_key=$apiKey; action="checkout"} | ConvertTo-Json
try {
    $checkout = Invoke-RestMethod -Uri "http://localhost:3000/api/checkin" -Method POST -ContentType "application/json" -Body $checkoutBody
    Write-Host "  $($checkout.message)" -ForegroundColor Green
    Write-Host "  Member: $($checkout.data.member_name)" -ForegroundColor Green
    Write-Host "  Duration: $($checkout.data.duration_minutes) minutes" -ForegroundColor Green
}
catch {
    Write-Host "  Error: Member is not checked in" -ForegroundColor Red
}

Write-Host "`n3. Verifying after checkout..." -ForegroundColor Yellow
$verify2 = Invoke-RestMethod -Uri "http://localhost:3000/api/checkin/verify" -Method POST -ContentType "application/json" -Body $verifyBody
Write-Host "  Is Checked-in: $($verify2.data.is_checked_in)" -ForegroundColor Green
Write-Host "  Can Check-in: $($verify2.data.can_checkin)" -ForegroundColor Green

Write-Host "`n=== Checkout test complete! ===" -ForegroundColor Cyan
Write-Host "Check Settings > Activity Logs > API Logs to see all the requests!" -ForegroundColor Yellow

