import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const testPayment = async () => {
    try {
        console.log('Testing payment endpoint...');
        console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
        
        const response = await axios.post('http://localhost:5000/api/cart/create-order', {}, {
            headers: {
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

testPayment();
