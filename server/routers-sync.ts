import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { achievementQueries, listQueries, listItemQueries } from "./db";

/**
 * 클라우드 동기화 관련 tRPC 라우터
 * 모든 엔드포인트는 protectedProcedure를 사용하여 인증 필수
 */
export const syncRouter = router({
  // ============ 성취 목표 API ============
  achievements: router({
    // 사용자의 모든 성취 목표 조회
    getAll: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await achievementQueries.getUserAchievements(ctx.user.id);
      } catch (error) {
        console.error("Failed to get achievements:", error);
        return [];
      }
    }),

    // 성취 목표 생성
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional(),
          categoryId: z.string(),
          completionCount: z.number().default(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await achievementQueries.createAchievement({
            id: input.id,
            userId: ctx.user.id,
            title: input.title,
            description: input.description,
            categoryId: input.categoryId,
            completionCount: input.completionCount,
          });
          return result[0];
        } catch (error) {
          console.error("Failed to create achievement:", error);
          throw error;
        }
      }),

    // 성취 목표 업데이트
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          categoryId: z.string().optional(),
          completionCount: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { id, ...data } = input;
          const result = await achievementQueries.updateAchievement(id, data);
          return result[0];
        } catch (error) {
          console.error("Failed to update achievement:", error);
          throw error;
        }
      }),

    // 성취 목표 삭제
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await achievementQueries.deleteAchievement(input.id);
          return { success: true };
        } catch (error) {
          console.error("Failed to delete achievement:", error);
          throw error;
        }
      }),
  }),

  // ============ 리스트 API ============
  lists: router({
    // 사용자의 모든 리스트 조회
    getAll: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await listQueries.getUserLists(ctx.user.id);
      } catch (error) {
        console.error("Failed to get lists:", error);
        return [];
      }
    }),

    // 리스트 생성
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional(),
          categoryId: z.string(),
          totalCount: z.number().default(0),
          completionCount: z.number().default(0),
          isCompleted: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await listQueries.createList({
            id: input.id,
            userId: ctx.user.id,
            title: input.title,
            description: input.description,
            categoryId: input.categoryId,
            totalCount: input.totalCount,
            completionCount: input.completionCount,
            isCompleted: input.isCompleted,
          });
          return result[0];
        } catch (error) {
          console.error("Failed to create list:", error);
          throw error;
        }
      }),

    // 리스트 업데이트
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          categoryId: z.string().optional(),
          totalCount: z.number().optional(),
          completionCount: z.number().optional(),
          isCompleted: z.boolean().optional(),
          completedAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { id, ...data } = input;
          const result = await listQueries.updateList(id, data);
          return result[0];
        } catch (error) {
          console.error("Failed to update list:", error);
          throw error;
        }
      }),

    // 리스트 삭제
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await listQueries.deleteList(input.id);
          return { success: true };
        } catch (error) {
          console.error("Failed to delete list:", error);
          throw error;
        }
      }),
  }),

  // ============ 리스트 아이템 API ============
  listItems: router({
    // 리스트의 모든 아이템 조회
    getByListId: protectedProcedure
      .input(z.object({ listId: z.string() }))
      .query(async ({ ctx, input }) => {
        try {
          return await listItemQueries.getListItems(input.listId);
        } catch (error) {
          console.error("Failed to get list items:", error);
          return [];
        }
      }),

    // 리스트 아이템 생성
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          listId: z.string(),
          title: z.string(),
          completed: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await listItemQueries.createListItem({
            id: input.id,
            listId: input.listId,
            title: input.title,
            completed: input.completed,
          });
          return result[0];
        } catch (error) {
          console.error("Failed to create list item:", error);
          throw error;
        }
      }),

    // 리스트 아이템 업데이트
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          completed: z.boolean().optional(),
          completedAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { id, ...data } = input;
          const result = await listItemQueries.updateListItem(id, data);
          return result[0];
        } catch (error) {
          console.error("Failed to update list item:", error);
          throw error;
        }
      }),

    // 리스트 아이템 삭제
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await listItemQueries.deleteListItem(input.id);
          return { success: true };
        } catch (error) {
          console.error("Failed to delete list item:", error);
          throw error;
        }
      }),
  }),
});
