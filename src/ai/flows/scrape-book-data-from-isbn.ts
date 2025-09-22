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
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${input.isbn}${apiKey ? '&key=' + apiKey : ''}`;
      
      const { data } = await axios.get(url);

      if (data.totalItems === 0 || !data.items || data.items.length === 0) {
        return { title: '' }; // Return empty to indicate not found
      }

      const book = data.items[0];
      const volumeInfo = book.volumeInfo;

      const title = volumeInfo.title;
      const authors = volumeInfo.authors || [];
      const author = authors.join(', ');
      const publisher = volumeInfo.publisher;
      const year = volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear().toString() : '';

      const isbn13Identifier = volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13');
      const isbn13 = isbn13Identifier ? isbn13Identifier.identifier : input.isbn;

      // Google Books API doesn't reliably provide an "edition" field in a structured way.
      // It's often part of the title or subtitle. For now, we'll leave it blank.
      const edition = ''; 
      
      const imageUrl = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;

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
      console.error('Error fetching book data from Google Books API:', error);
      throw new Error(`Failed to fetch book data: ${error.message}`);
    }
  }
);
