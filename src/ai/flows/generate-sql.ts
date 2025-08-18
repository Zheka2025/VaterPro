'use server';

import {ai} from '@/ai/genkit';
import { GenerateSqlInputSchema, GenerateSqlOutputSchema, type GenerateSqlInput, type GenerateSqlOutput } from '@/ai/schemas';

export async function generateSql(input: GenerateSqlInput): Promise<GenerateSqlOutput> {
  return generateSqlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSqlPrompt',
  input: {schema: GenerateSqlInputSchema},
  output: {schema: GenerateSqlOutputSchema},
  prompt: `You are an expert SQL developer. Given a natural language query and a database schema, write a SQL query that answers the user's question. Only return the SQL query.

  Schema:
  {{{schema}}}

  User Query:
  "{{{query}}}"
  
  SQL Query:`,
});

const generateSqlFlow = ai.defineFlow(
  {
    name: 'generateSqlFlow',
    inputSchema: GenerateSqlInputSchema,
    outputSchema: GenerateSqlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
