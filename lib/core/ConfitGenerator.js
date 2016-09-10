'use strict';
const Base = require('yeoman-generator').Base;
const _ = require('lodash');
const chalk = require('chalk');

const MAX_EVENT_LISTENERS = 20;


// Extend the Base prototype
_.extend(Base.prototype, require('./StorageAdapter.js'));
_.extend(Base.prototype, require('./buildToolUtils.js'));
_.extend(Base.prototype, require('./fileUtils.js'));
_.extend(Base.prototype, require('./npm.js'));
_.extend(Base.prototype, require('./markdownUtils.js'));
_.extend(Base.prototype, require('./resources.js'));
_.extend(Base.prototype, {ts: require('./TypeScriptUtils.js')});
_.extend(Base.prototype, require('./utils.js'));

let hasGreeted = process.argv.indexOf('--no-logo') !== -1 || process.argv.indexOf('--help') !== -1;

module.exports = {

  create: function(extraConfig) {
    if (!hasGreeted) {
      hasGreeted = confitGreet();
    }

    let confitConfig = _.merge(
      {
        constructor: function() {
          Base.apply(this, arguments);
          // Define options
          this.option('skip-run', {desc: 'Do not run the project after installation', defaults: false});
        },
        initializing: {
          preInit: function() {
            // Avoid http://stackoverflow.com/questions/9768444/possible-eventemitter-memory-leak-detected
            this.env.sharedFs.setMaxListeners(MAX_EVENT_LISTENERS);

            // Extend the object *instance* with the methods in common.js
            require('./common.js').apply(this);

            // Initialise the project-type specific resources
            this.projectType = this.getGlobalConfig().app.projectType;
            let projectTypeChanged = !this.isCurrentProjectType(this.projectType);
            //console.log('projectTypeChanged', projectTypeChanged, this.projectType);

            // These functions are guarded to try to prevent expensive re-initialisation.
            this.initResources(this.projectType, projectTypeChanged);
            this.getBuildProfiles(this.projectType);
            this.updateBuildTool();
          }
        }
      },
      extraConfig
    );

    return Base.extend(confitConfig);
  }
};


function confitGreet() {
  // Great the user
  let generatorVersion = require('fs-extra').readJsonSync(__dirname + '/../../package.json').version;

  let welcome =
    '\n' +
    chalk.cyan.bold('\n                                                                      ') + chalk.white.bold('╓╗╗') +
    chalk.cyan.bold('\n                                                                 ') + chalk.white.bold('╗╣╣╣╣╣╣╣╗') +
    chalk.cyan.bold('\n                                                                ') + chalk.white.bold('╠╣╣╣╣╣╣╣╣╣') + chalk.yellow.bold('╣╗╗╗') +
    chalk.cyan.bold('\n                                                                ') + chalk.white.bold('╚╣╣╣╣╣╣╣╣') + chalk.yellow.bold('╣╣╣╣╝') +
    chalk.cyan.bold('\n ╓╣╣╣╣╣╣╣╗  ╔╣╣╣╣╣╣╣  ╞╣╣╣  ╣╣╣  ╣╣╣╣╣╣╣ ╣╣╣╣ ╣╣╣╣╣╣╣╣╣ ') + chalk.white.bold('╣╣╗      ╙╣╣╣╣╣╣╣╣╜') +
    chalk.cyan.bold('\n ╣╣╣╣ ╠╣╣╣  ╣╣╣╣ ╣╣╣╣ ╞╣╣╣╣ ╣╣╣  ╣╣╣╣    ╣╣╣╣   ╠╣╣╣   ') + chalk.white.bold('╣╣╣╣╣╣╗╗╗╗╣╣╣╣╣╣╣╣╣╣╗ ') +
    chalk.cyan.bold('\n ╣╣╣╣ ╠╣╣╣  ╣╣╣╣ ╣╣╣╣ ╞╣╣╣╣╗╣╣╣  ╣╣╣╣╗╗╗ ╣╣╣╣   ╠╣╣╣   ') + chalk.white.bold('╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╕') +
    chalk.cyan.bold('\n ╣╣╣╣       ╣╣╣╣ ╣╣╣╣ ╞╣╣╣╣╣╣╣╣  ╣╣╣╣╣╣╣ ╣╣╣╣   ╠╣╣╣   ') + chalk.white.bold('╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣') +
    chalk.cyan.bold('\n ╣╣╣╣ ╠╣╣╣  ╣╣╣╣ ╣╣╣╣ ╞╣╣╣╚╣╣╣╣  ╣╣╣╣    ╣╣╣╣   ╠╣╣╣   ') + chalk.white.bold('└╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╝') +
    chalk.cyan.bold('\n ╣╣╣╣ ╠╣╣╣  ╣╣╣╣ ╣╣╣╣ ╞╣╣╣ ╣╣╣╣  ╣╣╣╣    ╣╣╣╣   ╠╣╣╣     ') + chalk.white.bold('╚╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╣╝') +
    chalk.cyan.bold('\n └╝╣╣╣╣╣╝   └╝╣╣╣╣╣╝  ╞╣╣╣ ╘╣╣╣  ╣╣╣╣    ╣╣╣╣   ╠╣╣╣        ') + chalk.white.bold('╙╝╣╣╣╣╣╣╣╣╣╣╣╝╙ ') +
    chalk.white.bold('\n                                                                v' + generatorVersion) +
    '\n';

  console.log(welcome);
  return true;
}