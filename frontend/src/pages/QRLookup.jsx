import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import './QRLookup.css';

const QRLookup = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            const decoded = JSON.parse(result.data);
            setResult(decoded);
            setError('');
            setIsScanning(false);
            qrScannerRef.current?.stop();
          } catch (err) {
            setError('Invalid QR code format. Please scan a valid product QR code.');
            setResult(null);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScannerRef.current.start().catch((err) => {
        console.error('QR Scanner Error:', err);
        setError('Camera access denied or not available. Please check permissions.');
      });
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
      }
    };
  }, [isScanning]);

  const startNewScan = () => {
    setResult(null);
    setError('');
    setIsScanning(true);
  };

  return (
    <div className="qr-lookup">
      <div className="lookup-container">
        <h1>QR Code Scanner</h1>
        <p>Scan a product QR code to view information</p>
        
        <div className="scanner-section">
          {isScanning && (
            <div className="qr-reader-container">
              <video
                ref={videoRef}
                className="qr-reader"
                playsInline
              />
            </div>
          )}

          {!isScanning && (
            <button onClick={startNewScan} className="btn-primary scan-new-btn">
              Scan New QR Code
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="qr-result">
            <h2>Product Information</h2>
            <div className="result-card">
              <p><strong>Product ID:</strong> {result.productId}</p>
              <p><strong>Product Name:</strong> {result.productName}</p>
              <p><strong>Farmer Name:</strong> {result.farmerName}</p>
              <p><strong>Farmer Location:</strong> {result.farmerLocation}</p>
              <p><strong>Certified by:</strong> {result.fpoName}</p>
              <p><strong>Purchase Date:</strong> {new Date(result.purchaseDate).toLocaleString()}</p>
              <p><strong>Price:</strong> ₹{result.price}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRLookup;

