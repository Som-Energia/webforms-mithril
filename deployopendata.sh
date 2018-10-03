#!/bin/bash

npm run deploy
cp dist/opendata.html dist/index.html
scp dist/* somadmin@192.168.1.5:/var/www/opendata-ui/


