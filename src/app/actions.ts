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

const CitationSchema = z.object({
  citation: z.string(),
  quantity: z.string().transform(Number).refine(n => n > 0, "Quantity must be greater than 0."),
});

export async function addCitationToSheet(
  prevState: { success: boolean, message: string },
  formData: FormData,
): Promise<{ success: boolean, message: string }> {
  const validatedFields = CitationSchema.safeParse({
    citation: formData.get('citation'),
    quantity: formData.get('quantity'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid citation or quantity format."
    };
  }
  
  const { citation, quantity } = validatedFields.data;
  const citationWithQuantity = `${citation} + [${quantity} units]`;
  
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSf8ydUYHcnsEXFojikB5LFjUQnmLdtYc_CLdUxluw0Is7GGvw/formResponse";
  
  const submissionData = new FormData();
  submissionData.append("entry.366340186", citationWithQuantity);
  submissionData.append("fvv", "1");
  submissionData.append("pageHistory", "0");
  submissionData.append("fbzx", "7857329722940199907");
  
  try {
    const response = await fetch(formUrl, {
      method: "POST",
      mode: "no-cors",
      body: submissionData,
    });
    return {
      success: true,
      message: "Citation successfully added to your Google Sheet!"
    };
  } catch (error) {
    console.error("Error submitting to Google Form:", error);
    return {
      success: false,
      message: "Failed to add citation to Google Sheet."
    };
  }
}
