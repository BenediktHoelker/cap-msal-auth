const cds = require("@sap/cds");

// To debug this module set export DEBUG=cds-azure-ad
const DEBUG = cds.debug("cds-azure-ad");

DEBUG && DEBUG("[auth] - loading custom auth handler");

const AzureADB2CUser = class extends cds.User {
  is(role) {
    DEBUG && DEBUG("[auth] - " + role);
    return role === "any" || this._roles[role];
  }
};
/**
 * Overwriting the standard auth function and letting the custom
 * Passport strategy take the wheel
 * @param {Request} req
 * @param {Response} res
 * @param {function} next
 */
module.exports = (req, res, next) => {
  const user = req.session.account?.username;
  DEBUG && DEBUG("[auth] - user defined?" + !!user);
  if (user) {
    req.user = new AzureADB2CUser(user);
    next();
  } else {
    res.status(401).send();
  }
};
