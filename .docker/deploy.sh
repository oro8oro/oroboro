#!/bin/bash

# TARGET = production || staging || dev
TARGET=$1

BASE_APP_NAME=oroboro

if [ -z "$TARGET" ]; then
  TARGET=latest
fi

DOCKER_TAG=$TARGET

export DOCKER_TAG
export BASE_APP_NAME
docker-compose -f .docker/docker-compose-$TARGET.yml pull
docker-compose -f .docker/docker-compose-$TARGET.yml up -d
