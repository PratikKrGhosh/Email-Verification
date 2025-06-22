import { eq } from "drizzle-orm";
import db from "../config/db.js";
import { sessionTable } from "../drizzle/schema.js";

export const createNewSession = async ({ userId, userAgent, ip }) => {
  try {
    const [data] = await db
      .insert(sessionTable)
      .values({ userId, userAgent, ip })
      .$returningId();
    return data;
  } catch (err) {
    return null;
  }
};

export const getSessionById = async (id) => {
  try {
    const [data] = await db
      .select()
      .from(sessionTable)
      .where(eq(sessionTable.id, id));
    return data;
  } catch (err) {
    return null;
  }
};

export const deleteSession = async (id) => {
  try {
    const [data] = await db.delete(sessionTable).where(eq(sessionTable.id, id));
    return data;
  } catch (err) {
    return null;
  }
};
