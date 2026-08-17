import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, AlertTriangle, RefreshCw } from 'lucide-react';

interface TokenQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedTokenNumber: string) => void;
}

export const TokenQRScanner: React.FC<TokenQRScannerProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [detectedToken, setDetectedToken] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef<boolean>(false);
  const containerId = 'token-qr-scanner-region';

  const stopAndCleanupScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Cleanup QR scanner info:', err);
      } finally {
        scannerRef.current = null;
      }
    }
    setIsScanning(false);
  };

  const handleClose = async () => {
    await stopAndCleanupScanner();
    onClose();
  };

  const startScanner = async () => {
    setErrorMsg(null);
    setDetectedToken(null);
    hasScannedRef.current = false;

    // Ensure previous instance is stopped
    await stopAndCleanupScanner();

    try {
      const html5Qrcode = new Html5Qrcode(containerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = html5Qrcode;

      setIsScanning(true);

      const qrConfig = {
        fps: 10,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
      };

      const onSuccess = async (decodedText: string) => {
        if (hasScannedRef.current) return; // Prevent duplicate scan callbacks
        hasScannedRef.current = true;

        const cleanToken = (decodedText || '').trim();
        setDetectedToken(cleanToken);

        // Instantly stop camera stream before calling onScan
        await stopAndCleanupScanner();

        setTimeout(() => {
          onScan(cleanToken);
          onClose();
        }, 300);
      };

      const onError = () => {
        // Ignore noise from frames with no QR
      };

      // Prefer rear camera on mobile devices
      try {
        await html5Qrcode.start(
          { facingMode: 'environment' },
          qrConfig,
          onSuccess,
          onError
        );
      } catch (errFacing) {
        // Fallback to any available user video device
        await html5Qrcode.start(
          { facingMode: 'user' },
          qrConfig,
          onSuccess,
          onError
        );
      }
    } catch (err: any) {
      setIsScanning(false);
      const msg = String(err?.message || err || '');
      if (msg.includes('NotAllowedError') || msg.includes('Permission denied')) {
        setErrorMsg(
          'Camera access was denied. You can allow camera access from browser settings, or enter the Gate Token Number manually.'
        );
      } else if (msg.includes('NotFoundError') || msg.includes('Requested device not found')) {
        setErrorMsg('No camera was detected on this device. Enter the Token Number manually.');
      } else {
        setErrorMsg(
          'Unable to start camera scanner. Please ensure HTTPS or localhost is active and permit camera access.'
        );
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Delay slightly to let container DOM mount
      const timer = setTimeout(() => {
        startScanner();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      stopAndCleanupScanner();
    }
  }, [isOpen]);

  useEffect(() => {
    // Unmount cleanup guard
    return () => {
      stopAndCleanupScanner();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-900 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#C5A059]" />
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider">SCAN MATERIAL GATE TOKEN</h3>
              <p className="text-[11px] text-gray-400">Point camera at QR code on Gate Entry Slip</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport Container */}
        <div className="p-5 flex flex-col items-center justify-center bg-gray-950 min-h-[300px] relative">
          <div
            id={containerId}
            className="w-full max-w-[280px] h-[280px] overflow-hidden rounded-xl bg-black border-2 border-gray-800 relative flex items-center justify-center"
          />

          {detectedToken && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-4 text-center z-20 animate-in zoom-in duration-150">
              <span className="text-xs text-emerald-300 uppercase tracking-widest font-semibold">Token Detected</span>
              <span className="text-xl font-mono font-black text-white mt-1">{detectedToken}</span>
              <span className="text-xs text-emerald-400 mt-2">Loading material details...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-950/90 border border-red-800 rounded-xl text-red-200 text-xs space-y-3 text-center max-w-[280px] z-20">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="leading-relaxed">{errorMsg}</p>
              <button
                onClick={startScanner}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            {isScanning ? 'Scanning for Gate Token QR...' : 'Camera standby'}
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenQRScanner;
