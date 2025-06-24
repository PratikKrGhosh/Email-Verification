import { and, eq, gte, sql } from "drizzle-orm";
import db from "../config/db.js";
import { usersTable, verifyEmail } from "../drizzle/schema.js";

export const getTokenDataWithUser = async ({ token, email }) => {
  try {
    const [data] = await db
      .select({
        userId: usersTable.id,
        valid: verifyEmail.valid,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.email, email),
          eq(verifyEmail.token, token),
          gte(verifyEmail.expireAt, sql`CURRENT_TIMESTAMP`)
        )
      )
      .innerJoin(verifyEmail, eq(usersTable.id, verifyEmail.userId));

    return data;
  } catch (err) {
    return null;
  }
};
