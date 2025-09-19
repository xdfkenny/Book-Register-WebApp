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
});
export type ScrapeBookDataFromISBNOutput = z.infer<typeof ScrapeBookDataFromISBNOutputSchema>;

export async function scrapeBookDataFromISBN(input: ScrapeBookDataFromISBNInput): Promise<ScrapeBookDataFromISBNOutput> {
  return scrapeBookDataFromISBNFlow(input);
}

const bookDataPrompt = ai.definePrompt({
  name: 'bookDataPrompt',
  input: {schema: ScrapeBookDataFromISBNInputSchema},
  output: {schema: ScrapeBookDataFromISBNOutputSchema},
  prompt: `You are an expert librarian. Extract the title, author, ISBN-13, edition, publisher, and year from the HTML content provided.

    Here is the HTML content:
    {{htmlContent}}

    Output the data in JSON format:
    {
      "isbn13": "ISBN-13",
      "author": "Author",
      "title": "Title",
      "edition": "Edition",
      "publisher": "Publisher",
      "year": "Year"
    }`,
});

const mlaCitationPrompt = ai.definePrompt({
  name: 'mlaCitationPrompt',
  input: {schema: ScrapeBookDataFromISBNOutputSchema},
  output: {schema: z.string().describe('The MLA citation.')},
  prompt: `Generate an MLA citation based on the following book data.

    Title: {{title}}
    Author: {{author}}
    Edition: {{edition}}
    Publisher: {{publisher}}
    Year: {{year}}

    Format the citation as follows:
    Author. *Title*. Edition, Publisher, Year.

    - If Edition is "1", omit the edition information.
    - If the Title contains edition info in parentheses, remove it.
    - Italicize the title.
    `,
});

async function scrapeData(isbn: string): Promise<string> {
  const url = `https://isbnsearch.org/isbn/${isbn}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text();
}

const scrapeBookDataFromISBNFlow = ai.defineFlow(
  {
    name: 'scrapeBookDataFromISBNFlow',
    inputSchema: ScrapeBookDataFromISBNInputSchema,
    outputSchema: ScrapeBookDataFromISBNOutputSchema,
  },
  async input => {
    try {
      const htmlContent = await scrapeData(input.isbn);
      const $ = cheerio.load(htmlContent);
      const bookInfo = $(".bookinfo");

      const title = bookInfo.find("h1").text().trim();
      const isbn13 = bookInfo
        .find("p:contains('ISBN-13:')")
        .text()
        .replace("ISBN-13:", "")
        .trim();
      const isbn10 = bookInfo
        .find("p:contains('ISBN-10:')")
        .text()
        .replace("ISBN-10:", "")
        .trim();

      let author = bookInfo
        .find("p:contains('Author:')")
        .text()
        .replace("Author:", "")
        .trim();

      let edition = bookInfo
        .find("p:contains('Edition:')")
        .text()
        .replace("Edition:", "")
        .trim();

      const publisher = bookInfo
        .find("p:contains('Publisher:')")
        .text()
        .replace("Publisher:", "")
        .trim();

      const year = bookInfo
        .find("p:contains('Published:')")
        .text()
        .replace("Published:", "")
        .trim();

      const bookData = {
        title,
        author,
        edition,
        publisher,
        year,
        isbn13,
      };

      const {output: mlaCitation} = await mlaCitationPrompt(bookData);

      return {
        isbn13: bookData.isbn13,
        mla_citation: mlaCitation,
        author: bookData.author,
        title: bookData.title,
        edition: bookData.edition,
        publisher: bookData.publisher,
        year: bookData.year,
      };
    } catch (error: any) {
      console.error('Error scraping book data:', error);
      throw new Error(`Failed to scrape book data: ${error.message}`);
    }
  }
);
