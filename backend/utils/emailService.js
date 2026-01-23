import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Email Templates
export const emailTemplates = {
  farmerApplicationSubmitted: (userName, fpoName) => ({
    subject: 'Farmer Application Submitted - QRGanic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">Farmer Application Submitted</h2>
        <p>Hello ${userName},</p>
        <p>Your farmer application has been submitted successfully and is pending review by ${fpoName}.</p>
        <p>You will be notified once your application is reviewed.</p>
        <p>Best regards,<br>QRGanic Team</p>
      </div>
    `,
  }),

  farmerApplicationApproved: (userName) => ({
    subject: 'Farmer Application Approved - QRGanic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">Congratulations! Your Application is Approved</h2>
        <p>Hello ${userName},</p>
        <p>Your farmer application has been approved. You can now upload and sell products on QRGanic.</p>
        <p>Best regards,<br>QRGanic Team</p>
      </div>
    `,
  }),

  farmerApplicationRejected: (userName) => ({
    subject: 'Farmer Application Status - QRGanic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">Farmer Application Update</h2>
        <p>Hello ${userName},</p>
        <p>Unfortunately, your farmer application has been rejected. Please contact your FPO for more details.</p>
        <p>Best regards,<br>QRGanic Team</p>
      </div>
    `,
  }),

  productUploaded: (farmerName, productName, fpoName) => ({
    subject: 'New Product Uploaded - QRGanic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">New Product Uploaded</h2>
        <p>Hello ${fpoName},</p>
        <p>Farmer ${farmerName} has uploaded a new product: ${productName}</p>
        <p>Please review and monitor this product.</p>
        <p>Best regards,<br>QRGanic Team</p>
      </div>
    `,
  }),

  productExpired: (fpoName, productName, farmerName) => ({
    subject: 'Product Expiry Alert - QRGanic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Product Expiry Alert</h2>
        <p>Hello ${fpoName},</p>
        <p>The product "${productName}" by ${farmerName} has expired or is approaching expiry.</p>
        <p>Please review and take appropriate action.</p>
        <p>Best regards,<br>QRGanic Team</p>
      </div>
    `,
  }),

  fpoAdded: (adminName, fpoName, allAdmins) => ({
    subject: 'New FPO Added - QRGanic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">New FPO Added</h2>
        <p>Hello Admin,</p>
        <p>Admin ${adminName} has added a new FPO: ${fpoName}</p>
        <p>Best regards,<br>QRGanic Team</p>
      </div>
    `,
  }),

  farmerAdded: (adminName, farmerName, fpoName) => ({
    subject: 'New Farmer Added - QRGanic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">New Farmer Added</h2>
        <p>Hello ${fpoName},</p>
        <p>Admin ${adminName} has added a new farmer: ${farmerName}</p>
        <p>This farmer is now under your jurisdiction.</p>
        <p>Best regards,<br>QRGanic Team</p>
      </div>
    `,
  }),

  purchaseComplete: (userName, productName, qrCode, farmerName, farmerLocation, fpoName) => ({
    subject: 'Purchase Complete - QRGanic',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">Purchase Complete</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for your purchase of ${productName}.</p>
        <p><strong>Farmer:</strong> ${farmerName}</p>
        <p><strong>Location:</strong> ${farmerLocation}</p>
        <p><strong>Certified by:</strong> ${fpoName}</p>
        <div style="text-align: center; margin: 20px 0;">
          <img src="${qrCode}" alt="QR Code" style="max-width: 200px;" />
        </div>
        <p>Your QR code is attached above. Please keep it for your records.</p>
        <p>Best regards,<br>QRGanic Team</p>
      </div>
    `,
  }),
};

