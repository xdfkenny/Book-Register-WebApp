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
import axios from 'axios';

const ScrapeBookDataFromISBNInputSchema = z.object({
  isbn: z.string().describe('The ISBN of the book to scrape data for.'),
});
export type ScrapeBookDataFromISBNInput = z.infer<typeof ScrapeBookDataFromISBNInputSchema>;

const ScrapeBookDataFromISBNOutputSchema = z.object({
  isbn13: z.string().optional().describe('The ISBN-13 of the book.'),
  mla_citation: z.string().optional().describe('The generated MLA citation.'),
  author: z.string().optional().describe('The author of the book.'),
  title: z.string().optional().describe('The title of the book.'),
  edition: z.string().optional().describe('The edition of the book.'),
  publisher: z.string().optional().describe('The publisher of the book.'),
  year: z.string().optional().describe('The publication year of the book.'),
  imageUrl: z.string().optional().describe('The URL of the book cover image.'),
});
export type ScrapeBookDataFromISBNOutput = z.infer<typeof ScrapeBookDataFromISBNOutputSchema>;

export async function scrapeBookDataFromISBN(input: ScrapeBookDataFromISBNInput): Promise<ScrapeBookDataFromISBNOutput> {
  return scrapeBookDataFromISBNFlow(input);
}

const scrapeBookDataFromISBNFlow = ai.defineFlow(
  {
    name: 'scrapeBookDataFromISBNFlow',
    inputSchema: ScrapeBookDataFromISBNInputSchema,
    outputSchema: ScrapeBookDataFromISBNOutputSchema,
  },
  async (input) => {
    try {
      const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${input.isbn}&jscmd=data&format=json`;
      
      const { data } = await axios.get(url);

      const bookData = data[`ISBN:${input.isbn}`];

      if (!bookData) {
        return { title: '' }; // Return empty to indicate not found
      }

      const title = bookData.title;
      const authors = bookData.authors?.map((a: { name: string }) => a.name) || [];
      const author = authors.join(', ');
      const publisher = bookData.publishers?.map((p: { name: string }) => p.name).join(', ') || '';
      const year = bookData.publish_date || '';

      const isbn13 = bookData.identifiers?.isbn_13?.[0] || input.isbn;
      
      // OpenLibrary API doesn't reliably provide an "edition" field in the main data response.
      const edition = ''; 

      const imageUrl = bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small;

      // MLA Citation Construction
      let mlaCitation = `${author}. *${title.replace(/\(.*?\)/, '').trim()}*`;
      if (edition && edition !== '1') {
        mlaCitation += `. ${edition} ed.`;
      }
      mlaCitation += `, ${publisher}, ${year}.`;

      return {
        isbn13,
        mla_citation: mlaCitation,
        author,
        title,
        edition,
        publisher,
        year,
        imageUrl,
      };
    } catch (error: any) {
      console.error('Error fetching book data from OpenLibrary API:', error);
      throw new Error(`Failed to fetch book data: ${error.message}`);
    }
  }
);
