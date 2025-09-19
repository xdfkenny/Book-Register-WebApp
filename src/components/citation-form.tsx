'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';

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
  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Find Your Citation</CardTitle>
        <CardDescription className="font-body">Enter the 10 or 13-digit ISBN of your book.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="isbn"
              name="isbn"
              type="text"
              placeholder="e.g., 978-0136019701"
              required
              className="flex-grow font-body text-base"
            />
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
