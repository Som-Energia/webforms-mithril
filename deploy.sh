#!/bin/bash

deploy_server=$1
deploy_path=$2
testing=$3

if [ -z "$testing" ]; then
    testing=0
fi;

function usage () {
    echo "Usage: $0 -s server -P path [-u user] [-p port] [-t testing]" 1>&2
    exit 1
}

function log_message () {
    level="$1"
    msg="$2"
    echo "[$level] [$(date --rfc-3339=ns)] $msg"
}

while getopts ":s:P:u:p:t:h" o; do
    case "${o}" in
        s)
            s=${OPTARG}
            ;;
        P)
            P=${OPTARG}
            ;;
        u)
            u=${OPTARG}
            ;;
        p)
            p=${OPTARG}
            ;;
        t)
            t=${OPTARG}
            ;;
        h)
            usage
            ;;
        *)
            ;;
    esac
done
if [ -z "$s" ]; then usage; fi
if [ -z "$P" ]; then usage; fi
if [ -z "$u" ]; then user="somdevel"; else user=$u; fi
if [ -z "$p" ]; then port="22"; else port=$p; fi
if [ -z "$t" ]; then testing=0; else testing=1; fi

deploy_server=$s
deploy_path=$P

today=$(date +"%Y-%m-%d_%H%M%S")
dest_dir="$deploy_path/build_$today"
app_dir="$deploy_path/current"

function build () {
    if [ $testing -eq 1 ]; then
        log_message "INFO" "Building project for ov-testing"
        npm run deploy-ov-test
    else
        log_message "INFO" "Building project for ov-prod"
        npm run deploy-prod
    fi;

    if [ $? != 0 ]
    then
        log_message "ERROR" "An error ocurred building app $?"
        exit -1
    fi  
}

function upload () {
    remote_shell="ssh -p $port"
    export remote_shell
    log_message "INFO" "Uploading build build_$today to $deploy_server:$port"
    rsync -auv dist/bundle-contract.* dist/*.ttf dist/*.woff dist/*.woff2 dist/*.svg dist/*.html somenergia@$deploy_server:$dest_dir
    if [ $? != 0 ]
    then
        log_message "ERROR" "An error ocurred uploading code: $?"
        exit -1
    fi

    log_message "INFO" "Linking new build... "
    ssh $user@$deploy_server -p $port "rm $app_dir; ln -s $dest_dir $app_dir"
    if [ $? != 0 ]
    then
        log_message "ERROR" "An error ocurred linking new build $?"
        exit -1
    fi
    unset remote_shell
}

build
upload
log_message "INFO" "Build finished, I did well my job!!"