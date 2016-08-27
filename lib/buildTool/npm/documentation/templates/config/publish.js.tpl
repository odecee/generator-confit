'use strict';

// START_CONFIT_GENERATED_CONTENT
<%
var configPath = paths.config.configDir + 'docs/';
var relativePath = configPath.replace(/([^/]+)/g, '..');
%>
const basePath = path.join(__dirname, '<%= relativePath %>');

// If the documentation.publish mechanism is GitHub, do this:
<% if (documentation.publishMethod === 'GitHub') { -%>
const ghpages = require('gh-pages');
const path = require('path');
const docOutputDir = path.join(basePath, '<%- documentation.outputDir %>');

ghpages.publish(docOutputDir, (err) => {
  if (!err) {
    console.info(`Published documentation from ${docOutputDir} to /gh-pages branch`);
  } else {
    console.error(err);
  }
});
<% } else if (documentation.publishMethod === 'cloud') { -%>

<% } else { %>

<% }%>
// END_CONFIT_GENERATED_CONTENT
