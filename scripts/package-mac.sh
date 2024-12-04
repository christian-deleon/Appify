#!/bin/bash

npm install

rm -rf dist

cd src

npm run build --mac --verbose
