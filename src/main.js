/* © Copyright HCL Technologies Ltd. 2020 */

const core = require('@actions/core');
const annotations = require('./annotations');
const diffparser = require('./diffparser');
const scanner = require('./scanner');
const path = require('path');

const matcher = path.join(__dirname, '..', '.github');
console.log(`##[add-matcher]${path.join(matcher, 'codesweep.json')}`);

diffparser.parse(process.env.DIFF_LOG)
.then((fileMap) => {
	for (const [file, lines] of fileMap.entries()) {
		console.log("File is: " + file);
		console.log("Lines are: " + lines);
	}
	return scanner.scanFiles(fileMap)
})
.then((findingsMap) => {
	return annotations.createAnnotations(findingsMap)
})
.then(() => {
	console.log('Security check complete');
})
.catch((error) => {
	core.setFailed(error.message);
})
