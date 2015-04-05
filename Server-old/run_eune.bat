@echo off

echo Starting db updater for EUNE(rapich-eune.db)
start "euneDBupdater" node matchIDparser.js eune db/rapich-eune.db 60a2b004-49b0-4d6a-9d86-f4e8f253561d
