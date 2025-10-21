const sgMail = require('@sendgrid/mail');

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailService = {
  // Send welcome email to new users
  async sendWelcomeEmail(user) {
    try {
      const msg = {
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: 'Welcome to Paws and Claws Marketplace!',
        templateId: 'd-welcome-template-id', // You'll need to create this template in SendGrid
        dynamicTemplateData: {
          firstName: user.firstName,
          lastName: user.lastName,
          loginUrl: `${process.env.APP_URL}/login`
        }
      };
      
      await sgMail.send(msg);
      console.log('Welcome email sent successfully to:', user.email);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  },

  // Send email verification
  async sendVerificationEmail(user, verificationToken) {
    try {
      const msg = {
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: 'Verify Your Email - Paws and Claws Marketplace',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B6B;">Welcome to Paws and Claws Marketplace!</h2>
            <p>Hi ${user.firstName},</p>
            <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
            <a href="${process.env.APP_URL}/verify-email?token=${verificationToken}" 
               style="background-color: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${process.env.APP_URL}/verify-email?token=${verificationToken}</p>
            <p>This link will expire in 24 hours.</p>
            <p>Best regards,<br>The Paws and Claws Team</p>
          </div>
        `
      };
      
      await sgMail.send(msg);
      console.log('Verification email sent successfully to:', user.email);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const msg = {
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: 'Password Reset Request - Paws and Claws Marketplace',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B6B;">Password Reset Request</h2>
            <p>Hi ${user.firstName},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${process.env.APP_URL}/reset-password?token=${resetToken}" 
               style="background-color: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
            <p>Best regards,<br>The Paws and Claws Team</p>
          </div>
        `
      };
      
      await sgMail.send(msg);
      console.log('Password reset email sent successfully to:', user.email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  },

  // Send order confirmation email
  async sendOrderConfirmation(order, user) {
    try {
      const msg = {
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: `Order Confirmation #${order._id} - Paws and Claws Marketplace`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B6B;">Order Confirmation</h2>
            <p>Hi ${user.firstName},</p>
            <p>Thank you for your order! Here are your order details:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Order #${order._id}</h3>
              <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
            <p>We'll send you updates on your order status.</p>
            <p>Best regards,<br>The Paws and Claws Team</p>
          </div>
        `
      };
      
      await sgMail.send(msg);
      console.log('Order confirmation email sent successfully to:', user.email);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  },

  // Send listing notification to admin
  async sendListingNotification(listing, user) {
    try {
      const msg = {
        to: process.env.ADMIN_EMAIL || 'admin@pawsandclaws.com',
        from: process.env.EMAIL_FROM,
        subject: 'New Listing Posted - Paws and Claws Marketplace',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B6B;">New Listing Posted</h2>
            <p>A new listing has been posted by ${user.firstName} ${user.lastName} (${user.email}).</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Listing Details:</h3>
              <p><strong>Title:</strong> ${listing.name}</p>
              <p><strong>Category:</strong> ${listing.category}</p>
              <p><strong>Price:</strong> Rs${listing.pricePKR}</p>
              <p><strong>Location:</strong> ${listing.location}</p>
            </div>
            <p>Please review this listing in the admin dashboard.</p>
          </div>
        `
      };
      
      await sgMail.send(msg);
      console.log('Listing notification email sent successfully to admin');
    } catch (error) {
      console.error('Error sending listing notification email:', error);
      throw error;
    }
  }
};

module.exports = emailService; 