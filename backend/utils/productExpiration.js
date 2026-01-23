import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendEmail, emailTemplates } from './emailService.js';

// Check and expire products that have reached their expiration date
export const checkExpiredProducts = async () => {
  try {
    console.log('Checking for expired products...');
    
    const now = new Date();
    
    // Find all active products that have expired
    const expiredProducts = await Product.find({
      status: 'active',
      expirationDate: { $lte: now }
    }).populate('userId', 'name email fpoId');

    console.log(`Found ${expiredProducts.length} expired products`);

    for (const product of expiredProducts) {
      // Update product status to expired
      product.status = 'expired';
      product.certificationStatus = 'expired';
      await product.save();

      console.log(`Expired product: ${product.name} (${product.productId})`);

      // Send email notification to farmer
      if (product.userId) {
        const fpo = await User.findOne({ userId: product.fpoId });
        const emailData = emailTemplates.productExpired(
          fpo?.name || 'FPO',
          product.name,
          product.userId.name
        );
        
        await sendEmail({
          email: product.userId.email,
          subject: emailData.subject,
          html: emailData.html
        });

        console.log(`Sent expiration email to farmer: ${product.userId.email}`);
      }

      // Send email notification to FPO
      if (product.fpoId) {
        const fpo = await User.findOne({ userId: product.fpoId });
        if (fpo) {
          const emailData = emailTemplates.productExpired(
            fpo.name,
            product.name,
            product.userId?.name || 'Farmer'
          );
          
          await sendEmail({
            email: fpo.email,
            subject: emailData.subject,
            html: emailData.html
          });

          console.log(`Sent expiration email to FPO: ${fpo.email}`);
        }
      }
    }

    console.log('Product expiration check completed');
    return { expired: expiredProducts.length };

  } catch (error) {
    console.error('Error checking expired products:', error);
    throw error;
  }
};

// Schedule to run every hour
export const scheduleExpirationCheck = () => {
  // Run immediately on startup
  checkExpiredProducts();
  
  // Then run every hour
  setInterval(checkExpiredProducts, 60 * 60 * 1000);
  
  console.log('Product expiration checker scheduled to run every hour');
};
