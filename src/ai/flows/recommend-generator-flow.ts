
'use server';
/**
 * @fileOverview An AI flow to recommend a generator based on user needs.
 *
 * - findGenerator - A function that takes user requirements and returns a suitable generator.
 * - FindGeneratorInput - The input type for the findGenerator function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generators } from '@/lib/data';
import type { Generator } from '@/lib/types';

// Define tools for the AI to use
const getGeneratorCatalogTool = ai.defineTool(
  {
    name: 'getGeneratorCatalog',
    description: 'Returns a list of all available generators for rent.',
    inputSchema: z.void(),
    outputSchema: z.array(z.object({
        id: z.string(),
        name: z.string(),
        capacity: z.number(),
        pricePerDay: z.number(),
        fuelType: z.string(),
    })),
  },
  async () => {
    return generators.map(({ id, name, capacity, pricePerDay, fuelType }) => ({ id, name, capacity, pricePerDay, fuelType }));
  }
);


const FindGeneratorInputSchema = z.object({
  useCase: z.string().describe('The intended use case for the generator (e.g., Home Backup, Construction Site).'),
  powerNeeds: z.number().describe('The required power capacity in kilowatts (kW).'),
  budget: z.string().describe('The user\'s daily budget preference (e.g., Economy, Standard, Premium).'),
});
export type FindGeneratorInput = z.infer<typeof FindGeneratorInputSchema>;

const FindGeneratorOutputSchema = z.object({
  generatorId: z.string().optional().describe('The ID of the most suitable generator from the catalog. If no suitable generator is found, this can be null.'),
  reasoning: z.string().describe('A brief explanation for why this generator was recommended.'),
});

const recommendGeneratorFlow = ai.defineFlow(
  {
    name: 'recommendGeneratorFlow',
    inputSchema: FindGeneratorInputSchema,
    outputSchema: FindGeneratorOutputSchema,
  },
  async (input) => {
    const llm = ai.getModel('googleai/gemini-2.5-flash');
    const { output } = await llm.generate({
      prompt: `You are an expert assistant for a generator rental company. Your task is to recommend the best generator for a customer based on their needs.

      Here are the customer's requirements:
      - Use Case: ${input.useCase}
      - Power Needs: ${input.powerNeeds} kW
      - Daily Budget: ${input.budget}

      First, use the getGeneratorCatalog tool to see the list of available generators.
      Then, analyze the catalog and find the single best match for the customer. 
      Consider the power capacity (it should be equal to or greater than the customer's needs) and the price per day (it should align with their budget).
      Prioritize meeting the power needs first, then find the most cost-effective option within their budget.
      
      Return the ID of the recommended generator and a short reasoning for your choice. If no generator meets the criteria, explain why.`,
      tools: [getGeneratorCatalogTool],
      output: {
        schema: FindGeneratorOutputSchema,
      },
    });

    return output!;
  }
);


export async function findGenerator(input: FindGeneratorInput): Promise<Generator | null> {
  const result = await recommendGeneratorFlow(input);
  
  if (result && result.generatorId) {
    const recommendedGenerator = generators.find(g => g.id === result.generatorId);
    return recommendedGenerator || null;
  }
  
  return null;
}
