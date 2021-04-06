const diffparser = require('../src/diffparser');
const scanner = require('../src/scanner');

//Needs to be relative to scanner.js
const inputFile = '/Users/murphy/Desktop/GithubAction/test/resources/scannertest.txt';

diffparser.parse(inputFile)
.then((filemap) => {
    return scanner.scanFiles(filemap);
})
.then((findingsMap) => {
    return new Promise(resolve => {
        count = 0;
        for (const [file, findings] of findingsMap.entries()) {
            findings.forEach(finding => {
                console.log(finding.vulnType + ' ' + finding.vulnName);
            });
            if(++count === findingsMap.size)
                resolve();
        }
    });
})
.catch((error) => {
    console.log(error);
})