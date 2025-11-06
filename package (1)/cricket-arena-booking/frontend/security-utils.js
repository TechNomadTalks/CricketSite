/**
 * Security Utilities for Frontend
 * Provides XSS protection and input sanitization
 */

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    
    return text.replace(/[&<>"'\/]/g, (char) => map[char]);
}

// Sanitize user input before display
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone format
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10,15}$/;
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleaned);
}

// Safely create HTML element with text content (prevents XSS)
function createSafeElement(tagName, textContent, className) {
    const element = document.createElement(tagName);
    if (textContent) {
        element.textContent = textContent; // textContent is safe, doesn't parse HTML
    }
    if (className) {
        element.className = className;
    }
    return element;
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.SecurityUtils = {
        escapeHtml,
        sanitizeInput,
        isValidEmail,
        isValidPhone,
        createSafeElement
    };
}
