#!/bin/sh

if [ ${MODE} == "PROD" ]; then
  rm -v .env.test.app
  npm run prod
else
  rm -v .env.app
  npm run dev
fi
