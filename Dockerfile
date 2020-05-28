FROM bayesimpact/react-base:latest AS dev

RUN apt-get update && apt-get install -qqy --no-install-recommends \
  # Libs for pupeteer HeadlessChrome:
  # https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix
  gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
  libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 \
  libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
  libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
  libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget \
  # Other libs
  jq

# Install needed node modules (most of them should already be in base
# image).
COPY package.json .
RUN node node_modules/.bin/yarn-lazy-lock && yarn install
RUN npm list --depth=0; exit 0

COPY cfg cfg/
COPY src src/
COPY test test/
# TODO(cyrille): Add a favicon.
COPY .babelrc diff_i18n_folder.sh i18n.babelrc.js entrypoint.sh .eslintrc.json .eslintignore karma.conf.js check-color-config.sh jsonlint.sh tsconfig.json custom.d.ts ./

COPY vendor/patch-babel-plugin-i18next-extract.sh ./vendor/patch-babel-plugin-i18next-extract.sh
RUN ./vendor/patch-babel-plugin-i18next-extract.sh


FROM dev AS test
CMD ./entrypoint.sh npm run checks


FROM dev AS build-dist
ARG CLIENT_VERSION
RUN ./entrypoint.sh npm run dist


FROM nginx:stable AS nginx

RUN mkdir -p /usr/share/app/html
COPY --from=build-dist /usr/app/dist /usr/share/app/html
ADD release/nginx.conf /etc/nginx/conf.d/default.conf
ADD release/entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]

# Label the image with the git commit.
ARG GIT_SHA1=non-git
LABEL org.bayesimpact.git=$GIT_SHA1

ARG CLIENT_VERSION
RUN echo $CLIENT_VERSION > /usr/share/app/version


