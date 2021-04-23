# HCL AppScan CodeSweep Github Action
Stop insecure code from ever reaching your repository with the HCL AppScan CodeSweeep Github Action. When added to a new or existing Github Workflow, this action runs a security scan against all modified and added lines of code. Vulnerable lines of code are annotated with information to help the developer resolve the problem. Invoke the action on pull requests so both the developer and the reviewer are made aware of the problem before the code is ever merged to the repository.

# Usage
## Sign-Up
Register for a [free trial](https://www.hcltechsw.com/appscan/freetrial) of HCL AppScan on Cloud (ASoC). This is necessary to generate your API key/secret.

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
| Android-Java |  Objective-C  |
| Angular  |  PHP |
| Apex  |  PL/SQL |
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
| Xamarin |   .Net (C#, ASP.Net) |


# Join the community 
Use the [CodeSweep](https://join.slack.com/t/codesweep/shared_invite/zt-dc1o7zkn-pdMjJCFDTuRJP7mOUqEnKw) slack channel to report any feedback or ask general questions about the HCL AppScan CodeSweep action. 
