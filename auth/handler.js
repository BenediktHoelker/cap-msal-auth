// Import Libraries
const cds = require("@sap/cds");
const chalk = require("chalk");
const xsenv = require("@sap/xsenv");
const passport = require("passport");
const BearerStrategy = require("passport-azure-ad").BearerStrategy;

// To debug this module set export DEBUG=cds-azure-ad
const DEBUG = cds.debug("cds-azure-ad");

// Read configuration from VCAP_SERVICES environment variable
xsenv.loadEnv();
var services = {};
try {
  services = xsenv.getServices({ azuread: { tag: "azure-ad" } });
} catch (error) {
  console.error(chalk.red("[cds-azure-ad] - " + error.message));
  console.error(
    "[cds-azure-ad] - maintain default-env.json or provide the environment variable VCAP_SERVICES"
  );
  throw new Error(error.message);
}

const AzureADB2CUser = class extends cds.User {
  is(role) {
    DEBUG && DEBUG("Requested role: " + role);
    return role === "any" || this._roles[role];
  }
};

module.exports = (req, res, next) => {
  var {
    msalConfig,
    REDIRECT_URI,
    POST_LOGOUT_REDIRECT_URI,
  } = require("../authConfig");
  passport.initialize();
  passport.use(
    new OIDCStrategy(
      {
        ...msalConfig.auth,
        clientID: msalConfig.auth.clientId,
        issuer: "https://login.microsoftonline.com",
        identityMetadata:
          "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
      },
      function (token, done) {
        DEBUG && DEBUG("verifying the user");
        DEBUG && DEBUG(token, "was the token retreived");
        var user = token.oid;
        return done(null, user, token);
      }
    )
  );
  passport.authenticate("oidc", function (err, user, token) {
    var capUser = {
      id: "",
      _roles: [],
    };
    if (err) {
      DEBUG && DEBUG("err");
      DEBUG && DEBUG(err);
      return next(err);
    }
    if (!user) {
      DEBUG && DEBUG("No user");
      return next(Error(token));
    }
    DEBUG && DEBUG("token");
    DEBUG && DEBUG(token);
    capUser = {
      id: user,
      _roles: ["authenticated-user"],
    };
    if (token.extension_b2cgroups) {
      capUser._roles.push(...token.extension_b2cgroups.split(","));
    }
    req.user = new AzureADB2CUser(capUser);
    next();
  })(req, res, next);
};
