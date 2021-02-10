#!/bin/bash
deploy_user=$1
deploy_server=$2
deploy_path=$3

function usage () {
    echo "Usage: $0 user server path" 1>&2
    exit 1;
}

if [ $# -ne 3 ];
        then
            usage;
fi

wget https://opendata.somenergia.coop/v0.2/contracts/by/ccaa/monthly -O src/data/contracts_ccaa_monthly.yaml
wget https://opendata.somenergia.coop/v0.2/members/by/ccaa/monthly -O src/data/members_ccaa_monthly.yaml
npm run deploy-prod
#cp dist/opendata.html dist/index.html # Not any more
scp -P 2200 dist/* $deploy_user@$deploy_server:$deploy_path


