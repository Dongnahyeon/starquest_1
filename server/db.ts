import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * 성취 목표 관련 쿼리
 */
export const achievementQueries = {
  // 사용자의 모든 성취 목표 조회
  async getUserAchievements(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { achievements } = await import("../drizzle/schema");
    return db.select().from(achievements).where(eq(achievements.userId, userId));
  },

  // 성취 목표 생성
  async createAchievement(data: any) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { achievements } = await import("../drizzle/schema");
    await db.insert(achievements).values(data);
    return db.select().from(achievements).where(eq(achievements.id, data.id)).limit(1);
  },

  // 성취 목표 업데이트
  async updateAchievement(id: string, data: any) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { achievements } = await import("../drizzle/schema");
    await db.update(achievements).set(data).where(eq(achievements.id, id));
    return db.select().from(achievements).where(eq(achievements.id, id)).limit(1);
  },

  // 성취 목표 삭제
  async deleteAchievement(id: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { achievements } = await import("../drizzle/schema");
    return db.delete(achievements).where(eq(achievements.id, id));
  },
};

/**
 * 리스트 관련 쿼리
 */
export const listQueries = {
  // 사용자의 모든 리스트 조회
  async getUserLists(userId: number) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { lists } = await import("../drizzle/schema");
    return db.select().from(lists).where(eq(lists.userId, userId));
  },

  // 리스트 생성
  async createList(data: any) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { lists } = await import("../drizzle/schema");
    await db.insert(lists).values(data);
    return db.select().from(lists).where(eq(lists.id, data.id)).limit(1);
  },

  // 리스트 업데이트
  async updateList(id: string, data: any) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { lists } = await import("../drizzle/schema");
    await db.update(lists).set(data).where(eq(lists.id, id));
    return db.select().from(lists).where(eq(lists.id, id)).limit(1);
  },

  // 리스트 삭제
  async deleteList(id: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { lists, listItems } = await import("../drizzle/schema");
    await db.delete(listItems).where(eq(listItems.listId, id));
    return db.delete(lists).where(eq(lists.id, id));
  },
};

/**
 * 리스트 아이템 관련 쿼리
 */
export const listItemQueries = {
  // 리스트의 모든 아이템 조회
  async getListItems(listId: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { listItems } = await import("../drizzle/schema");
    return db.select().from(listItems).where(eq(listItems.listId, listId));
  },

  // 리스트 아이템 생성
  async createListItem(data: any) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { listItems } = await import("../drizzle/schema");
    await db.insert(listItems).values(data);
    return db.select().from(listItems).where(eq(listItems.id, data.id)).limit(1);
  },

  // 리스트 아이템 업데이트
  async updateListItem(id: string, data: any) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { listItems } = await import("../drizzle/schema");
    await db.update(listItems).set(data).where(eq(listItems.id, id));
    return db.select().from(listItems).where(eq(listItems.id, id)).limit(1);
  },

  // 리스트 아이템 삭제
  async deleteListItem(id: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { listItems } = await import("../drizzle/schema");
    return db.delete(listItems).where(eq(listItems.id, id));
  },
};
