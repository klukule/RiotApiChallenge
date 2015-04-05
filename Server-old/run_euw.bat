@echo off

echo Starting db updater for EUW(rapich-euw.db)
start "euneDBupdater" node matchIDparser.js euw db/rapich-euw.db 60a2b004-49b0-4d6a-9d86-f4e8f253561d
