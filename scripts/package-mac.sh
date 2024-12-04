#!/bin/bash

npm install

npm run package-mac

cp -a ./release-builds/appify-darwin-arm64/appify.app /Applications/
