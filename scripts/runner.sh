#!/bin/bash
# if a command fails, exit
set -e
# treat unset variables as error
set -u
# print all debug information
#set -x

input_file=files_to_scan.txt
diff_script=scripts/git_diff.sh

# This is populated by our secret from the Workflow file.
if [[ -z "$GITHUB_TOKEN" ]]; then
	echo "You must set the GITHUB_TOKEN environment variable."
	exit 1
fi

get_base_commit() {
    BASE_COMMIT=$(
    	jq \
    		--raw-output \
    		.pull_request.base.sha "$GITHUB_EVENT_PATH"
    )
    
    # If this is not a pull request action it can be a check suite re-requested
    if [ "$BASE_COMMIT" == null ]; then
        BASE_COMMIT=$(
        	jq \
        		--raw-output \
        		.check_suite.pull_requests[0].base.sha \
        		"$GITHUB_EVENT_PATH"
        )
    fi
}

get_head_commit() {
    HEAD_COMMIT=$(
    	jq \
    		--raw-output \
    		.pull_request.head.sha "$GITHUB_EVENT_PATH"
    )
    export GITHUB_HEAD_SHA="$HEAD_COMMIT"
}

get_added_files() {
    echo "Checking for added files..."
    git diff --name-only --diff-filter=A "$BASE_COMMIT"..."$HEAD_COMMIT" >> $input_file
}

get_modified_files() {
	echo "Checking for modified files..."
    GIT_EXTERNAL_DIFF=$diff_script git diff --diff-filter=M "$BASE_COMMIT"..."$HEAD_COMMIT" >> $input_file
}

run_scan() {
    node ./src/main.js
}

ACTION=$(
	jq \
		--raw-output \
		.action \
		"$GITHUB_EVENT_PATH"
)

# First 2 actions are for pull requests, last 2 are for check suites.
ENABLED_ACTIONS='synchronize opened requested rerequested'

main() {
    export DIFF_LOG=$input_file

    if [[ $ENABLED_ACTIONS != *"$ACTION"* ]]; then
        echo -e "Not interested in this event: $ACTION.\nExiting..."
        exit
    fi
    
    :>| $input_file
    get_base_commit
    get_head_commit
    get_added_files
    get_modified_files
    run_scan
}

main "$@"

