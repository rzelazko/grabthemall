#!/bin/bash
DIR_DESTINATION=`mktemp -d`
DIR_DESTINATION_BUILD="$DIR_DESTINATION/build"
DIR_SOURCE="."
FILE_FINAL="$DIR_DESTINATION/grabthemall@zelazko.info.xpi"

mkdir -p "$DIR_DESTINATION_BUILD/chrome/grabthemall"
mkdir -p "$DIR_DESTINATION_BUILD/defaults/preferences"
cp -r $DIR_SOURCE/chrome/grabthemall/* "$DIR_DESTINATION_BUILD/chrome/grabthemall/"
cp $DIR_SOURCE/defaults/preferences/*.js "$DIR_DESTINATION_BUILD/defaults/preferences/"
cp "$DIR_SOURCE/chrome.manifest" "$DIR_DESTINATION_BUILD/chrome.manifest"
cp "$DIR_SOURCE/install.rdf" "$DIR_DESTINATION_BUILD/install.rdf"

find $DIR_DESTINATION_BUILD -name ".svn" -type d | xargs rm -rf {}

cd $DIR_DESTINATION_BUILD
zip -x ".svn" -r $FILE_FINAL *

echo "[created] $FILE_FINAL"
