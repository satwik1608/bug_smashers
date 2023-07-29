const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const Interviewer = require("./models/interviewer");

const autoCatch = require("./lib/auto-catch");
const jwtSecret = process.env.JWT_SECRET || "mark it zero";
const adminPassword = process.env.ADMIN_PASSWORD || "iamthewalrus";
const jwtOpts = { algorithm: "HS256", expiresIn: "5d" };

// passport.use(adminStrategy());
// const authenticate = passport.authenticate("local", {
//   session: false,
// });

module.exports = {
  //   authenticate,
  login: autoCatch(login),
  ensureUser: autoCatch(ensureUser),
};

async function login(req, res, next) {
  const isAdmin =
    req.body.email === "admin" && req.body.password === adminPassword;

  // make token
  const data = await Interviewer.get(req.body.email);
  if (!data && !isAdmin) {
    throw Object.assign(new Error("Wrong password"), { statusCode: 401 });
  }
  const token = await sign({
    email: req.body.email,
  });

  res.cookie("jwt", token, { httpOnly: false });
  res.json({ success: true, token: token });
}
async function ensureUser(req, res, next) {
  const jwtString = req.headers["x-auth-token"] || req.cookies.jwt;

  const payload = await verify(jwtString);

  if (payload.email) {
    req.user = payload;
    if (payload.email === "admin") req.isAdmin = true;
    return next();
  }
  const err = new Error("Unauthorized");
  err.statusCode = 401;
  next(err);
}

async function sign(payload) {
  const token = await jwt.sign(payload, jwtSecret, jwtOpts);
  return token;
}

async function verify(jwtString) {
  console.log(jwtString);
  jwtString = jwtString.replace(/^Bearer /i, "");

  try {
    const payload = await jwt.verify(jwtString, jwtSecret);
    return payload;
  } catch (ex) {
    err.StatusCode = 401;
    throw err;
  }
}
// function adminStrategy() {
//   console.log("fds");
//   return new Strategy(async function (email, password, cb) {
//     console.log("fdsgds");
//     const isAdmin = email === "admin" && password === adminPassword;
//     if (isAdmin) return cb(null, { email: "admin" }); // potential bug to be resolved

//     try {
//       const data = await Interviewer.get(email);
//       console.log(data, "data");
//       // console.log("wowo", user);
//       if (!data) return cb(null, false);

//       if (data.password === password) {
//         return cb(null, { email: data.email });
//       }
//     } catch (err) {}

//     cb(null, false);
//   });
// }
