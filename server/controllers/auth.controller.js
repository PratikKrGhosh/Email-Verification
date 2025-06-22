import { loginSchema, signupSchema } from "../validator/form.validator.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { createUser, findUserByUsername } from "../services/user.services.js";
import { validate_login_with_cookies } from "../utils/cookie.js";
import { createNewSession } from "../services/session.service.js";

export const getSignupPage = (req, res) => {
  try {
    return res.status(200).render("signup", { errors: req.flash("errors") });
  } catch (err) {
    return res.status(404).render("pageNotFound");
  }
};

export const getLoginPage = (req, res) => {
  try {
    return res.status(200).render("login", { errors: req.flash("errors") });
  } catch (err) {
    return res.status(404).render("pageNotFound");
  }
};

export const signup = async (req, res) => {
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

export const logout = (req, res) => {
  try {
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};
