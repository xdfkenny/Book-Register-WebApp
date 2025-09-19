'use server';

import { z } from 'zod';
import { scrapeBookDataFromISBN, ScrapeBookDataFromISBNOutput } from '@/ai/flows/scrape-book-data-from-isbn';

const FormSchema = z.object({
  isbn: z.string().min(10, { message: 'ISBN must be at least 10 characters.' }).regex(/^[0-9Xx-]+$/, { message: 'Invalid ISBN format.' }),
});

export type FormState = {
  data: ScrapeBookDataFromISBNOutput | null;
  error: string | null;
};

export async function getBookCitation(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validatedFields = FormSchema.safeParse({
    isbn: formData.get('isbn'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.isbn?.join(', ') ?? 'Invalid input.',
    };
  }
  
  const isbn = validatedFields.data.isbn.replace(/-/g, '');

  try {
    const result = await scrapeBookDataFromISBN({ isbn });
    
    if (!result || !result.title) {
        return {
            data: null,
            error: `Could not find a book with ISBN: ${isbn}. Please check the number and try again.`,
        };
    }

    return {
      data: result,
      error: null,
    };
  } catch (e) {
    console.error(e);
    return {
      data: null,
      error: 'Failed to fetch citation data. The service might be temporarily unavailable or the ISBN is incorrect.',
    };
  }
}
