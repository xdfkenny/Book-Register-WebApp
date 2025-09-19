'use client';

import { ScrapeBookDataFromISBNOutput } from '@/ai/flows/scrape-book-data-from-isbn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clipboard } from 'lucide-react';
import React, { useState } from 'react';

interface CitationResultProps {
  result: ScrapeBookDataFromISBNOutput | null;
}

const renderWithItalics = (text: string | undefined) => {
  if (!text) return null;
  const parts = text.split(/(\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.substring(1, part.length - 1)}</em>;
    }
    return part;
  });
};

export function CitationResult({ result }: CitationResultProps) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return null;
  }

  const handleCopy = () => {
    if (result.mla_citation) {
        // Create a temporary textarea element to get the plain text version of the citation.
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = result.mla_citation.replace(/\*/g, '');
        navigator.clipboard.writeText(tempTextArea.value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }
  };

  return (
    <div className="mt-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <Card className="w-full shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-2xl text-primary">Citation Ready</CardTitle>
                        <CardDescription className="font-body">Your MLA citation is generated and ready to use.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-full bg-green-100 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium hidden sm:inline">Success</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-headline text-lg font-semibold text-primary mb-2">MLA Citation</h3>
                        <div className="relative group rounded-lg border bg-muted p-4">
                            <p className="text-left font-body text-foreground/90 leading-relaxed">
                                {renderWithItalics(result.mla_citation)}
                            </p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleCopy}
                                aria-label="Copy citation"
                            >
                                {copied ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clipboard className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-headline text-lg font-semibold text-primary mb-2">Book Details</h3>
                        <ul className="space-y-1 font-body text-sm text-muted-foreground text-left list-disc list-inside bg-muted/50 p-4 rounded-lg">
                            {result.title && <li><span className="font-semibold text-foreground">Title:</span> {result.title}</li>}
                            {result.author && <li><span className="font-semibold text-foreground">Author:</span> {result.author}</li>}
                            {result.isbn13 && <li><span className="font-semibold text-foreground">ISBN-13:</span> {result.isbn13}</li>}
                            {result.publisher && <li><span className="font-semibold text-foreground">Publisher:</span> {result.publisher}</li>}
                            {result.year && <li><span className="font-semibold text-foreground">Year:</span> {result.year}</li>}
                            {result.edition && result.edition !== '1' && <li><span className="font-semibold text-foreground">Edition:</span> {result.edition}</li>}
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
        <div className="mt-4 p-4 text-center bg-blue-100/50 text-blue-800 rounded-lg text-sm font-body border border-blue-200">
            <p><span className="font-semibold">Confirmation:</span> Your citation is ready. You can now add it to your records.</p>
            <p className="text-xs mt-1">Future update: direct integration with Google Sheets.</p>
        </div>
    </div>
  );
}
