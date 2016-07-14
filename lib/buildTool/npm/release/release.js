'use strict';

module.exports = function() {
  /**
   * @returns {undefined}
   * @this generator
   */
  function write() {
    this.log('Writing NPM release options');

    let config = this.getConfig();
    let toolResources = this.buildTool.getResources().release;
    let semanticResources = toolResources.repositoryType[config.repositoryType][config.useSemantic ? 'semantic' : 'manual'];
    let commitMessageResources = toolResources.commitMessageFormat[config.commitMessageFormat];

    this.writeBuildToolConfig(semanticResources);
    this.writeBuildToolConfig(commitMessageResources);
  }

  return {
    write: write
  };
};