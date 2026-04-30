@echo off
setlocal enabledelayedexpansion

REM Try common MongoDB installation paths
set "PATHS=C:\Program Files\MongoDB\Server\*\bin\mongod.exe" ^
          "C:\Program Files (x86)\MongoDB\bin\mongod.exe" ^
          "C:\mongodb\bin\mongod.exe" ^
          "C:\data\mongod.exe"

for %%P in (%PATHS%) do (
  if exist "%%P" (
    echo Found MongoDB at: %%P
    "%%P" --dbpath C:\data\db
    exit /b 0
  )
)

echo MongoDB not found in common locations.
echo Please install MongoDB Community Edition from: https://www.mongodb.com/try/download/community
echo Or specify MONGO_URI environment variable to connect to a remote MongoDB.
