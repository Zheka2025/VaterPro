'use server';

/**
 * @fileOverview Generates product descriptions using AI based on the product name and category.
 *
 * - generateProductDescription - A function that handles the product description generation process.
 */

import {ai} from '@/ai/genkit';
import { GenerateProductDescriptionInputSchema, GenerateProductDescriptionOutputSchema, type GenerateProductDescriptionInput, type GenerateProductDescriptionOutput } from '@/ai/schemas';

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in writing compelling product descriptions for e-commerce websites.

  Based on the product name and category, generate a detailed and engaging product description that highlights the key features and benefits of the product.

  Product Name: {{{name}}}
  Category: {{{category}}}
  
  Description:`, // Provide the description directly as the output
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
