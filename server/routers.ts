import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { syncRouter } from "./routers-sync";

export const appRouter = router({
  system: systemRouter,
  sync: syncRouter,
  // 로그인 기능은 제거되었습니다. iCloud 백업만 사용합니다.

  ai: router({
    classifyAchievement: publicProcedure
      .input(
        z.object({
          title: z.string().min(1).max(500),
          existingCategories: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              emoji: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const { title, existingCategories } = input;

        const categoryList = existingCategories
          .map((c) => `- id: "${c.id}", name: "${c.name}", emoji: ${c.emoji}`)
          .join("\n");

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a smart achievement classifier. Given an achievement title, classify it into the most appropriate category from the provided list.
Return a JSON object with:
- categoryId: the id of the best matching category
- categoryName: the name of the category
- confidence: a number from 0 to 1 indicating confidence
- reason: a brief Korean explanation (1 sentence)

Available categories:
${categoryList}

Rules:
- "1km 달리기", "5km 달리기", "헬스장" → 운동 (exercise)
- "셰익스피어", "한나 아렌트", "소설 읽기" → 독서 (reading)
- "파이썬 공부", "수학 문제" → 학습 (study)
- "명상", "물 2L 마시기" → 건강 (health)
- "그림 그리기", "작곡" → 창작 (creative)
- "친구 연락", "가족 식사" → 소통 (social)
- If unsure, use "other"`,
            },
            {
              role: "user",
              content: `Classify this achievement: "${title}"`,
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));

        return {
          categoryId: parsed.categoryId as string,
          categoryName: parsed.categoryName as string,
          confidence: parsed.confidence as number,
          reason: parsed.reason as string,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
