/* © Copyright HCL Technologies Ltd. 2020 */

function createAnnotations(findingsMap) {
    return new Promise(resolve => {
        count = 0;
        for (const [file, findings] of findingsMap.entries()) {
            findings.forEach(finding => {
                createAnnotation(finding);
            });
            if(++count === findingsMap.size)
                resolve();
        }
    });
}

function createAnnotation(finding) {
    let message = formatMessage(finding);
    console.log(`::warning file=${finding.filePath},line=${finding.lineNumber},col=${finding.columnNumber}::${message}`);
}

function formatMessage(finding) {
    const newline = '%0A';
    let message = finding.vulnType + 
        ': ' + finding.vulnName +
        '\n\nDescription:\n' + finding.description.replace(/<.*?>/g, '') +
        '\nMitigation:\n' + finding.mitigation.replace(/<.*?>/g, '');
    message = message.replace(/\t+/g, '');
    message = message.replace(/[\r?\n]+/g, newline);
    return message;
}

module.exports = { createAnnotations };