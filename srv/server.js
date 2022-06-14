/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

require("dotenv").config();

var express = require("express");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");

const cds = require("@sap/cds");

cds.on("bootstrap", async (app) => {
  app.use(logger("dev"));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  // app.use(express.static(path.join(__dirname, "public")));

  /**
   * Using express-session middleware for persistent user session. Be sure to
   * familiarize yourself with available options. Visit: https://www.npmjs.com/package/express-session
   */
  app.use(
    session({
      secret: process.env.EXPRESS_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // set this to true on production
      },
    })
  );

  // app.use("/", indexRouter);
  app.use("/users", usersRouter);
  app.use("/auth", authRouter);

  app.use("/", (req, res, next) => {
    if (req.session.isAuthenticated || req.path === "/auth/signin") {
      next();
    } else {
      res.redirect("/auth/signin");
    }
  });
});

module.exports = cds.server;
