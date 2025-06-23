import { eq } from "drizzle-orm";
import db from "../config/db.js";
import { verifyEmail } from "../drizzle/schema.js";

export const createVerifyEmailData = async ({ userId, token }) => {
  try {
    const [data] = await db.insert(verifyEmail).values({ userId, token });

    return data;
  } catch (err) {
    return null;
  }
};

export const deleteVerifyEmailDataByUserId = async (userId) => {
  try {
    const [data] = await db
      .delete(verifyEmail)
      .where(eq(verifyEmail.userId, userId));

    return data;
  } catch (err) {
    return null;
  }
};
