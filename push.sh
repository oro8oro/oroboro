#!/bin/sh
# this assumes you created the openshift directory in your home directory
# modify the script if this is not the case
 
meteor build prod --architecture os.linux.x86_64
cp prod/meteor-svg-app.tar.gz ~/oroboro
rm prod/meteor-svg-app.tar.gz
cd ~/oroboro
tar -xvf meteor-svg-app.tar.gz -s '/^bundle//'
rm meteor-svg-app.tar.gz
git add .
git commit -am "a change"
git push