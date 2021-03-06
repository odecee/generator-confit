'use strict';

const assert = require('assert');
const childProc = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob-fs')({builtins: false});

const FIXTURE_DIR = path.join(__dirname, '/fixtures/');

/**
 * Runs the specified command
 * @param {string} cmd   Command to run
 * @return {Process}     Process instance
 */
function runCommand(cmd) {
  // If there is an error, an exception will be thrown
  return childProc.execSync(cmd, {
    // stdio: 'inherit', // Don't send output to the parent, return it to the callee instead (so that tests can check the output)
    cwd: process.env.TEST_DIR,
  });
}


module.exports = function(confitConfig, unitTestPath, commandToRun, hasCodeCoverage) {
  describe(commandToRun, () => {
    it(`should pass the unit tests in the sampleApp code ${hasCodeCoverage ? 'WITH' : 'WITHOUT'} code coverage`, function() {
      let reportDir = path.join(process.env.TEST_DIR, confitConfig.paths.output.reportDir);
      let relativeReportDir = reportDir.replace(process.cwd() + '/', '');
      fs.removeSync(reportDir); // Remove the directory

      assert.doesNotThrow(() => runCommand(commandToRun));

      if (hasCodeCoverage) {
        assert(fs.existsSync(reportDir + 'coverage/') === true, 'Coverage dir exists');
        assert(glob.readdirSync(relativeReportDir + 'coverage/**/lcov.info').length > 0, 'lcov.info exists'); // Could be in sub directory
      } else {
        assert(fs.existsSync(reportDir + 'coverage/') === false, 'Coverage directory does NOT exist');
      }
    });


    it('should have 100% branch coverage for the test files', () => {
      // We get a table of results like this, which we need to filter to find 'File ' and 'All files '
      // ----------------|----------|----------|----------|----------|----------------|
      // File            |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
      // ----------------|----------|----------|----------|----------|----------------|
      // demoModule/    |    80.95 |      100 |    33.33 |    76.47 |                |
      // app.js        |    78.57 |      100 |       25 |    72.73 |       15,26,27 |
      // demoModule.js |    85.71 |      100 |       50 |    83.33 |              9 |
      // ----------------|----------|----------|----------|----------|----------------|
      // All files       |    80.95 |      100 |    33.33 |    76.47 |                |
      // ----------------|----------|----------|----------|----------|----------------|

      // This format is now appearing with nyc:
      // ----------|----------|----------|----------|----------|----------------|
      // File      |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
      // ----------|----------|----------|----------|----------|----------------|
      // All files |       80 |      100 |       50 |      100 |                |
      //  index.js |       80 |      100 |       50 |      100 |                |
      // ----------|----------|----------|----------|----------|----------------|


      let result = runCommand(commandToRun).toString();

      console.log(result);
      let results = result.split('\n');
      let fileLine = results.findIndex((item) => item.indexOf('File ') === 0);
      let allFilesLine = results.findIndex((item) => item.indexOf('All files ') === 0);
      let filesCovered = Math.abs(allFilesLine - fileLine);

      // console.log(results.length, fileLine, allFilesLine, filesCovered);

      if (hasCodeCoverage) {
        assert(filesCovered > 1, 'Files were covered');

        let summaryLine = results.filter((item) => item.indexOf('All files') === 0);

        assert(summaryLine.length === 1, 'Summary line array contains 1 item');

        let summaryParts = summaryLine[0].split('|');

        assert(summaryParts[0].indexOf('All files') === 0);
        assert(parseFloat(summaryParts[2], 10) >= 50, 'Branches have at-least 50% coverage');
      } else {
        assert(filesCovered === 0, 'Files were not covered');
      }
    });


    describe('with a unit test that finds a failure', function() {
      let jsFixtureFile = 'unitTest-fail.js'; // If this file is named 'unitTest-fail.spec.js', Mocha will try to run it as a unit/integration test!
      let destFixtureFile = unitTestPath + jsFixtureFile;

      before(function() {
        // Need to create a JS AND TypeScript version of this spec
        fs.copySync(FIXTURE_DIR + jsFixtureFile, destFixtureFile.replace('.js', '.spec.js'));
        fs.copySync(FIXTURE_DIR + jsFixtureFile, destFixtureFile.replace('.js', '.spec.ts'));
      });

      after(function() {
        fs.removeSync(destFixtureFile.replace('.js', '.spec.js'));
        fs.removeSync(destFixtureFile.replace('.js', '.spec.ts'));
      });


      it('should throw an error when a test has failed', function() {
        assert.throws(() => runCommand(commandToRun), Error);
      });
    });
  });
};
