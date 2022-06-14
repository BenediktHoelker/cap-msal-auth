const cds = require("@sap/cds");
const msal = require("@azure/msal-node");
const passport = require("passport");
const session = require("express-session");
// const { authConfig } = require("../authConfig");

var {
  msalConfig,
  REDIRECT_URI,
  POST_LOGOUT_REDIRECT_URI,
} = require("../authConfig");

// Create msal application object
const cca = new msal.ConfidentialClientApplication(msalConfig);

cds.on("bootstrap", async (app) => {
  app.get("/", (req, res) => {
    const authCodeUrlParameters = {
      scopes: ["user.read"],
      redirectUri: REDIRECT_URI,
    };

    // get url to sign user in and consent to scopes needed for application
    cca
      .getAuthCodeUrl(authCodeUrlParameters)
      .then((response) => {
        res.redirect(response);
      })
      .catch((error) => console.log(JSON.stringify(error)));
  });

  app.get("/auth/my-user", async (req, res) => {
    res.json(req?.user?._json);
  });

  app.get("/redirect", (req, res) => {
    const tokenRequest = {
      code: req.query.code,
      scopes: ["user.read"],
      redirectUri: REDIRECT_URI,
    };

    cca
      .acquireTokenByCode(tokenRequest)
      .then((response) => {
        console.log("\nResponse: \n:", response);
        res.sendStatus(200);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send(error);
      });
  });
});

module.exports = cds.server;
