import { z } from 'zod';

// Schema for /api/ai/analyze-application
export const aiAnalyzeApplicationSchema = z.object({
  application: z.object({
    user_name: z.string().min(1),
    mentor_type: z.string().min(1),
    goals: z.string().min(1),
    seriousness: z.number().min(0).max(10),
    experience: z.string().optional(),
    pillar: z.string().optional(),
  }),
});

// Schema for /api/ai/generate-brief
export const aiGenerateBriefSchema = z.object({
  booking: z.object({
    user_name: z.string().min(1),
    time: z.string().min(1),
    date: z.string().min(1),
  }),
  studentContext: z.string().min(1),
  purchasedProducts: z.array(z.string()).optional(),
});

// Schema for /api/ai/chat
export const aiChatSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      text: z.string(),
    })
  ),
  message: z.string().min(1),
});
