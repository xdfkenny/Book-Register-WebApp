'use server';

/**
 * @fileOverview Generates an MLA citation from book data.
 *
 * - generateMLACitation - A function that generates the MLA citation.
 * - GenerateMLACitationInput - The input type for the generateMLACitation function.
 * - GenerateMLACitationOutput - The return type for the generateMLACitation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMLACitationInputSchema = z.object({
  author: z.string().describe('The author of the book.'),
  title: z.string().describe('The title of the book.'),
  edition: z.string().describe('The edition of the book.'),
  publisher: z.string().describe('The publisher of the book.'),
  year: z.string().describe('The publication year of the book.'),
});
export type GenerateMLACitationInput = z.infer<
  typeof GenerateMLACitationInputSchema
>;

const GenerateMLACitationOutputSchema = z.object({
  mla_citation: z.string().describe('The generated MLA citation.'),
});
export type GenerateMLACitationOutput = z.infer<
  typeof GenerateMLACitationOutputSchema
>;

export async function generateMLACitation(
  input: GenerateMLACitationInput
): Promise<GenerateMLACitationOutput> {
  return generateMLACitationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMLACitationPrompt',
  input: {schema: GenerateMLACitationInputSchema},
  output: {schema: GenerateMLACitationOutputSchema},
  prompt: `Generate an MLA citation string from the following book data, formatted as:\n\nAuthor. *Title*. Edition, Publisher, Year.\n\n- Conditional formatting rules:\n  - If Edition = \"1\", omit edition info.\n  - If Title contains edition info in parentheses, remove it.\n  - Italicize the title.\n\nBook Data:\nAuthor: {{{author}}}\nTitle: {{{title}}}\nEdition: {{{edition}}}\nPublisher: {{{publisher}}}\nYear: {{{year}}}`,
});

const generateMLACitationFlow = ai.defineFlow(
  {
    name: 'generateMLACitationFlow',
    inputSchema: GenerateMLACitationInputSchema,
    outputSchema: GenerateMLACitationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
