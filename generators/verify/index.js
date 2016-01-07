'use strict';
var confitGen = require('../../lib/ConfitGenerator.js');
var chalk = require('chalk');
var fs = require('fs');
var _ = require('lodash');
var vendorBowerScripts = {};

module.exports = confitGen.create({
  initializing: {
    init: function() {
      // Check if this component has an existing config.
      this.hasConfig = this.hasExistingConfig();
      this.rebuildFromConfig = !!this.options.rebuildFromConfig && this.hasConfig;
    }
  },

  prompting: function () {
    // Bail out if we just want to rebuild from the configuration file
    if (this.rebuildFromConfig) {
      return;
    }

    this.log(chalk.underline.bold.green('Verify Generator'));

    var done = this.async();

    var prompts = [
      {
        type: 'checkbox',
        name: 'jsLinter',
        message: 'JavaScript linting',
        default: this.getConfig('jsLinter') || 'eslint',
        choices: ['eslint', 'jscs', 'jshint']
      }
    ];

    this.prompt(prompts, function (props) {
      this.answers = this.generateObjFromAnswers(props);

      done();
    }.bind(this));
  },

  writeConfig: function() {
    // If we have new answers, then change the config
    if (this.answers) {
      this.setConfig(this.answers);
    }
  },

  writing: function () {
    // Copy the linting templates
    var config = this.config.getAll();
    var outputDir = config.paths.config.configDir;

    var jsLinters = this.getConfig('jsLinter');
    var gen = this;

    jsLinters.forEach(function(linter) {
      gen.fs.copy(
        gen.templatePath(linter + 'rc'),
        gen.destinationPath(outputDir + 'verify/.' + linter + 'rc')
      );
    });


    // CSS Linting should be added automagically based on the CSS compiler chosen
    this.fs.copy(
      this.templatePath(config.buildCSS.cssCompiler + 'rc'),
      this.destinationPath(outputDir + 'verify/.' + config.buildCSS.cssCompiler + 'rc')
    );

    this.buildTool.write(this);
  },

  install: function () {
    // InstallDependencies runs 'npm install' and 'bower install'
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      skipMessage: true
    });
  }
});