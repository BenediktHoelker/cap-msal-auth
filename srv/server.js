const cds = require("@sap/cds");
const implementation = require("./serverImplementation.js");

cds.on("bootstrap", async (app) => await implementation(app));

module.exports = cds.server;
