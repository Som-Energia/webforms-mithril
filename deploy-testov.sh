#!/bin/bash

deploy_server=$1
today=$(date +"%Y-%m-%d")
app_dir="/Users/david/Projects/som_web"

echo "* Building project"
npm run deploy-ov-test

echo "* Deploying to $app_dir"
cp dist/bundle-contract.* dist/*.ttf dist/*.woff dist/*.woff2 dist/*.svg "$app_dir/src/front/static/changeownership"

echo "* Run to test, I did well my job!!"