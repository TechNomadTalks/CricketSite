/**
 * QR Code Generator for Banking Details
 * Generates QR codes for EFT payment information
 */

// Banking information
const BANKING_INFO = {
    bank: 'FNB',
    accountName: 'Coastal Accounting Cricket Arena',
    accountNumber: '62874561234',
    branchCode: '250655',
    accountType: 'Business Cheque'
};

/**
 * Generate banking details text for QR code
 * @param {string} reference - Payment reference (booking ID)
 * @returns {string} Formatted banking text
 */
function generateBankingText(reference) {
    return `Bank: ${BANKING_INFO.bank}
Account Name: ${BANKING_INFO.accountName}
Account Number: ${BANKING_INFO.accountNumber}
Branch Code: ${BANKING_INFO.branchCode}
Account Type: ${BANKING_INFO.accountType}
Reference: ${reference}

Please use the booking reference for payment identification.`;
}

/**
 * Generate QR code URL using online service
 * @param {string} reference - Booking reference
 * @returns {string} QR code image URL
 */
function generateQRCodeURL(reference) {
    const bankingText = generateBankingText(reference);
    const encodedText = encodeURIComponent(bankingText);
    
    // Using QR Server API for reliable QR code generation
    // Size: 200x200, Error correction: Medium
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}&ecc=M`;
}

/**
 * Generate QR code HTML for email embedding
 * @param {string} reference - Booking reference 
 * @returns {string} HTML with QR code and banking details
 */
function generateQRCodeHTML(reference) {
    const qrURL = generateQRCodeURL(reference);
    const bankingText = generateBankingText(reference);
    
    return `
    <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
        <h4 style="color: #1B5E20; margin-bottom: 15px;">
            <i style="margin-right: 8px;">💳</i>Payment QR Code
        </h4>
        <div style="margin: 15px 0;">
            <img src="${qrURL}" alt="Banking QR Code" style="border: 2px solid #1B5E20; border-radius: 8px; max-width: 200px; height: auto;">
        </div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">
            Scan with your banking app to auto-fill payment details
        </p>
    </div>`;
}

// Export functions for use in edge functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateBankingText,
        generateQRCodeURL,
        generateQRCodeHTML,
        BANKING_INFO
    };
}