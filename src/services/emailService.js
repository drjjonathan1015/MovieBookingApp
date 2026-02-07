// src/services/emailService.js - FIXED VALIDATION

import emailjs from '@emailjs/browser';
import { emailConfig } from '../config/emailConfig';

/**
 * Initialize EmailJS with public key
 */
export const initEmailJS = () => {
  emailjs.init(emailConfig.publicKey);
};

/**
 * Send booking confirmation email
 * @param {Object} bookingData - Booking details
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name (optional)
 * @returns {Promise} - EmailJS response
 */
export const sendBookingConfirmation = async (bookingData, userEmail, userName = 'Customer') => {
  try {
    // Prepare email template parameters
    const templateParams = {
      user_name: userName,
      user_email: userEmail,
      booking_id: bookingData.id,
      movie_title: bookingData.movieTitle,
      show_date: bookingData.showDate,
      show_time: bookingData.showTime,
      seats: Array.isArray(bookingData.seats) 
        ? bookingData.seats.join(', ') 
        : bookingData.seats,
      total_price: `Rs ${bookingData.totalPrice}`,
      payment_method: bookingData.paymentMethod || 'Online Payment',
      booking_date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      // Additional fields
      number_of_seats: Array.isArray(bookingData.seats) 
        ? bookingData.seats.length 
        : 1,
      theater_name: bookingData.theaterName || 'CinemaX',
      qr_code_text: `Booking ID: ${bookingData.id}`,
    };

    console.log('Sending email with params:', templateParams);

    // Send email using EmailJS
    const response = await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return {
      success: true,
      response: response,
      message: 'Confirmation email sent successfully!'
    };

  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error,
      message: error.text || 'Failed to send confirmation email'
    };
  }
};

/**
 * Send custom email (for other purposes)
 * @param {Object} params - Custom email parameters
 * @returns {Promise} - EmailJS response
 */
export const sendCustomEmail = async (params) => {
  try {
    const response = await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      params
    );

    return {
      success: true,
      response: response
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error
    };
  }
};

/**
 * Validate email configuration
 * @returns {boolean} - True if config is valid
 */
export const validateEmailConfig = () => {
  const { publicKey, serviceId, templateId } = emailConfig;
  
  // ✅ FIXED: Check if values exist and are not empty/placeholder strings
  if (!publicKey || publicKey.trim() === '' || publicKey === 'YOUR_PUBLIC_KEY_HERE') {
    console.warn('EmailJS Public Key not configured');
    return false;
  }
  
  if (!serviceId || serviceId.trim() === '' || serviceId === 'YOUR_SERVICE_ID_HERE') {
    console.warn('EmailJS Service ID not configured');
    return false;
  }
  
  if (!templateId || templateId.trim() === '' || templateId === 'YOUR_TEMPLATE_ID_HERE') {
    console.warn('EmailJS Template ID not configured');
    return false;
  }
  
  return true;
};

export default {
  initEmailJS,
  sendBookingConfirmation,
  sendCustomEmail,
  validateEmailConfig
};