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

export const getVerifyEmailDataByUserId = async (userId) => {
  try {
    const [data] = await db
      .select()
      .from(verifyEmail)
      .where(eq(verifyEmail.userId, userId));

    return data;
  } catch (err) {
    return null;
  }
};

export const delete_and_create_verify_email_data = async ({
  userId,
  token,
}) => {
  return db.transaction(async (tx) => {
    try {
      await tx.delete(verifyEmail).where(eq(verifyEmail.userId, userId));
      await tx.insert(verifyEmail).values({ userId, token });
    } catch (err) {
      console.error("Transaction Failed");
      throw new Error(err);
    }
  });
};
