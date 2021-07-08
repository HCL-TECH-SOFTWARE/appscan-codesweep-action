# HCL AppScan CodeSweep Github Action
Your GitHub code is better and more secure with HCL AppScan CodeSweep for GitHub. For free.

The HCL AppScan CodeSweep for GitHub extension enables you to check your code on every pull request. Run as a GitHub action, the extension identifies vulnerabilities in changed code with every update. But more than just identifying issues, the HCL AppScan CodeSweep for GitHub extension tells you what you need to know to mitigate issues — before they make it to the main branch.

# Usage
## Register
Register on [HCL AppScan on Cloud (ASoC)](https://www.hcltechsw.com/appscan/codesweep-for-github) to generate your API key/secret.

## Setup
1. After logging into ASoC, go to [the API page](https://cloud.appscan.com/main/settings) to generate your API key/secret pair. These must be used in the asoc_key and asoc_secret parameters for the action. It's recommended to store them as secrets in your repository.
   ![adingkeys_animation](img/keyAndSecret.gif)
2. Add the following file to your repository under .github/workflows/main.yml or add to an existing workflow file:
```yaml
on: [pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v1
      - name: Run AppScan CodeSweep
        uses: HCL-TECH-SOFTWARE/appscan-codesweep-action@v1
        with:
          asoc_key: ${{secrets.ASOC_KEY}}
          asoc_secret: ${{secrets.ASOC_SECRET}}
    env: 
      GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```
**Note** If you use **checkout@v2** you must set fetch-depth to 0. For example:
```yaml
uses: actions/checkout@v2
with:
  fetch-depth: 0
```
# Optional Parameters
- status - The status of the checks if any security issues are found. Must be one of 'action_required', 'failure', or 'neutral'. The default is neutral. For example:
```yaml
with:
  status: failure
```

# Examples
Annotations are added to the diff view, showing any vulnerable lines of code and a checkrun is added to provide additional details, including good and bad code samples and mitigation information.
![annotation_screenshot](img/annotation.gif)

# Supported Languages 
The HCL AppScan CodeSweep action supports scanning the following languages/dialects:
| Languages|       |
|    :---:    |    :---:    |
| Android-Java |  Objective-C/Objective-C++  |
| Angular  |  PHP |
| Apex  |  PL/SQL |
| C  |  C++|
| Cobol  |  Perl |
| ColdFusion  |  Python |
| Golang  |  React |
| Groovy  |  React Native |
| Ionic  |  Ruby |
| JQuery  |  Scala |
| JavaScript  |  Swift |
| Kotlin  |  T-SQL |
| MooTools  |  TypeScript |
| NodeJS  |  VueJS |
| Xamarin |   .Net (C#, VB.NET, ASP.Net) |


# Join the community 
Use the [CodeSweep](https://join.slack.com/t/codesweep/shared_invite/zt-dc1o7zkn-pdMjJCFDTuRJP7mOUqEnKw) slack channel to report any feedback or ask general questions about the HCL AppScan CodeSweep action. 
