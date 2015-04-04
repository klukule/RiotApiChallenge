@echo off

echo Starting db updater for EUNE(rapich-eune.db)
start "euneMachIDparser - DEBUG" node matchIDparserDebug.js eune db/rapich-eune-debug.db 60a2b004-49b0-4d6a-9d86-f4e8f253561d
start "euneGameDataParser - DEBUG" node gameDataParserDebug.js eune db/rapich-eune-debug.db 60a2b004-49b0-4d6a-9d86-f4e8f253561d
