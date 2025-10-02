'use server';
/**
 * @fileOverview This file defines a Genkit flow to scrape book data from an ISBN.
 *
 * scrapeBookDataFromISBN - A function that handles the scraping and formatting of book data.
 * ScrapeBookDataFromISBNInput - The input type for the scrapeBookDataFromISBN function.
 * ScrapeBookDataFromISBNOutput - The return type for the scrapeBookDataFromISBN function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateMLACitation } from './generate-mla-citation';

const ScrapeBookDataFromISBNInputSchema = z.object({
  isbn: z.string().describe('The ISBN of the book to scrape data for.'),
});
export type ScrapeBookDataFromISBNInput = z.infer<typeof ScrapeBookDataFromISBNInputSchema>;


const ScrapedBookDataSchema = z.object({
    isbn13: z.string().optional().describe('The ISBN-13 of the book.'),
    author: z.string().optional().describe('The author of the book.'),
    title: z.string().optional().describe('The title of the book.'),
    edition: z.string().optional().describe('The edition of the book.'),
    publisher: z.string().optional().describe('The publisher of the book.'),
    year: z.string().optional().describe('The publication year of the book.'),
    imageUrl: z.string().optional().describe('The URL of the book cover image.'),
});

const ScrapeBookDataFromISBNOutputSchema = ScrapedBookDataSchema.extend({
    mla_citation: z.string().optional().describe('The generated MLA citation.'),
});
export type ScrapeBookDataFromISBNOutput = z.infer<typeof ScrapeBookDataFromISBNOutputSchema>;


export async function scrapeBookDataFromISBN(input: ScrapeBookDataFromISBNInput): Promise<ScrapeBookDataFromISBNOutput> {
  return scrapeBookDataFromISBNFlow(input);
}


const bookDataPrompt = ai.definePrompt({
    name: 'bookDataPrompt',
    input: { schema: ScrapeBookDataFromISBNInputSchema },
    output: { schema: ScrapedBookDataSchema },
    prompt: `You are a book data expert. Given an ISBN, find the book's title, author(s), publisher, publication year, edition number, a public URL for the book cover image, and the 13-digit ISBN. If you cannot find the book, return an empty object.

    ISBN: {{{isbn}}}`,
});


const scrapeBookDataFromISBNFlow = ai.defineFlow(
  {
    name: 'scrapeBookDataFromISBNFlow',
    inputSchema: ScrapeBookDataFromISBNInputSchema,
    outputSchema: ScrapeBookDataFromISBNOutputSchema,
  },
  async (input) => {
    const { output: bookData } = await bookDataPrompt(input);

    if (!bookData || !bookData.title) {
        return { title: undefined };
    }
    
    const citationResponse = await generateMLACitation({
        author: bookData.author || '',
        title: bookData.title || '',
        edition: bookData.edition || '',
        publisher: bookData.publisher || '',
        year: bookData.year || '',
    });

    return {
        ...bookData,
        mla_citation: citationResponse.mla_citation,
    };
  }
);
