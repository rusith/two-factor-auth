#!/usr/bin/env bash

set -e
wait-for-it "db:3306" -t 0

yarn dev