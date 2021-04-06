/* © Copyright HCL Technologies Ltd. 2021 */

const core = require('@actions/core');
const checkrun = require('./checkrun');
const diffparser = require('./diffparser');
const scanner = require('./scanner');
const service = require('./service');

service.asocLogin()
.then(() => {
	return diffparser.parse(process.env.DIFF_LOG);
})
.then((fileMap) => {
	return scanner.scanFiles(fileMap)
})
.then((findingsMap) => {
	return checkrun.createCheckRuns(findingsMap)
})
.then((numIssues) => {
	core.info(`Scan complete. Found ${numIssues} security issue(s).`);
})
.catch((error) => {
	core.setFailed(error.message);
})
