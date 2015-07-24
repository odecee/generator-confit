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

      // Must only check for bower components if bower.json exists.
      var bowerJSON = this.destinationPath('bower.json');

      // Check the real file system for bower.json, not the mem-fs version.
      if (fs.existsSync(bowerJSON)) {
        // Produce this.answers.vendorScripts array from this.answers.vendorBowerJS
        // Read vendorBowerJS package name, find package.json, main prop, only grab *.js
        _.forEach(require('main-bower-files')('**/*.js'), function(script) {
          var paths = script.split('/');
          var packageName = paths[paths.indexOf('bower_components') + 1];

          vendorBowerScripts[packageName] = (vendorBowerScripts[packageName] || []).concat([script]);
        });
      }
    }
  },

  prompting: function () {
    // Bail out if we just want to rebuild from the configuration file
    if (this.rebuildFromConfig) {
      return;
    }

    this.log(chalk.underline.bold.green('Build JS Generator'));

    var done = this.async();
    var defaultVendorBowerScripts = this.getConfig('vendorBowerScripts') || [];
    var self = this;

    var prompts = [
      {
        type: 'list',
        name: 'outputFormat',
        message: 'Target output language',
        choices: [
          'ES3',
          'ES5',
          'ES6'
        ],
        default: this.getConfig('jsOutputFormat') || 'ES5'
      },
      {
        type: 'confirm',
        name: 'codeSplitting',
        message: 'Do you wish to use code-splitting (lazy-load modules)?' + chalk.dim.green('\nNote: Code-splitting is not necessary for HTTP2 applications.'),
        default: this.getConfig('codeSplitting') || false
      },
      {
        type: 'checkbox',
        name: 'bundles',
        message: 'Files per compilation-bundle (edit in confit.json):',
        choices: function() {
          var items = self.getConfig('bundle') || [['app.js']];
          var cbItems = items.map(function(bundle, index) {
            return {
              name: (index + 1) + ': ' + bundle.join(', '),
              disabled: '(read-only)',
              checked: true
            };
          });
          cbItems.unshift('Bundles');   // Stick this onto the front of the list to allow the spacebar to be pressed without causing an exception
          return cbItems;
        }
      },
      {
        type: 'checkbox',
        name: 'framework',
        message: 'JavaScript Framework',
        choices: [
          'AngularJS 1.x',
          'AngularJS 2.x',
          'React 0.x'
        ],
        default: this.getConfig('framework') || []
      },
      {
        type: 'checkbox',
        name: 'vendorBowerScripts',
        message: 'Select Bower dependencies that have JS',
        default: defaultVendorBowerScripts,
        choices: function() {
          return _.map(vendorBowerScripts || [], function(scripts, packageName) {
            var packageValue = {
              name: packageName,
              scripts: scripts
            };
            return {name: packageName, value: packageValue, checked: !!defaultVendorBowerScripts[packageName]};
          });
        },
        when: function() {
          return _.keys(vendorBowerScripts).length > 0;
        }
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
      // Remove the "bundles" key, as it is read-only
      delete this.answers.bundles;

      this.setConfig(this.answers);
    }
  },

  writing: function () {
    // Defer the actual writing to the build-tool-choice the user has made (currently), this is Grunt.
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
