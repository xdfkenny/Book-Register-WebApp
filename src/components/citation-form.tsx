'use client';

import { useFormStatus } from 'react-dom';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2, Camera } from 'lucide-react';
import { IsbnScanner } from './isbn-scanner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CitationFormProps {
  formAction: (payload: FormData) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
        type="submit" 
        disabled={pending} 
        className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent"
        aria-label="Get Citation"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Grabbing...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Get Citation
        </>
      )}
    </Button>
  );
}

export function CitationForm({ formAction }: CitationFormProps) {
  const [isScannerOpen, setScannerOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScanSuccess = (decodedText: string) => {
    if (inputRef.current) {
        inputRef.current.value = decodedText;
    }
    setScannerOpen(false);
  };

  return (
    <>
      <Card className="w-full bg-card/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Find Your Citation</CardTitle>
          <CardDescription className="font-body">Enter the 10 or 13-digit ISBN of your book.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-4">
            <div className="relative">
              <Input
                ref={inputRef}
                id="isbn"
                name="isbn"
                type="text"
                inputMode="numeric"
                pattern="[0-9Xx-]*"
                placeholder="e.g., 978-0136019701"
                required
                className="flex-grow font-body text-base pr-10"
              />
              <Button 
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                onClick={() => setScannerOpen(true)}
                aria-label="Scan ISBN"
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex justify-end">
                <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Scan ISBN Barcode</DialogTitle>
            <DialogDescription>
              Point your camera at the book's barcode.
            </DialogDescription>
          </DialogHeader>
          <IsbnScanner onScanSuccess={handleScanSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
