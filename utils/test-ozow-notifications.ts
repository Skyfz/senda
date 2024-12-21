import crypto from 'crypto';

// Function to generate SHA512 hash
function generateHash(input: string): string {
  return crypto.createHash('sha512').update(input).digest('hex');
}

// Function to trim leading zeros from hash
function trimLeadingZeros(hash: string): string {
  return hash.replace(/^0+/, '');
}

// Convert object to URL-encoded form data
function objectToFormData(obj: Record<string, any>): URLSearchParams {
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    // Convert boolean to string 'true' or 'false'
    formData.append(key, String(value));
  }
  return formData;
}

// Function to generate a valid Ozow notification with correct hash
function generateOzowNotification({
  siteCode = process.env.OZOW_SITE_CODE || 'TSTSTE0001',
  transactionId = `test${Date.now()}`,
  transactionReference,
  amount,
  status,
  statusMessage = '',
  currencyCode = 'ZAR',
  isTest = true,
  bankName = 'Absa Pay',
  privateKey = process.env.OZOW_PRIVATE_KEY || '215114531AFF7134A94C88CEEA48E'
}: {
  siteCode?: string;
  transactionId?: string;
  transactionReference: string;
  amount: number;
  status: string;
  statusMessage?: string;
  currencyCode?: string;
  isTest?: boolean;
  bankName?: string;
  privateKey?: string;
}) {
  // Format amount to 2 decimal places
  const formattedAmount = amount.toFixed(2);
  
  // Create notification object with exact casing as per Ozow docs
  const notification = {
    SiteCode: siteCode,
    TransactionId: transactionId,
    TransactionReference: transactionReference,
    Amount: formattedAmount,
    Status: status,
    Optional1: '',
    Optional2: '',
    Optional3: '',
    Optional4: '',
    Optional5: '',
    CurrencyCode: currencyCode,
    IsTest: isTest,
    StatusMessage: statusMessage,
    BankName: bankName,
    MaskedAccountNumber: '****1234',
    SmartIndicators: ''
  };

  // Generate hash according to Ozow's algorithm
  const concatenated = [
    notification.SiteCode,
    notification.TransactionId,
    notification.TransactionReference,
    notification.Amount,
    notification.Status,
    notification.Optional1,
    notification.Optional2,
    notification.Optional3,
    notification.Optional4,
    notification.Optional5,
    notification.CurrencyCode,
    notification.IsTest,
    notification.StatusMessage
  ].join('');

  // Add private key and convert to lowercase
  const withKey = (concatenated + privateKey).toLowerCase();
  
  // Generate hash
  const hash = generateHash(withKey);
  
  // Return notification with hash
  return {
    ...notification,
    Hash: hash
  };
}

// Test scenarios
export async function testOzowNotifications() {
  const baseUrl = 'http://localhost:3000/api/ozow/notify';
  
  // Helper function to send notification
  async function sendNotification(notification: Record<string, any>) {
    const formData = objectToFormData(notification);
    console.log('\nSending notification:');
    console.log(Object.fromEntries(formData));
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    
    const result = await response.json();
    console.log('Response:', {
      status: response.status,
      body: result
    });
    return response;
  }

  // Test successful payment
  console.log('\nTesting Successful Payment...');
  const successNotification = generateOzowNotification({
    transactionReference: '6766af5229001a59b0cbc947',
    amount: 53.00,
    status: 'Complete',
    statusMessage: 'Test transaction completed'
  });
  await sendNotification(successNotification);

  // Test failed payment
  console.log('\nTesting Failed Payment...');
  const failedNotification = generateOzowNotification({
    transactionReference: '6766af5229001a59b0cbc948',
    amount: 53.00,
    status: 'Error',
    statusMessage: 'Insufficient funds'
  });
  await sendNotification(failedNotification);

  // Test cancelled payment
  console.log('\nTesting Cancelled Payment...');
  const cancelledNotification = generateOzowNotification({
    transactionReference: '6766af5229001a59b0cbc949',
    amount: 53.00,
    status: 'Cancelled',
    statusMessage: 'User cancelled'
  });
  await sendNotification(cancelledNotification);

  // Test pending investigation
  console.log('\nTesting Pending Investigation...');
  const pendingNotification = generateOzowNotification({
    transactionReference: '6766af5229001a59b0cbc950',
    amount: 53.00,
    status: 'PendingInvestigation',
    statusMessage: 'Manual verification required'
  });
  await sendNotification(pendingNotification);
}

// Run tests if called directly
if (require.main === module) {
  testOzowNotifications().catch(console.error);
}
