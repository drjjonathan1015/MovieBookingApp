// src/config/emailConfig.js

/**
 * EmailJS Configuration
 * 
 * Setup Instructions:
 * 1. Go to https://www.emailjs.com/
 * 2. Sign up for a free account
 * 3. Create an email service (Gmail, Outlook, etc.)
 * 4. Create an email template
 * 5. Get your Public Key from Account settings
 * 6. Replace the values below with your credentials
 */

// Named export only
export const emailConfig = {
  publicKey: 'iftr-ehC59U4zE4yg',
  serviceId: 'service_nv013h4',
  templateId: 'template_m92prj6',
};


/**
 * Email Template Variables (available in your EmailJS template)
 * 
 * You can use these variables in your EmailJS template:
 * {{user_name}} - Customer name
 * {{user_email}} - Customer email
 * {{booking_id}} - Booking ID
 * {{movie_title}} - Movie name
 * {{show_date}} - Show date
 * {{show_time}} - Show time
 * {{seats}} - Selected seats
 * {{total_price}} - Total amount paid
 * {{payment_method}} - Payment method used
 * {{booking_date}} - Date of booking
 */

export default emailConfig;