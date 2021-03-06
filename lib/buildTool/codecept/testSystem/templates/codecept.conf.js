const confitConfig = require('../confit/confit.config');
const { root, relativeRoot, getServerURL } = require('../confit/helpers');
const {getHelper} = require('../confit/codecept/helper');
const relPath = relativeRoot(__dirname);

let config = {
  name: `Codecept`,
  tests: root(`${confitConfig.paths.input.srcDir}**/*.spec.system.js`),
  timeout: 20000,
  output: relPath(`${confitConfig.paths.output.reportDir + confitConfig.paths.input.systemTestDir}`),
  helpers: Object.assign(
    getHelper({
      framework: confitConfig.buildJS.framework[0],
      config: {
        url: `${getServerURL(process.env.NODE_ENV === 'production' ? confitConfig.serverProd : confitConfig.serverDev)}`
      },
      headless: process.env.NODE_ENV === 'CI'
    })
  ),
  include: {
    I: './stepsFile.js',
    app: relPath(`${confitConfig.sampleAppModuleDir + confitConfig.paths.input.systemTestDir}pages.js`)
  },
  mocha: {
    reporterOptions: {
      reportDir: root(`${confitConfig.paths.output.reportDir + confitConfig.paths.input.systemTestDir}`),
      reportTitle: `System Tests`,
      inlineAssets: true,
      overwrite: true,
      enableCode: true
    }
  },
  multiple: {},
  bootstrap: (done) => {
    // Add a delay when on CI to allow Selenium to start (not needed for non-Selenium/WebDriverIO configurations)
    console.log('Inside Codecept Bootstrap, TRAVIS:', process.env.TRAVIS);
    setTimeout(() => done(), process.env.TRAVIS === 'true' ? 5000 : 1);
  }
};


exports.config = config;

