'use strict';

module.exports = function() {

  function write(gen) {
    gen.log('Writing "app" using Webpack');

    // Add the NPM dev dependencies
    gen.setNpmDevDependencies({
      'webpack': '*',
      'webpack-dev-server': '*'
    });
  }


  function beginDevelopment(gen) {
    // This command is meant to start the development environment after installation has completed.
    if (!gen.options['skip-run']) {
      gen.spawnCommand('npm', ['start']);
    }
  }


  return {
    beginDevelopment: beginDevelopment,
    write: write
  };
};