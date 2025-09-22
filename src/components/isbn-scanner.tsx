"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';

interface IsbnScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

const qrcodeRegionId = "isbn-scanner-region";

export function IsbnScanner({ onScanSuccess }: IsbnScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        setError("No cameras found on this device.");
      }
    } catch (err) {
      setHasPermission(false);
      setError("Camera access denied. Please enable camera permissions in your browser settings.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (hasPermission === null) {
        // Initially, don't do anything. Wait for user action.
        return;
    }

    if (hasPermission) {
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode(qrcodeRegionId);
        }
        const html5Qrcode = scannerRef.current;

        if (html5Qrcode.getState() === Html5QrcodeScannerState.SCANNING) {
            return;
        }

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          rememberLastUsedCamera: true,
          formatsToSupport: [0, 8], // 0: All, 8: EAN_13
        };

        html5Qrcode.start(
            { facingMode: "environment" },
            config,
            (decodedText, _decodedResult) => {
              onScanSuccess(decodedText);
              html5Qrcode.stop().catch(err => console.error("Failed to stop scanner:", err));
            },
            (_errorMessage) => {
              // handle scan failure, usually better to ignore and keep scanning
            }
        ).catch((err) => {
            setError("Failed to start the scanner. " + err);
            console.error("Scanner start error:", err);
        });

        return () => {
            if (html5Qrcode && html5Qrcode.isScanning) {
                html5Qrcode.stop().catch(err => console.log("Failed to gracefully stop scanner", err));
            }
        };
    }
  }, [hasPermission, onScanSuccess]);

  return (
    <div className="space-y-4">
        <div id={qrcodeRegionId} className="w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {hasPermission === null && (
                <div className="text-center p-4">
                     <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Camera is required to scan barcodes.</p>
                    <Button onClick={requestCameraPermission} className="mt-4">
                        Request Camera Permission
                    </Button>
                </div>
            )}
        </div>
        {error && (
            <Alert variant="destructive">
                <CameraOff className="h-4 w-4" />
                <AlertTitle>Camera Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
    </div>
  );
}
