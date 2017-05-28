FROM rocketchat/base
MAINTAINER Loredana Cirstea

ARG ROOT_URL
ARG VERSION
ARG BUNDLE
ENV APP_DIR=/home/app

WORKDIR $APP_DIR

COPY $BUNDLE-${VERSION}.tar.gz .
RUN tar --strip-components 3 -xzf $BUNDLE-${VERSION}.tar.gz \
  && rm $BUNDLE-${VERSION}.tar.gz

# Install NPM packages
RUN echo "Install NPM packages:" \
  && cd $APP_DIR/programs/server \
  && npm install --production

RUN npm install -g forever

EXPOSE 3000
ENV PORT 3000
CMD ["forever", "--minUptime", "1000", "--spinSleepTime", "1000", "main.js"]
