import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface GateTokenQRCodeProps {
  tokenNumber: string;
  size?: number; // Screen size in px, default 140
  showLabel?: boolean;
  className?: string;
}

export const GateTokenQRCode: React.FC<GateTokenQRCodeProps> = ({
  tokenNumber,
  size = 140,
  showLabel = false,
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (!tokenNumber) return;

    // Generate high contrast PNG data URL for maximum scanner readability & print crispness
    QRCode.toDataURL(
      tokenNumber.trim(),
      {
        margin: 1,
        width: size * 2, // 2x scale for retina / high-DPI print clarity
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url && isMounted) {
          setDataUrl(url);
        }
      }
    );

    return () => {
      isMounted = false;
    };
  }, [tokenNumber, size]);

  if (!dataUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-gray-200 rounded text-xs text-gray-400 font-mono ${className}`}
        style={{ width: size, height: size }}
      >
        QR...
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-gray-200 shadow-xs print:shadow-none print:border-black ${className}`}>
      <img
        src={dataUrl}
        alt={`QR Code for Token ${tokenNumber}`}
        style={{ width: size, height: size }}
        className="block object-contain print:w-[35mm] print:h-[35mm]"
      />
      {showLabel && (
        <span className="text-[10px] font-mono font-bold text-gray-600 mt-1 print:text-black print:text-xs">
          {tokenNumber}
        </span>
      )}
    </div>
  );
};

export default GateTokenQRCode;
