const passport = require("passport");
const BearerStrategy = require("passport-azure-ad").BearerStrategy;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const options = {
  identityMetadata:
    "https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/B2C_1_SUSI/v2.0/.well-known/openid-configuration/",
  clientID: "e760cab2-b9a1-4c0d-86fb-ff7084abd902",
  policyName: "B2C_1_SUSI",
  isB2C: true,
  validateIssuer: true,
  loggingLevel: "warn",
  loggingNoPII: true,
  passReqToCallback: false,
};

const bearerStrategy = new BearerStrategy(options, function (token, done) {
  log.info("verifying the user");
  log.info(token, "was the token retreived");

  findById(token.oid, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      // "Auto-registration"
      log.info(
        "User was added automatically as they were new. Their oid is: ",
        token.oid
      );
      users.push(token);
      owner = token.oid;
      return done(null, token);
    }
    owner = token.oid;
    return done(null, user, token);
  });
});

passport.use(bearerStrategy);
