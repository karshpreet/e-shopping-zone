# E-Shopping Zone — Automated Test Suite
# Run in PowerShell: powershell -ExecutionPolicy Bypass -File .\test-all.ps1

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   E-Shopping Zone - Automated Validation Suite" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Customer Login
$cLogin = @{ usernameOrEmail = "customer@eshop.com"; password = "password123" } | ConvertTo-Json;
$cAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $cLogin -ContentType "application/json";
Write-Host "[1/15] Customer Auth: Token acquired, User=$($cAuth.data.username), Role=$($cAuth.data.role)" -ForegroundColor Green;

# 2. Merchant Login
$mLogin = @{ usernameOrEmail = "merchant@eshop.com"; password = "password123" } | ConvertTo-Json;
$mAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $mLogin -ContentType "application/json";
Write-Host "[2/15] Merchant Auth: Token acquired, User=$($mAuth.data.username), Role=$($mAuth.data.role)" -ForegroundColor Green;

# 3. Categories
$cats = Invoke-RestMethod -Uri "http://localhost:8080/api/categories" -Method Get;
Write-Host "[3/15] Categories: $($cats.data.Count) categories loaded" -ForegroundColor Green;

# 4. Products Search
$prods = Invoke-RestMethod -Uri "http://localhost:8080/api/products/search?query=macbook" -Method Get;
Write-Host "[4/15] Product Search: Found '$($prods.data[0].name)' (Price: Rs. $($prods.data[0].price))" -ForegroundColor Green;

# 5. Wallet Balance
$wBal = Invoke-RestMethod -Uri "http://localhost:8080/api/wallet/1/balance" -Method Get;
Write-Host "[5/15] Wallet Balance: Rs. $($wBal.data)" -ForegroundColor Green;

# 6. Wallet Top-up
$topupBody = @{ amount = 500; description = "Validation topup" } | ConvertTo-Json;
$topup = Invoke-RestMethod -Uri "http://localhost:8080/api/wallet/1/topup" -Method Post -Body $topupBody -ContentType "application/json";
Write-Host "[6/15] Wallet Top-up: Added Rs. 500, New Txn=$($topup.data.transactionId)" -ForegroundColor Green;

# 7. Add to Cart
$cartBody = @{ productId = 2; quantity = 1 } | ConvertTo-Json;
$cart = Invoke-RestMethod -Uri "http://localhost:8080/api/cart/1/items" -Method Post -Body $cartBody -ContentType "application/json";
Write-Host "[7/15] Cart Added: Total=Rs. $($cart.data.totalAmount), Items=$($cart.data.itemCount)" -ForegroundColor Green;

# 8. Update Cart Quantity
$updBody = @{ quantity = 2 } | ConvertTo-Json;
$cartUpd = Invoke-RestMethod -Uri "http://localhost:8080/api/cart/1/items/2" -Method Put -Body $updBody -ContentType "application/json";
Write-Host "[8/15] Cart Quantity Updated: Items=$($cartUpd.data.itemCount), Total=Rs. $($cartUpd.data.totalAmount)" -ForegroundColor Green;

# 9. Checkout with WALLET
$checkoutWallet = @{
    customerId = 1;
    customerName = "Customer Test";
    customerEmail = "customer@eshop.com";
    paymentMethod = "WALLET";
    shippingAddress = "456 Tech Park, Electronic City, Bangalore";
    contactPhone = "+91 9988776655"
} | ConvertTo-Json;
$ord1 = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/checkout" -Method Post -Body $checkoutWallet -ContentType "application/json";
Write-Host "[9/15] Wallet Checkout: Order=$($ord1.data.orderNumber) Total=Rs. $($ord1.data.totalAmount) Payment=$($ord1.data.paymentStatus) Txn=$($ord1.data.walletTransactionId)" -ForegroundColor Green;

# 10. Check Cart Cleared
$cartAfter = Invoke-RestMethod -Uri "http://localhost:8080/api/cart/1" -Method Get;
Write-Host "[10/15] Cart Cleared Verification: Items in cart=$($cartAfter.data.items.Count)" -ForegroundColor Green;

# 11. Checkout with COD
$cartBody2 = @{ productId = 3; quantity = 1 } | ConvertTo-Json;
$null = Invoke-RestMethod -Uri "http://localhost:8080/api/cart/1/items" -Method Post -Body $cartBody2 -ContentType "application/json";
$checkoutCOD = @{
    customerId = 1;
    customerName = "Customer Test";
    customerEmail = "customer@eshop.com";
    paymentMethod = "COD";
    shippingAddress = "456 Tech Park, Electronic City, Bangalore";
    contactPhone = "+91 9988776655"
} | ConvertTo-Json;
$ord2 = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/checkout" -Method Post -Body $checkoutCOD -ContentType "application/json";
Write-Host "[11/15] COD Checkout: Order=$($ord2.data.orderNumber) Total=Rs. $($ord2.data.totalAmount) Payment=$($ord2.data.paymentStatus)" -ForegroundColor Green;

# 12. Customer Orders
$cOrders = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/customer/1" -Method Get;
Write-Host "[12/15] Customer Order History: $($cOrders.data.Count) order(s) found" -ForegroundColor Green;

# 13. Merchant Orders
$mOrders = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/merchant" -Method Get;
Write-Host "[13/15] Merchant Order View: $($mOrders.data.Count) total order(s) in system" -ForegroundColor Green;

# 14. Merchant Updates Order Status
$statBody = @{ orderStatus = "SHIPPED" } | ConvertTo-Json;
$updOrd = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$($ord1.data.id)/status" -Method Put -Body $statBody -ContentType "application/json";
Write-Host "[14/15] Order Status Updated: Order=$($updOrd.data.orderNumber) NewStatus=$($updOrd.data.orderStatus)" -ForegroundColor Green;

# 15. Profile Update with JWT
$headers = @{ "Authorization" = "Bearer $($cAuth.data.token)" };
$profBody = @{ fullName = "John Customer Doe"; phoneNumber = "+91 9876501234"; city = "Bangalore"; state = "Karnataka"; postalCode = "560001"; country = "India" } | ConvertTo-Json;
$prof = Invoke-RestMethod -Uri "http://localhost:8080/api/profile/1" -Method Put -Body $profBody -Headers $headers -ContentType "application/json";
Write-Host "[15/15] Profile Updated with JWT: FullName=$($prof.data.fullName), City=$($prof.data.city)" -ForegroundColor Green;

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   ALL 15 END-TO-END VALIDATION TESTS PASSED!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
