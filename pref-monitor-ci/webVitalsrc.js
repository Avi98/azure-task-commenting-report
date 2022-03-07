const option = {
  buildPath: "./build",
  ci: {},
  headless: true,
  puppeteer: {
    urls: [
      "/dashboard",
      "sales-pipeline/accounts",
      // "/my-policies",
      // "/leads/active",
      // "/contacts",
      // "/accounts",
      // "/tasks",
      // "/partners",
      // "/my-team",
    ],
    loginCredentials: {
      userName: "sujan.maka@renegadeinsurance.com",
      password: "Hello@Sage13",
    },
    loginSelector: {
      emailFieldSelector: "#email",
      passwordFieldSelector: "#password",
    },
    // puppetterScriptPath: "./lighthouseCli/puppeterScripts.js",
  },
  env: "this is only for testing",
  maxNumberOfRuns: 3,
  //path to puppeteerScript
  //@TODO: make server store reports for diff envs such as dev, qa, and prod. clear reports.
  clearReports: true,
};
module.exports = { option: option };
//# sourceMappingURL=webVitalsrc.js.map
