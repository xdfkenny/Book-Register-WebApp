"use client";

import { useActionState } from "react";
import { Book, Github, Loader2 } from "lucide-react";
import { getBookCitation } from "@/app/actions";
import { CitationForm } from "@/components/citation-form";
import { CitationResult } from "@/components/citation-result";
import { Button } from "@/components/ui/button";

const initialState = {
  data: null,
  error: null,
};

export default function Home() {
  const [state, formAction] = useActionState(getBookCitation, initialState);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background">
      <div className="z-10 w-full max-w-2xl items-center justify-between font-mono text-sm lg:flex">
        {/* Placeholder for potential header content */}
      </div>

      <div className="relative flex flex-col place-items-center gap-8 text-center">
        <div className="p-6 bg-primary/10 rounded-full">
            <Book className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold tracking-tight text-primary">
          Book Register
        </h1>
        <p className="max-w-lg text-lg text-foreground/80 font-body">
          Enter an ISBN to instantly get your book data and a formatted MLA citation to be send to the Google Sheets.
        </p>
      </div>

      <div className="w-full max-w-2xl mt-12">
        <CitationForm formAction={formAction} />
        
        {state.error && (
            <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                <p className="font-semibold">An error occurred:</p>
                <p>{state.error}</p>
            </div>
        )}

        <CitationResult result={state.data} />
      </div>

      <footer className="mt-16 text-center text-sm text-muted-foreground font-body space-y-2">
        <p>Powered by xdfkenny and ISBN Search. Designed by students.</p>
        <a href="https://github.com/xdfkenny" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" aria-label="GitHub">
            <Github className="h-5 w-5" />
          </Button>
        </a>
      </footer>
    </main>
  );
}
