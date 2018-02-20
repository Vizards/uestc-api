#!/usr/bin/env bash

curl -H "Content-Type:application/json" \
-X POST --data "{ "\"sid\"": "\"$1\"", "\"type\"": "\"$2\"", "\"limit\"": "\"$3\"", "\"platform\"": "\"$4\"", "\"registration_id\"": "\"$5\"", "\"username\"": "\"$6\"", "\"cronMasterKey\"": "\"$7\"" }" "127.0.0.1:7001/api/xifu/cron"
