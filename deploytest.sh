#!/bin/bash


deploy_server=$1

today=$(date +"%Y-%m-%d")

dest_dir="/var/www/webforms-ui/release_$today"

app_dir="/var/www/webforms-ui/current"

echo "* Building project"
npm run deploy-test
cp dist/contract.html dist/index.html

echo "* Deploying to $deploy_server" 
rsync -auv dist/* somenergia@$deploy_server:$dest_dir
ssh somenergia@$deploy_server "rm $app_dir; ln -s $dest_dir $app_dir"

echo "* Run to test, I did well my job!!"