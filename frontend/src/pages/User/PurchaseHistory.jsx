import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiShare2, FiMessageCircle, FiMail, FiMoreHorizontal } from 'react-icons/fi';
import './Dashboard.css'; // Reusing dashboard styles for consistency

const PurchaseHistory = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeShareDropdown, setActiveShareDropdown] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/user/purchases');
            setPurchases(res.data.purchases);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching history:', error);
            setLoading(false);
        }
    };

    const downloadQRCode = async (qrCodeUrl, transactionId) => {
        try {
            // Create a canvas element to convert the image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw white background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw the QR code
                ctx.drawImage(img, 0, 0);
                
                // Convert to blob and download
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `QR-${transactionId}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 'image/png');
            };
            
            img.src = qrCodeUrl;
        } catch (error) {
            console.error('Error downloading QR code:', error);
        }
    };

    const shareQRCode = async (qrCodeUrl, transactionId, platform) => {
        const shareText = `Check out my purchase QR code for transaction ${transactionId}`;
        
        try {
            switch (platform) {
                case 'whatsapp':
                    try {
                        // Create a shareable image URL for WhatsApp
                        const response = await fetch(qrCodeUrl);
                        const blob = await response.blob();
                        
                        // Create a temporary HTML page to display the QR code
                        const tempHtml = `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>QR Code - ${transactionId}</title>
                                <meta property="og:image" content="${qrCodeUrl}">
                                <meta property="og:title" content="QR Code for Transaction ${transactionId}">
                                <meta property="og:description" content="Check out this purchase QR code">
                                <meta name="twitter:card" content="summary_large_image">
                                <meta name="twitter:image" content="${qrCodeUrl}">
                                <style>
                                    body { 
                                        margin: 0; 
                                        padding: 20px; 
                                        display: flex; 
                                        justify-content: center; 
                                        align-items: center; 
                                        min-height: 100vh; 
                                        background: #f0f0f0; 
                                        font-family: Arial, sans-serif;
                                    }
                                    .container { 
                                        text-align: center; 
                                        background: white; 
                                        padding: 30px; 
                                        border-radius: 10px; 
                                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                                    }
                                    .qr-img { 
                                        max-width: 300px; 
                                        height: auto; 
                                        border: 3px solid #25D366; 
                                        border-radius: 10px; 
                                        margin: 20px 0;
                                    }
                                    h1 { color: #25D366; margin-bottom: 10px; }
                                    p { color: #666; line-height: 1.6; }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <h1>QR Code for Transaction ${transactionId}</h1>
                                    <p>Check out this purchase QR code</p>
                                    <img src="${qrCodeUrl}" alt="QR Code" class="qr-img">
                                    <p><strong>Transaction ID:</strong> ${transactionId}</p>
                                </div>
                            </body>
                            </html>
                        `;
                        
                        // Create a blob from the HTML
                        const htmlBlob = new Blob([tempHtml], { type: 'text/html' });
                        const htmlUrl = URL.createObjectURL(htmlBlob);
                        
                        // Create a short link service or use the blob URL directly
                        const shareMessage = `Check out my purchase QR code for transaction ${transactionId}\n\nView the QR code here: ${htmlUrl}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
                        
                        // Clean up after 5 minutes
                        setTimeout(() => URL.revokeObjectURL(htmlUrl), 300000);
                    } catch (imageError) {
                        console.error('Error preparing image for WhatsApp:', imageError);
                        // Fallback to sharing lookup page if image preparation fails
                        const qrLookupUrl = `${window.location.origin}/qr-lookup`;
                        const fullShareText = `${shareText}: ${qrLookupUrl}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(fullShareText)}`, '_blank');
                    }
                    break;
                    
                case 'email':
                    // Always use mailto for email sharing
                    const qrLookupUrlEmail = `${window.location.origin}/qr-lookup`;
                    const fullShareTextEmail = `${shareText}: ${qrLookupUrlEmail}`;
                    window.open(`mailto:?subject=QR Code for Transaction ${transactionId}&body=${encodeURIComponent(fullShareTextEmail)}`, '_blank');
                    break;
                    
                case 'native':
                    if (navigator.share) {
                        const response = await fetch(qrCodeUrl);
                        const blob = await response.blob();
                        const file = new File([blob], `QR-${transactionId}.png`, { type: 'image/png' });
                        
                        await navigator.share({
                            title: `QR Code for Transaction ${transactionId}`,
                            text: shareText,
                            files: [file]
                        });
                    } else {
                        throw new Error('Native sharing not supported');
                    }
                    break;
                    
                case 'clipboard':
                    await navigator.clipboard.writeText(qrCodeUrl);
                    alert('QR Code image URL copied to clipboard!');
                    break;
                    
                default:
                    throw new Error('Invalid platform');
            }
        } catch (error) {
            console.error('Error sharing QR code:', error);
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(qrCodeUrl);
                alert('QR Code image URL copied to clipboard!');
            } catch (clipboardError) {
                alert('Unable to share QR code. Please try again.');
            }
        }
        
        // Close dropdown after sharing
        setActiveShareDropdown(null);
    };

    const toggleShareDropdown = (transactionId) => {
        setActiveShareDropdown(activeShareDropdown === transactionId ? null : transactionId);
    };

    if (loading) return <div className="loading">Loading History...</div>;

    return (
        <div className="user-dashboard">
            <div className="dashboard-header">
                <h1>Purchase History</h1>
                <p>View your past orders and QR codes</p>
            </div>

            <div className="history-list" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {purchases.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#ccc', padding: '40px' }}>
                        No purchases found.
                    </div>
                ) : (
                    purchases.map((log) => (
                        <div key={log._id} className="product-card" style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '20px' }}>
                            <div className="product-info" style={{ flex: 1 }}>
                                <h3>Transaction ID: {log.logId}</h3>
                                {/* Since Log stores snapshot, we use that. Log doesn't store Product Name directly? 
                                    Wait, Log schema has: productId, initialPrice, finalPrice. 
                                    It does NOT have productName. 
                                    However, the QR Code (which is a Data URL usually, or string content) might have info.
                                    Or we need to join with Product if Product still exists.
                                    But Product might be deleted? 
                                    Ideally Log should haveProductName. 
                                    Let's check Log Schema again.
                                    Step 19: Log has productId, transactionType, prices, status, qrCode. 
                                    It does NOT have name. Use productId to fetch if possible, or display generic.
                                    Actually, we can try to find Product by productId (string) but if it's "sold" it's still there.
                                    Let's rely on the user knowing what they bought, or maybe we can't show the name easily without Populate.
                                    Wait, 'productId' in Log is a string. Not a Ref Object ID.
                                    So populate('productId') on Log won't work if the Ref in Schema is incorrectly set or if it expects ObjectId.
                                    Step 19: productId type: String, ref: 'Product'. This is Mongoose mixed mode. 
                                    Mongoose refs usually need ObjectId. If stored as String 'prod-xxx', populate might fail unless localField/foreignField is set.
                                    I will just display Product ID and Price. And the QR Code image.
                                */}
                                <p>Product Ref: {log.productId}</p>
                                <p>Date: {new Date(log.createdAt).toLocaleDateString()}</p>
                                <p>Price: ₹{log.finalPrice}</p>
                                <p>Status: {log.status}</p>
                            </div>
                            <div className="qr-display" style={{ marginLeft: '20px', textAlign: 'center' }}>
                                {log.qrCode && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                        <img 
                                            src={log.qrCode} 
                                            alt="QR Code" 
                                            style={{ 
                                                width: '100px', 
                                                height: '100px', 
                                                border: '5px solid white',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }} 
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => downloadQRCode(log.qrCode, log.logId)}
                                                className="qr-action-btn"
                                                title="Download QR Code"
                                                style={{
                                                    background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                                                    border: 'none',
                                                    color: 'white',
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '12px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                            >
                                                <FiDownload size={14} />
                                                Download
                                            </button>
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    onClick={() => toggleShareDropdown(log.logId)}
                                                    className="qr-action-btn"
                                                    title="Share QR Code"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                                                        border: 'none',
                                                        color: 'white',
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '12px',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                                >
                                                    <FiShare2 size={14} />
                                                    Share
                                                </button>
                                                
                                                {activeShareDropdown === log.logId && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        right: '0',
                                                        marginTop: '4px',
                                                        background: 'white',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                        zIndex: 1000,
                                                        minWidth: '160px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <button
                                                            onClick={() => shareQRCode(log.qrCode, log.logId, 'whatsapp')}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px 12px',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                textAlign: 'left',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                fontSize: '14px',
                                                                color: '#25D366',
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseOver={(e) => e.target.style.background = '#f0f9ff'}
                                                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                                                        >
                                                            <FiMessageCircle size={16} />
                                                            WhatsApp
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => shareQRCode(log.qrCode, log.logId, 'email')}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px 12px',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                textAlign: 'left',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                fontSize: '14px',
                                                                color: '#EA4335',
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseOver={(e) => e.target.style.background = '#f0f9ff'}
                                                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                                                        >
                                                            <FiMail size={16} />
                                                            Email
                                                        </button>
                                                        
                                                        {navigator.share && (
                                                            <button
                                                                onClick={() => shareQRCode(log.qrCode, log.logId, 'native')}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '10px 12px',
                                                                    border: 'none',
                                                                    background: 'transparent',
                                                                    textAlign: 'left',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    fontSize: '14px',
                                                                    color: '#2196F3',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseOver={(e) => e.target.style.background = '#f0f9ff'}
                                                                onMouseOut={(e) => e.target.style.background = 'transparent'}
                                                            >
                                                                <FiShare2 size={16} />
                                                                Native Share
                                                            </button>
                                                        )}
                                                        
                                                        <button
                                                            onClick={() => shareQRCode(log.qrCode, log.logId, 'clipboard')}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px 12px',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                textAlign: 'left',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                fontSize: '14px',
                                                                color: '#6B7280',
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseOver={(e) => e.target.style.background = '#f0f9ff'}
                                                            onMouseOut={(e) => e.target.style.background = 'transparent'}
                                                        >
                                                            <FiMoreHorizontal size={16} />
                                                            Copy Link
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PurchaseHistory;
