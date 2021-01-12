/*
  @license
	Rollup.js v2.36.1
	Wed, 06 Jan 2021 14:06:54 GMT - commit d6600638c61b5eb7f389681d5fa4af9a1b95823e


	https://github.com/rollup/rollup

	Released under the MIT License.
*/
'use strict';

require('./shared/rollup.js');
require('fs');
require('path');
require('./shared/mergeOptions.js');
var loadConfigFile_js = require('./shared/loadConfigFile.js');
require('crypto');
require('events');
require('url');



module.exports = loadConfigFile_js.loadAndParseConfigFile;
//# sourceMappingURL=loadConfigFile.js.map
