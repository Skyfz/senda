import crypto from 'crypto';

// Function to generate SHA512 hash
function generateHash(input: string): string {
  return crypto.createHash('sha512').update(input).digest('hex');
}

// Function to trim leading zeros from hash
function trimLeadingZeros(hash: string): string {
  return hash.replace(/^0+/, '');
}

// Function to generate a valid Ozow notification with correct hash
function generateOzowNotification({
  siteCode = process.env.OZOW_SITE_CODE || 'test001',
  transactionId = `test${Date.now()}`,
  transactionReference,
  amount,
  status,
  statusMessage = '',
  currencyCode = 'zar',
  isTest = true,
  bankName = 'test bank',
  privateKey = process.env.OZOW_PRIVATE_KEY || 'test_private_key'
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
  // Create notification object with lowercase values
  const notification = {
    SiteCode: siteCode.toLowerCase(),
    TransactionId: transactionId.toLowerCase(),
    TransactionReference: transactionReference.toLowerCase(),
    Amount: amount,
    Status: status.toLowerCase(),
    Optional1: '',
    Optional2: '',
    Optional3: '',
    Optional4: '',
    Optional5: '',
    CurrencyCode: currencyCode.toLowerCase(),
    IsTest: isTest,
    StatusMessage: statusMessage.toLowerCase(),
    BankName: bankName.toLowerCase(),
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

  // Add private key and convert to lowercase (though everything is already lowercase now)
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
  
  // Test successful payment
  console.log('\nTesting Successful Payment...');
  const successResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(generateOzowNotification({
      transactionReference: '102',
      amount: 100,
      status: 'complete',
      statusMessage: 'payment successful'
    }))
  });
  console.log('Response:', {
    status: successResponse.status,
    data: await successResponse.json()
  });

  // Test cancelled payment
  console.log('\nTesting Cancelled Payment...');
  const cancelledResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(generateOzowNotification({
      transactionReference: '102',
      amount: 100,
      status: 'cancelled',
      statusMessage: 'user cancelled the payment'
    }))
  });
  console.log('Response:', {
    status: cancelledResponse.status,
    data: await cancelledResponse.json()
  });

  // Test error payment
  console.log('\nTesting Error Payment...');
  const errorResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(generateOzowNotification({
      transactionReference: '102',
      amount: 100,
      status: 'error',
      statusMessage: 'bank declined transaction'
    }))
  });
  console.log('Response:', {
    status: errorResponse.status,
    data: await errorResponse.json()
  });

  // Test pending investigation
  console.log('\nTesting Pending Investigation...');
  const pendingResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(generateOzowNotification({
      transactionReference: '102',
      amount: 100,
      status: 'pendinginvestigation',
      statusMessage: 'transaction under review'
    }))
  });
  console.log('Response:', {
    status: pendingResponse.status,
    data: await pendingResponse.json()
  });
}

// Run tests if called directly
if (require.main === module) {
  testOzowNotifications().catch(console.error);
}
