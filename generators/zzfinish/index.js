'use strict';
var confitGen = require('../../lib/ConfitGenerator.js');
var chalk = require('chalk');
var fs = require('fs');
var ejs = require('ejs');

module.exports = confitGen.create({
  writing: function() {
    this.buildTool.write(this);

    var config = this.getGlobalConfig();
    var paths = config.paths;

    // Global task-wiring, independent of any particular tool (although there is some knowledge that the child-tasks MUST exist, and how they should be run together).
    this.defineNpmTask('start', ['npm run dev'], 'Alias for `npm run dev` task');
    this.defineNpmTask('dev', ['clean:dev', 'verify', '--parallel verify:watch build:dev serve:dev'], 'Run project in development mode. Verifies code, creates dev build into **' + paths.output.devDir + '** folder, serves on **' + config.serverDev.protocol + '://' + config.serverDev.hostname + ':' + config.serverDev.port + '**, watches for changes and updates the browser automatically');
    this.defineNpmTask('build', ['clean:prod', 'build:prod'], 'Generate production build into **' + paths.output.prodDir + '** folder');
    this.defineNpmTask('build:serve', ['build', 'serve:prod'], 'Generate production build and serve on **' + config.serverProd.protocol + '://' + config.serverProd.hostname + ':' + config.serverProd.port + '**');

    // Low-level tasks
    this.defineNpmTask('clean:dev', ['rm -rf ' + paths.output.devDir]);
    this.defineNpmTask('clean:prod', ['rm -rf ' + paths.output.prodDir]);

    generateReadmeFile.apply(this);
  },

  install: function() {
    // InstallDependencies runs 'npm install' and 'bower install'
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      skipMessage: true
    });
  }
});


function generateReadmeFile() {
  // Generate a README, or update the existing README.md
  var readmeFile = this.destinationPath('README.md');
  var packageJSON = this.readPackageJson();
  var templateData = {};

  //console.log(packageJSON.config.readme);

  // We have to put some formatting into our data, to allow the README.md file to be updated continuously :(
  // All due to GitHub's handling of HTML comments in markdown.
  templateData.name = '# ' + packageJSON.name;
  templateData.description = '> ' + packageJSON.name;
  templateData.taskDefinition = generateDevTasks(packageJSON.config.readme).join('\n');

  // Remove the config.readme from the packageJSON, before writing it back to disk
  delete packageJSON.config.readme;
  this.writePackageJson(packageJSON);

  // Now apply template
  if (this.fs.exists(readmeFile)) {
    // We need to read & write the existing file, replacing the actual values with the template values, ready to re-insert the template values
    var existingData = this.fs.read(readmeFile);
    existingData = existingData.replace(/<!--\[([\w.:\[\]']+)\]-->\n(.*?\n)+?<!--\[\]-->/g, '<!--[$1]-->\n<%= $1 %>\n<!--[]-->\n');
    // Use EJS directly because we are changing the existing file (and Yeoman is getting confused).
    //fs.writeFileSync(readmeFile, ejs.render(existingData, packageJSON));
    this.fs.write(readmeFile, ejs.render(existingData, templateData));
  } else {
    // Use the baseline template
    this.fs.copyTpl(this.templatePath('_readme.md'), this.destinationPath('README.md'), templateData);
  }
}


// Function to generate the list of tasks in Markdown format
function generateDevTasks(parentKey) {
  var tasks = Object.keys(parentKey).sort();

  tasks = tasks.filter(function(task) {
    return parentKey[task] !== '';   // Only process non-blank tasks
  });

  return tasks.map(function(task) {
    return '- `npm run ' + task + '`: ' + parentKey[task];
  });
}