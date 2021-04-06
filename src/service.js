/* © Copyright HCL Technologies Ltd. 2021 */

const fs = require('fs');
const got = require('got');
const FormData = require('form-data');
const core = require('@actions/core');

const URL = 'http://localhost:';
const PORT = process.env.SERVER_PORT ? process.env.SERVER_PORT : '8080';
const API_SCAN_FILE = '/v1/scanFile';
const API_LOGIN = '/v1/asoc/login'
const FILE_PATH_PARAM = '?filePath=';

function scanFile(file) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('scanFile', fs.createReadStream(file))
        let url = URL + PORT + API_SCAN_FILE + FILE_PATH_PARAM + encodeURIComponent(file);

        got.post(url, { body: form, retry: { limit: 3, methods: ["GET", "POST"] } })
        .then((response) => {
            resolve(response);
        })
        .catch((error) => {
            reject(error);
        })
    })
}

function asocLogin() {
    return new Promise((resolve) => {
        const key = process.env.INPUT_ASOC_KEY;
        const secret = process.env.INPUT_ASOC_SECRET;

        if(key && secret) {
            core.info('Connecting to ASoC...');
            let url = URL + PORT + API_LOGIN;
            got.post(url, { json: { 'keyId': key, 'keySecret': secret }, retry: { limit: 3, methods: ['GET', 'POST'] } })
            .then((response) => {
                if(response.statusCode === 200 || response.statusCode === 201) {
                    core.info('Successfully connected to ASoC');
                    resolve();
                }
                else {
                    core.info(`Failed to connect to ASoC. Response code ${response.statusCode}`);
                    resolve();
                }
            })
            .catch((error) => {
                core.error(`An error occurred logging into ASoC: ${error}`);
                resolve();
            })
        }
        else {
            resolve();
        }
    })
}

module.exports = { scanFile, asocLogin }
