/* © Copyright HCL Technologies Ltd. 2021 */

const APPSCAN_CODESWEEP = 'AppScan CodeSweep';
const IDENTIFIED_BY_CODESWEEP = 'Identified by HCL AppScan CodeSweep';

const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    baseUrl: process.env.GITHUB_API_URL,
    userAgent: APPSCAN_CODESWEEP
})

const TurndownService = require('turndown');
const turndownService = new TurndownService();
turndownService.addRule('code-block', {
    filter: 'code-block',
    replacement: function (content) {
      return '```' + content + '```';
    }
});

const ownerRepo = process.env.GITHUB_REPOSITORY.split('/');
let findingsByVulnMap = new Map();
let checkRunsCount = 0;
let annotationsCount = 0;

function createCheckRuns(findingsByFileMap) {
    return new Promise(resolve => {
        for (const [file, findings] of findingsByFileMap.entries()) {
            processFindings(findings);
        }

        let count = 0;
        for (const [vulnName, findingsArray] of findingsByVulnMap.entries()) {
            createCheckRun(findingsArray);

            if(++count === findingsByVulnMap.size)
                resolve(annotationsCount);
        }
    })
}

function processFindings(findings) {
    for (var i = 0; i < findings.length; i++) {
        let finding = findings[i];
        if(!findingsByVulnMap.has(finding.vulnName))
            findingsByVulnMap.set(finding.vulnName, [ finding ]);
        else
            findingsByVulnMap.get(finding.vulnName).push(finding);
    }
}

function createCheckRun(findings) {
    if(!findings || findings.size === 0)
        return;

    octokit.checks.create( {
        owner: ownerRepo[0],
        repo: ownerRepo[1],
        name: getCheckRunName(),
        status: 'completed',
        conclusion: 'neutral',
        head_sha: process.env.GITHUB_HEAD_SHA,
        output: createOutput(findings),
        actions: []
    })
    .then(() => {
        return;
    })
    .catch((error) => {
        core.error(`Failed creating checkrun: ${error}`);
    })
}

function createActions() {
    return [
        {
            label: 'Mark all as noise',
            description: 'Mark issues in this checkrun as noise',
            identifier: APPSCAN_CODESWEEP
        },
        {
            label: 'Disable rule',
            description: 'Disable this rule for future scans',
            identifier: APPSCAN_CODESWEEP
        }
    ]
}

function createOutput(findings) {
    return {
        title: findings[0].vulnName,
        summary: createSummary(findings[0]),
        text: createDetails(findings[0]),
        annotations: createAnnotations(findings)
    }
}

function createAnnotations(findings) {
    let annotations = [];

    findings.forEach((finding) => {
        annotations.push({
            path: finding.filePath,
            start_line: finding.lineNumber,
            end_line: finding.lineNumber,
            annotation_level: 'warning',
            title: finding.vulnName,
            message: getVulnTypeString(finding) + '\t[' + getSeverityString(finding) + ']'
        });
    });
    
    annotationsCount += annotations.length;
    return annotations;
}

function createDetails(finding) {
    return turndownService.turndown(formatCodeBlock(finding.description)) 
        + '\n### Mitigation\n'
        + turndownService.turndown(formatCodeBlock(finding.mitigation));
}

function createSummary(finding) {
    return IDENTIFIED_BY_CODESWEEP + '\n' + getVulnTypeString(finding) + '\n' + getSeverityString(finding);
}

//Code blocks need to be wrapped in <pre> tags or newlines are lost.
function formatCodeBlock(text) {
    text = text.replace('<code-block>', '<pre><code-block>');
    text = text.replace('</code-block>', '</code-block></pre>');
    return text;
}

function getVulnTypeString(finding) {
    return 'Vulnerability: ' + finding.vulnType
}

function getSeverityString(finding) {
    let severityString = '';

    switch(finding.severity) {
        case 1:
            severityString = 'Medium';
            break;
        case 2:
            severityString = 'Low';
            break;
        case 3:
            severityString = 'Info';
            break;
        default:
            severityString = 'High';
            break;
    }

    return 'Severity: ' + severityString;
}

function getCheckRunName() {
    return APPSCAN_CODESWEEP + ' #' + ++checkRunsCount;
}

module.exports = { createCheckRuns };