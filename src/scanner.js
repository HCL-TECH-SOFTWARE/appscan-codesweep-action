/* © Copyright HCL Technologies Ltd. 2020 */

const fs = require('fs');
const got = require('got');
const FormData = require('form-data');

const URL = 'http://localhost';
const PORT = ':8080';
const API_SCAN_FILE = '/v1/scanFile';
const FILE_PATH_PARAM = '?filePath=';

function scanFiles(fileMap) {
    return new Promise((resolve, reject) => {
        let count = 0;
        let issues = new Map();

        for (const [file, lines] of fileMap.entries()) {
            scanFile(file, lines)
            .then((findings) => {
                issues.set(file, findings);
                if(++count === fileMap.size)
                    resolve(issues);
            })
            .catch((error) => {
                reject(error);
            })
        }
    });
}

function scanFile(file, lines) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('scanFile', fs.createReadStream(file))
        let url = URL + PORT + API_SCAN_FILE + FILE_PATH_PARAM + encodeURIComponent(file);
        
        got.post(url, { body: form })
        .then((response) => {
            let responseJson = JSON.parse(response.body);
            
            if(!lines || lines.size === 0) {
                getArticlesForFindings(responseJson.findings, responseJson.articles)
                .then((findings) => {
                    resolve(findings);
                })
            }
            else {
                removeExtraFindings(responseJson.findings, lines)
                .then((filteredFindings) => {
                    return getArticlesForFindings(filteredFindings, responseJson.articles);
                })
                .then((findings) => {
                    resolve(findings);
                })
            }
        })
        .catch((error) => {
            if(error.response) {
                if(error.response.statusCode === 422) {
                    resolve();
                    return;
                }
                else {
                    let responseJson = JSON.parse(error.response.body);
                    console.log(responseJson.error);
                }
            }
            else {
                console.log(error);
            }
            reject(error);
        });
    });
}

function removeExtraFindings(findings, lines) {
    return new Promise(resolve => {
        let ret = [];
        let count = 0;

        findings.forEach(finding => {
            if(lines.has(finding.lineNumber))
                ret.push(finding);
            if(++count === findings.length)
                resolve(ret);
        });
    });
}

function getArticlesForFindings(findings, articles) {
    return new Promise(resolve => {
        let count = 0;

        findings.forEach(finding => {
            let article = articles[finding.vulnName];
            finding["description"] = article.description;
            finding["mitigation"] = article.mitigation;
            if(++count === findings.length)
                resolve(findings);
        });
    });
}

module.exports = { scanFiles };