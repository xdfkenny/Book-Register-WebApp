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
import * as cheerio from 'cheerio';

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
      const url = `https://isbnsearch.org/isbn/${input.isbn}`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const title = $('h1').text().trim();
      
      // If title is not found, the book likely doesn't exist for that ISBN.
      if (!title) {
        return {
          title: '', // Return empty to indicate not found
        };
      }
      
      const isbn13 = $('p:contains("ISBN-13:")').text().replace('ISBN-13:', '').trim();
      const author = $('p:contains("Author:")').text().replace("Author:", "").trim();
      const edition = $('p:contains("Edition:")').text().replace("Edition:", "").trim();
      const publisher = $('p:contains("Publisher:")').text().replace("Publisher:", "").trim();
      const year = $('p:contains("Published:")').text().replace("Published:", "").trim();
      const imageUrl = $('div.image img').attr('src');

      // MLA Citation Construction
      let mlaCitation = `${author}. *${title.replace(/\(.*?\)/, '').trim()}*`;
      if (edition && edition !== '1') {
        mlaCitation += `. ${edition}`;
        // Add ordinal suffix if edition is a number
        if (!isNaN(parseInt(edition))) {
            const lastDigit = edition.slice(-1);
            if (lastDigit === '1' && edition !== '11') mlaCitation += 'st';
            else if (lastDigit === '2' && edition !== '12') mlaCitation += 'nd';
            else if (lastDigit === '3' && edition !== '13') mlaCitation += 'rd';
            else mlaCitation += 'th';
        }
        mlaCitation += ' ed.';
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
      console.error('Error scraping book data:', error);
      throw new Error(`Failed to scrape book data: ${error.message}`);
    }
  }
);
