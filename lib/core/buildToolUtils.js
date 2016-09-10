'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const resourceUtils = require('./resources');

let isInitialized = false;  // Get's set to true once getBuildProfiles(projectType) is called
let buildProfileProjectType;
let buildProfiles = [];       // This is used by the UI, for the user to select from a list of profiles
let buildProfilesMap = {};    // We use the map to find the buildTool for the current generator
let buildToolResources = {};    // a cache of buildtool resources

let buildToolCache = {};              // A cache of build tools e.g. NPM_release, Webpack_serverProd. Only 1 buildTool instance will be stored even though there are many generators per buildTool
let buildToolNameCache = new Set();   // A cache of the buildTool names e.g. NPM, webpack, grunt

let globallyInstalledPackages = [];   // Keep track of the globally installed packages, so we can use this info in documentation

module.exports = {
  getBuildProfiles,
  isBuildToolSupported,
  isCurrentProjectType,
  registerBuildToolCommands,
  getToolTemplatePath,
  getGloballyInstalledPackages,
  updateBuildTool,
  writeBuildToolConfig,
  writeGeneratorConfig
};

/**
 * @ngdoc directive
 * @name MyService
 * @module mymodule
 *
 * @description
 * It's all mine!
 */


//---------------------------------- STATIC CODE ---------------------------------------
/**
 *
 * Finds and reads the '*.profile.json' files in the 'projectType' folder, using the projectType of the application.
 * and returns an array of their contents.
 *
 * This approach allows future Confit plugin-writers to define their own build profiles.
 * Do this ONCE for ALL generator instances
 *
 * @param {string} projectType   The project type (browser, node)
 * @returns {Object[]}            An array of buildProfiles available for the selected project type
 */
function getBuildProfiles(projectType) {
  if (!projectType) {
    return;
  }

  // Only regenerate the build profiles if the project type changes, or if they haven't been initialized before
  if (buildProfileProjectType !== projectType || !isInitialized) {
    buildProfiles = [];
    buildProfilesMap = {};
    buildToolResources = {};
    buildToolCache = {};
    buildToolNameCache = new Set();

    let profilePath = path.join(__dirname, '/../projectType/', projectType);
    // Get a list of files that end in 'profile.json' from the buildTool directory
    let files = fs.readdirSync(profilePath).filter(file => fs.statSync(path.join(profilePath, file)).isFile() && file.match(/\.profile\.json$/) !== null);

    files.forEach(file => {
      let data = require(path.join(profilePath, file));

      buildProfiles.push(data);
      buildProfilesMap[data.name] = data;
    });
    buildProfileProjectType = projectType;
  }
  isInitialized = true;

  return buildProfiles;
}

/**
 * Re-sets the build tool for the current generator. For example,
 * if the current generator is 'buildCSS', and the build profile has this mapping: 'buildCSS': 'toolName',
 * then this function will `require('buildTool/toolName/buildCSS/buildCSS.js')()`
 *
 * If the toolName is blank (which it may be for certain implementations), it returns a no-op buildTool.
 *
 * @returns {Object} - Build tool object with a write() method
 * @this generator
 */
function updateBuildTool() {
  if (!isInitialized) {
    return;
  }

  let name = this.name;
  let buildTools = (buildProfilesMap[this.getGlobalConfig().app.buildProfile] || {}).toolMap || {};
  let buildToolName = buildTools[name];

  // Skeleton buildTool (Abstract base class)
  let buildTool = {
    configure: function() {},
    finalizeAll: finalizeAll,
    getResources: function() {
      return buildToolResources[buildToolName];
    },
    isNull: false,
    name: buildToolName,
    write: function() {}
  };

  if (!buildToolName) {
    buildTool.isNull = true;
  } else if (!buildToolResources[buildToolName]) {
    // Cache the buildTool resources if the buildTool exists
    buildToolResources[buildToolName] = resourceUtils.readYaml(__dirname + '/../buildTool/' + buildToolName + '/' + buildToolName + 'Resources.yml');
  }

  try {
    //console.log('buildTool', buildToolName, name);
    buildTool = _.merge(buildTool, require('../buildTool/' + buildToolName + '/' + name + '/' + name + '.js')());
  } catch(e) {
    //console.log(e);
  }

  buildToolNameCache.add(buildToolName);
  buildToolCache[buildToolName] = buildTool;    // This will overwrite existing buildTools, but that's ok for what we are using it for.
  this.buildTool = buildTool;
  //console.log(name, this.buildTool);
}


/**
 * Called by the App generator after buildTool.write() has been called
 *
 * @returns {undefined}
 * @this generator
 */
function finalizeAll() {
  let oldName = this.name;
  let oldBuildTool = this.buildTool;

  this.name = 'zzzfinalize';    // We have to change the generator name temporarily, for certain functions to work s expected

  buildToolNameCache.forEach(buildToolName => {
    try {
      let finalize = require('../buildTool/' + buildToolName + '/zzzfinalize');

      this.buildTool = buildToolCache[buildToolName];
      finalize.call(this);
    } catch(e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        console.log(e);
      }
    }
  });
  this.name = oldName;
  this.buildTool = oldBuildTool;
}


/**
 *
 * @param {string} [pathSuffix]   An optional sub-directory underneath the 'templates/' directory
 * @returns {string}    Path to the build tool templates/[pathSuffix] directory
 * @this generator
 */
function getToolTemplatePath(pathSuffix) {
  return path.join(__dirname, '/../buildTool/' + this.buildTool.name + '/' + this.name + '/templates/', pathSuffix);
}


/**
 * Determine if a build tool supports the current configuration.
 * @param {string} resourceKey   An object that may contain the 'unsupported' key.
 * @returns {string}    Returns a message if the tool is NOT supported, or undefined otherwise
 * @this generator
 */
function isBuildToolSupported(resourceKey) {
  let unsupportedCriterion = resourceKey.unsupported;

  if (!_.isArray(unsupportedCriterion)) {
    return;
  }

  let config = this.getGlobalConfig();
  let unsupportedErrors = unsupportedCriterion.filter(item => {
    let criteria = item.criteria;
    let key = Object.keys(criteria)[0];   // This should be a reference to a value in the config. E.g. 'buildJS.framwork[0]'
    let expectedValue = criteria[key];

    return _.get(config, key) === expectedValue;
  });

  if (unsupportedErrors.length) {
    return unsupportedErrors[0].message;
  }
}


function isCurrentProjectType(newProjectType) {
  //console.log(buildProfileProjectType, newProjectType);
  return buildProfileProjectType === newProjectType;
}


function getGloballyInstalledPackages() {
  return globallyInstalledPackages;
}


/**
 * Helper method which looks at a config object and determines which commands should be run for a given event
 *
 * @param {Object} contextMode                  The context of evaluation (e.g. this, or some object)
 * @param {Object[]} arrayOfCommandsOrPackages  Array of commands to run or NPM packages to install
 * @returns {undefined}
 * @this generator
 */
function registerBuildToolCommands(contextMode, arrayOfCommandsOrPackages) {
  let commands = arrayOfCommandsOrPackages || [];

  commands.forEach(cmd => {
    // If the command is a reference to a package, convert it to a command with arguments
    if (cmd.name && cmd.version) {
      cmd.cmd = 'npm';
      cmd.args = ['install', cmd.name + '@' + cmd.version];
      if (cmd.global) { // If the package is global, add the -g flag
        cmd.args.push('-g');
      }
    }

    // Not great code, but in a hurry...
    if (contextMode === 'install') {
      this.runOnInstall(cmd.cmd, cmd.args);
    } else if (contextMode === 'end') {
      this.runOnEnd(cmd.cmd, cmd.args);
    }
  });
}

/**
 * Takes a configuration object and generators all the things
 *
 * @param {Object} genToolConfig    Configuration object
 * @param {Function} successCb      If successful, call the callback
 * @returns {undefined}
 * @this generator
 */
function buildConfig(genToolConfig, successCb) {
  if (!genToolConfig) {
    return;
  }
  let unsupportedMessage = this.isBuildToolSupported(genToolConfig);

  // Filter the packages that should be installed globally. We will stick them into an oninstall block
  let globalPackages = (genToolConfig.packages || []).filter(pkg => pkg.global);
  let nonGlobalPackages = (genToolConfig.packages || []).filter(pkg => pkg.global === 'both' || !pkg.global);

  // Add the truly-global packages to a variable
  globallyInstalledPackages = _.uniq(globallyInstalledPackages.concat(globalPackages.filter(pkg => pkg.global === true)));

  // Now distinguish between dependencies and devDependencies
  let depPackages = nonGlobalPackages.filter(pkg => pkg.isDependency);
  let devDepPackages = nonGlobalPackages.filter(pkg => !pkg.isDependency);

  this.setNpmDependenciesFromArray(depPackages);
  this.setNpmDevDependenciesFromArray(devDepPackages);
  this.addNpmTasks(genToolConfig.tasks, unsupportedMessage);
  this.ts.addTypeLibsFromArray(genToolConfig.typeLibs);
  this.ts.addTypeLibsFromArray(genToolConfig.testTypeLibs);
  this.addPackageJsonConfig(genToolConfig.packageJsonConfig);

  // Modify the onInstall config to include global packages. Make sure they appear FIRST in the list of commands
  let onInstallConfig = globalPackages.concat(genToolConfig.onInstall || []);

  this.registerBuildToolCommands('install', onInstallConfig);
  this.registerBuildToolCommands('end', genToolConfig.onEnd);

  successCb.call(this);
}

/**
 * Reads the config data from a resource file and writes the changes described in the config.
 * Very powerful! Almost all the buildTool write operations can be defined in YAML now.
 * Adds DevDependencies, Tasks (NPM Scripts), NPM Config, Copies files and registers build
 * tool commands that run onInstall or onEnd
 *
 * @param {Object} buildToolResourceData   The data containing the build tool tasks, dependencies, config and file instructions
 * @param {Object} [optionalTemplateData]  Template data
 * @returns {undefined}
 * @this generator
 */
function writeBuildToolConfig(buildToolResourceData, optionalTemplateData) {
  buildConfig.call(this, buildToolResourceData, () => {
    let unsupportedMessage = this.isBuildToolSupported(buildToolResourceData);
    let templateData = _.merge(this.getStandardTemplateData(), optionalTemplateData);

    this.copyToolTemplates(buildToolResourceData.templateFiles, templateData);

    if (!unsupportedMessage) {
      this.addReadmeDoc('', buildToolResourceData.readme, templateData);    // When a key is not specified, it adds the whole object (if not undefined)
    }
  });
}


/**
 * Reads the config data from a resource file and writes the changes described in the config.
 * Very powerful! Almost all the buildTool write operations can be defined in YAML now.
 * Adds DevDependencies, Tasks (NPM Scripts), NPM Config, Copies files and registers build
 * tool commands that run onInstall or onEnd
 *
 * @param {Object} genResourceData         The generator's tasks, dependencies, config and file instructions
 * @param {Object} [optionalTemplateData]  Template data
 * @returns {undefined}
 * @this generator
 */
function writeGeneratorConfig(genResourceData, optionalTemplateData) {
  buildConfig.call(this, genResourceData, () => {
    let templateData = _.merge(this.getStandardTemplateData(), optionalTemplateData);

    this.copyGeneratorTemplates(genResourceData.templateFiles, templateData);
    this.addReadmeDoc('', genResourceData.readme, templateData);    // When a key is not specified, it adds the whole object (if not undefined)
  });
}