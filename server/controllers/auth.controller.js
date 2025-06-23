import { loginSchema, signupSchema } from "../validator/form.validator.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { createUser, findUserByUsername } from "../services/user.services.js";
import { validate_login_with_cookies } from "../utils/cookie.js";
import {
  createNewSession,
  deleteSession,
  getSessionById,
} from "../services/session.service.js";
import { generateEmailVerifyToken } from "../utils/token.generate.js";
import {
  createVerifyEmailData,
  deleteVerifyEmailDataByUserId,
} from "../services/verifyEmail.service.js";
import { generateEmailVerifyURL } from "../services/emailVerifyLink.js";

export const getSignupPage = (req, res) => {
  try {
    if (req.user) return res.redirect("/");
    return res.status(200).render("signup", { errors: req.flash("errors") });
  } catch (err) {
    return res.status(404).render("pageNotFound");
  }
};

export const getLoginPage = (req, res) => {
  try {
    if (req.user) return res.redirect("/");
    return res.status(200).render("login", { errors: req.flash("errors") });
  } catch (err) {
    return res.status(404).render("pageNotFound");
  }
};

export const getVerifyEmailPage = (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    return res.status(200).render("verifyEmail");
  } catch (err) {
    return res.status(404).render("pageNotFound");
  }
};

export const signup = async (req, res) => {
  if (req.user) return res.redirect("/");
  try {
    const { data, error } = signupSchema.safeParse(req.body);

    if (error) {
      req.flash("errors", error.errors[0].message);
      return res.status(400).redirect("/signup");
    }

    const { name, userName, email, password } = data;
    const hashedPassword = await hashPassword(password);

    const newUser = await createUser({
      name,
      userName,
      email,
      password: hashedPassword,
    });

    if (!newUser) {
      req.flash("errors", "User not created");
      return res.status(400).redirect("/signup");
    }

    return res.status(201).redirect("/login");
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};

export const login = async (req, res) => {
  if (req.user) return res.redirect("/");
  try {
    const { data, error } = loginSchema.safeParse(req.body);

    if (error) {
      req.flash("errors", error.errors[0].message);
      return res.status(400).redirect("/login");
    }

    const { userName, password } = data;

    const userData = await findUserByUsername(userName);

    if (!userData) {
      req.flash("errors", "Wrong User Name or Password");
      return res.status(400).redirect("/login");
    }

    const checkPassword = await verifyPassword({
      hashedPassword: userData.password,
      password,
    });

    if (!checkPassword) {
      req.flash("errors", "Wrong User Name or Password");
      return res.status(400).redirect("/login");
    }

    const sessionData = await createNewSession({
      userId: userData.id,
      userAgent: req.headers["user-agent"],
      ip: req.clientIp,
    });

    await validate_login_with_cookies(res, { userData, sessionData });

    return res.status(200).redirect("/");
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};

export const logout = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const checkSession = await getSessionById(req.user.sessionId);
    if (!checkSession || !checkSession.valid) return res.redirect("/login");

    await deleteSession(req.user.sessionId);

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.status(200).redirect("/login");
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};

export const verifyEmail = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};

export const sendMail = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");
    const token = generateEmailVerifyToken();

    const { id: userId } = await findUserByUsername(req.user.userName);

    await deleteVerifyEmailDataByUserId(userId);
    await createVerifyEmailData({ userId, token });

    const generatedUri = generateEmailVerifyURL({
      token,
      email: req.user.email,
    });

    return res.redirect("/verify/email");
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};
