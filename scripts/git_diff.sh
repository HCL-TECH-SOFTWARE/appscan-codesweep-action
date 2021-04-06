#!/bin/bash

path=$1
base_file=$2
new_file=$5

printf '%s\n' $path
diff -b -B $base_file $new_file | grep -v '^[<>-]'
exit 0
