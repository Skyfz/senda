// src/utils/ozow.ts
import crypto from 'crypto';

interface OzowPaymentData {
  siteCode: string;
  countryCode: string;
  currencyCode: string;
  amount: string;
  transactionReference: string;
  bankReference: string;
  cancelUrl: string;
  errorUrl: string;
  successUrl: string;
  notifyUrl: string;
  isTest: boolean;
}

export function generateOzowHashCheck(data: OzowPaymentData, privateKey: string): string {
  const inputString = `${data.siteCode}${data.countryCode}${data.currencyCode}${data.amount}${data.transactionReference}${data.bankReference}${data.cancelUrl}${data.errorUrl}${data.successUrl}${data.notifyUrl}${data.isTest}${privateKey}`;
  
  const stringToHash = inputString.toLowerCase();
  console.log('String before hash:', stringToHash); // For debugging
  
  const hash = crypto.createHash('sha512');
  hash.update(stringToHash);
  return hash.digest('hex');
}