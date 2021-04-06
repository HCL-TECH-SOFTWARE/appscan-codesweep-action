const diffparser = require('../src/diffparser');

//Needs to be relative to diffparser.js
const inputFile = '/Users/murphy/Desktop/GithubAction/test/resources/difftest.txt';

diffparser.parse(inputFile)
.then((fileMap) => {
    for (const [file, lines] of fileMap.entries()) {
        console.log(file);
        if(lines) {
            lines.forEach(line => {
                console.log(line);
            });
        }
    }
});
