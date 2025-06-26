import { z } from 'zod';

/**
 * Zod schema for topic metadata
 */
export const topicMetadataSchema = z.object({
  start_page: z.number(),
  end_page: z.number(),
}).readonly();

/**
 * Type for the raw API response before transformation
 */
export const topicDetailsRawSchema = z.object({
  topicId: z.number(),
  topicName: z.string(),
  sequence: z.number(),
  completed: z.boolean(),
  scorePercent: z.number(),
  averageScorePercent: z.number(),
  metadata: z.string(),
}).readonly();

/**
 * Zod schema for topic details response with transformed metadata
 */
export const topicDetailsSchema = topicDetailsRawSchema.transform((data) => {
  let parsedMetadata = { start_page: 1, end_page: 1 };
  
  try {
    if (typeof data.metadata === 'string') {
      const parsed = JSON.parse(data.metadata);
      parsedMetadata = {
        start_page: Number(parsed.start_page) || 1,
        end_page: Number(parsed.end_page) || 1
      };
    }
  } catch (error) {
    console.error('Error parsing metadata:', error);
  }
  
  return {
    ...data,
    metadata: parsedMetadata
  };
});

const ProgressSchema = z.object({
  traineeName: z.string().nullable(),
  cohortName: z.string().nullable(),
  rank: z.number(),
  totalQuizAttempted: z.number(),
  totalScore: z.string(),
  percentage: z.string().nullable(),
  completed: z.string(),
})

export type StudentProgress=z.infer<typeof ProgressSchema>

/**
 * TypeScript type for topic details, inferred from the Zod schema
 */
export type TopicDetails = z.infer<typeof topicDetailsSchema>;

/**
 * TypeScript type for topic metadata, inferred from the Zod schema
 */
export type TopicMetadata = z.infer<typeof topicMetadataSchema>;
