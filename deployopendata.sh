#!/bin/bash

wget https://opendata.somenergia.coop/v0.2/contracts/by/ccaa/monthly -O src/data/contracts_ccaa_monthly.yaml
wget https://opendata.somenergia.coop/v0.2/members/by/ccaa/monthly -O src/data/members_ccaa_monthly.yaml
npm run deploy-prod
cp dist/opendata.html dist/index.html
scp dist/* somadmin@192.168.1.5:/var/www/opendata-ui/


