import { eq } from "drizzle-orm";
import db from "../config/db.js";
import { usersTable } from "../drizzle/schema.js";

export const createUser = async ({ name, userName, email, password }) => {
  const [user] = await db
    .insert(usersTable)
    .values({ name, userName, email, password });
  return user;
};

export const findUserByUsername = async (userName) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userName, userName));
  return user;
};

export const getUserById = async (id) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));
  return user;
};

export const getUserByEmail = async (email) => {
  try {
    const [data] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return data;
  } catch (err) {
    return null;
  }
};

export const updateVerifyStatus = async (id) => {
  try {
    const [data] = await db
      .update(usersTable)
      .set({ isVerified: true })
      .where(eq(usersTable.id, id));
    return data;
  } catch (err) {
    return null;
  }
};
