/* © Copyright HCL Technologies Ltd. 2020 */

const { once } = require('events');
const { createInterface } = require('readline');
const { existsSync, createReadStream } = require('fs');

const REGEX = /^[0-9]+(,[0-9]+)?[acd][0-9]+(,[0-9]+)?/;

function parse(file) {
    return new Promise((resolve, reject) => {
        if(!existsSync(file)) {
            reject('invalid input: ' + file);
            return;
        }

        processInputFile(file)
        .then((fileMap) => {
            resolve(fileMap);
        })
        .catch((error) => {
            reject(error);
        });
    });
}

function processInputFile(inputFile) {
    return new Promise((resolve, reject) => {
        let fileMap = new Map();
        try {
            const rl = createInterface({
                input: createReadStream(inputFile),
                crlfDelay: Infinity
            });
        
            let file;
            let lines;

            /*
             * Lines will be one of two forms:
             *      1. A file name.
             *      or
             *      2. An indication of changed lines. e.g.
             *          26a27 (an add)
             *          72,74c73,76 (a change)
             *          72d71 (a delete)
             *      We're only interested in adds and changes and only the new line numbers (after the 'a' or 'c')
             */
            rl.on('line', (line) => {
                if(line.match(REGEX)) { //This line indicates which lines have been added, changed, or deleted in the current file.
                    //Create a new set of lines for this file, if needed.
                    if(!lines) {
                        lines = new Set();
                    }

                    let index = line.search(/[ac]/);
                    if(index != -1) {
                        //This is an add or a change. Get the updated line numbers and add them to the set.
                        line = line.substring(index + 1);
                        if(line.indexOf(',') === -1) {
                             //Just a single line, add it to the set.
                            lines.add(parseInt(line, 10));
                        }
                        else {
                            //A range of lines. Start and stop will be separated by ','.
                            let start = parseInt(line.substring(0, index), 10);
                            let end = parseInt(line.substring(index + 1), 10);
                            while(start <= end) {
                                lines.add(start++);
                            }
                        }
                    }
                }
                else { //This line indicates a new file.
                    if(file && shouldAddFile(lines))
                        fileMap.set(file, lines);
                    file = line;
                    lines = undefined;
                }
            });
        
            once(rl, 'close').then(() => {
                //Add the last one
                if(file && shouldAddFile(lines))
                    fileMap.set(file, lines);
                resolve(fileMap);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function shouldAddFile(lines) {
    //Avoid adding files that only have deleted lines.
    return !lines || lines.size !== 0;
}

module.exports = { parse };