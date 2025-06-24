import {
  emailVerifySchema,
  loginSchema,
  signupSchema,
} from "../validator/form.validator.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import {
  createUser,
  findUserByUsername,
  getUserById,
  updateVerifyStatus,
} from "../services/user.services.js";
import { validate_login_with_cookies } from "../utils/cookie.js";
import {
  createNewSession,
  deleteSession,
  getSessionById,
  getSessionByUserId,
} from "../services/session.service.js";
import { generateEmailVerifyToken } from "../utils/token.generate.js";
import {
  delete_and_create_verify_email_data,
  deleteVerifyEmailDataByUserId,
} from "../services/verifyEmail.service.js";
import { generateEmailVerifyURL } from "../utils/emailVerifyLink.js";
import { sendEmail } from "../libs/nodemailer.js";
import { getTokenDataWithUser } from "../services/join.service.js";

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
    return res
      .status(200)
      .render("verifyEmail", { errors: req.flash("errors") });
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
  if (!req.user) return res.redirect("/login");
  try {
    const { data, error } = emailVerifySchema.safeParse(req.query);

    if (error) {
      req.flash("errors", error.errors[0].message);
      return res.redirect("/verify/email");
    }

    const { token, email } = data;

    const tokenDataWithUser = await getTokenDataWithUser({
      token,
      email,
    });

    if (!tokenDataWithUser || !tokenDataWithUser.valid)
      return res.send("Invalid Token");

    await updateVerifyStatus(tokenDataWithUser.userId);
    await deleteVerifyEmailDataByUserId(tokenDataWithUser.userId);

    const userData = await getUserById(tokenDataWithUser.userId);
    const sessionData = await getSessionByUserId(userData.id);
    await validate_login_with_cookies(res, { userData, sessionData });

    return res.redirect("/");
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};

export const sendMail = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  try {
    const token = generateEmailVerifyToken();

    const { id: userId } = await findUserByUsername(req.user.userName);

    await delete_and_create_verify_email_data({ userId, token });

    const generatedUri = generateEmailVerifyURL({
      token,
      email: req.user.email,
    });

    await sendEmail({
      to: req.user.email,
      subject: "Verify your Email",
      html: `
      <h3>Token: </h3>${token} <br>
      <a href="${generatedUri}">Click to Verify</a>`,
    });

    return res.redirect("/verify/email");
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};
