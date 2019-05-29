#!/bin/bash

npm run deploy-prod
mv dist/index.html dist/gapminder.html
cp dist/opendata.html dist/index.html
scp dist/* somadmin@192.168.1.5:/var/www/opendata-ui/


