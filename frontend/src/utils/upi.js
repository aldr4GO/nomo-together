/**
 * Generate UPI deep link for payment
 * @param {string} merchantUPI - Merchant UPI ID
 * @param {string} merchantName - Merchant name
 * @param {number} amount - Amount to pay
 * @param {number} orderId - Order ID
 * @returns {string} UPI deep link URL
 */
export function generateUPILink(merchantUPI, merchantName, amount, orderId) {
  const params = new URLSearchParams({
    pa: merchantUPI,
    pn: merchantName,
    am: amount.toString(),
    cu: 'INR',
    tn: `Order ${orderId}`,
  });
  
  return `upi://pay?${params.toString()}`;
}

/**
 * Open UPI payment link
 */
export function openUPIPayment(merchantUPI, merchantName, amount, orderId) {
  const upiLink = generateUPILink(merchantUPI, merchantName, amount, orderId);
  
  // Try to open UPI app
  window.location.href = upiLink;
  
  // Fallback: open in new window if direct link fails
  setTimeout(() => {
    const fallbackWindow = window.open(upiLink, '_blank');
    if (!fallbackWindow) {
      alert('Please install a UPI app (PhonePe, Google Pay, Paytm) to make payment');
    }
  }, 100);
}

