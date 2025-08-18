import {z} from 'genkit';

export const GenerateProductDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the product.'),
  category: z.string().describe('The category of the product.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

export const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated description of the product.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export const GenerateSqlInputSchema = z.object({
  query: z.string().describe('The natural language query to convert to SQL.'),
  schema: z.string().describe('The database schema definition.'),
});
export type GenerateSqlInput = z.infer<typeof GenerateSqlInputSchema>;

export const GenerateSqlOutputSchema = z.object({
  sql: z.string().describe('The generated SQL query.'),
});
export type GenerateSqlOutput = z.infer<typeof GenerateSqlOutputSchema>;
