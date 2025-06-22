import dotenv from "dotenv";
dotenv.config();

const config = {
  dev: {
    db: process.env.DB_URI,
    port: process.env.PORT || 3000,
    key: process.env.JWT_KEY || "abcde12345",
    log: "bug",
  },
  test: {
    db: process.env.DB_URI,
    port: process.env.PORT || 3000,
    key: process.env.JWT_KEY || "abcde12345",
    log: "info",
  },
  production: {
    db: process.env.DB_URI,
    port: process.env.PORT || 3000,
    key: process.env.JWT_KEY || "abcde12345",
    log: "error",
  },
};

const stage = process.env.STAGE || "dev";
export default config[stage];
