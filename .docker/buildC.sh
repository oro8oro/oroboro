#!/bin/bash

PRODUCTION_URL=http://orobo.go.ro
DEV_URL=http://orobo.go.ro

# TARGET = production || staging || dev
TARGET=$1
VERSION=$2
NOBUILD=$3

DOCKER_IMG=loredanacirstea/oroboro
DOCKER_TAG=${DOCKER_IMG}:${VERSION}
DOCKER_TAG_T=${DOCKER_IMG}:${TARGET}
DOCKER_TAG_BUILD=${DOCKER_TAG}-bundle
BUNDLE=oroboro

Red="\\033[0;31m"
Color_Off="\\033[0m"

if [ -z "$TARGET" ]; then
  echo 'Missing deployment target. Possible values: staging, production, dev'
  exit 0
elif [ -z "$VERSION" ]; then
  echo 'Missing version number. Ex. 1.0.0'
  exit 0
fi

case "$TARGET" in
  'production')
    ROOT_URL=$PRODUCTION_URL
    DOCKER_TAG_T=${DOCKER_IMG}:latest
    ;;
  *)
    ROOT_URL=$DEV_URL
    ;;
esac

if [ -z "`docker info | grep Username`" ]; then
  echo -e "$Red You are not logged in. $Color_Off"
  exit 1;
fi

# If we have a NOBUILD parameter, we don't create the Node.js bundle
if [ -z "$NOBUILD" ]; then
  echo "Building Node.js bundle: $BUNDLE-$VERSION.tar.gz"
  echo "Creating Meteor packages archive for caching"
  # tar -cf packages.tar --exclude='*$BUNDLE*' --exclude='*node_modules*' --exclude='*npm*' packages/ \
  docker build --file '.docker/Dockerfile-build' --build-arg ROOT_URL=$ROOT_URL --build-arg VERSION=$VERSION -t $DOCKER_TAG_BUILD  . #\
  #&& rm packages.tar
fi

echo "Create temporary Docker container $DOCKER_TAG_BUILD"
if id=$(docker create $DOCKER_TAG_BUILD); then
  echo "Created a temporary Docker container with the bundled app"
  echo "Copying bundle '$BUNDLE-$VERSION.tar.gz' to host"
  docker cp $id:/home/build/$BUNDLE-$VERSION.tar.gz $BUNDLE-$VERSION.tar.gz \
  && echo "Removing temporary Docker container" \
  && docker rm -v $id \
  && echo "Building Docker image with tags: '$DOCKER_TAG', '$DOCKER_TAG_T'" \
  && docker build --file '.docker/Dockerfile' --build-arg ROOT_URL=$ROOT_URL --build-arg VERSION=$VERSION --build-arg BUNDLE=$BUNDLE -t $DOCKER_TAG -t $DOCKER_TAG_T  . \
  && echo "Removing bundle '$BUNDLE-$VERSION.tar.gz' from host" \
  && rm $BUNDLE-$VERSION.tar.gz

  if [ "$TARGET" != "dev" ]; then
    docker push $DOCKER_TAG \
    && docker push $DOCKER_TAG_T \
    && echo "Docker image has been pushed to Docker Hub. Tags: '$DOCKER_TAG', '$DOCKER_TAG_T'"
  fi
else
  echo -e "$Red App bundle is missing. Remove the 3rd NOBUILD parameter if you don't have a '$DOCKER_TAG_BUILD' Docker image. $Color_Off"
  exit 1;
fi
