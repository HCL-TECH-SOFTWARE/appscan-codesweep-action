const diffparser = require('../src/diffparser');
const scanner = require('../src/scanner');

//Needs to be relative to scanner.js
const inputFile = '/Users/murphy/Desktop/GithubAction/test/resources/scannertest.txt';

diffparser.parse(inputFile)
.then((filemap) => {
    scanner.scanFiles(filemap);
})
.catch((error) => {
    console.log(error);
})