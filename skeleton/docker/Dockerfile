# build stage
FROM node:lts as build-stage

// @if feat.cypress || feat.protractor || feat.karma
ENV DEBIAN_FRONTEND=noninteractive

#update apt-get
#update apt-get
RUN apt-get update && apt-get install -y \
    apt-utils \
    fonts-liberation \
    libappindicator3-1 \
    libatk-bridge2.0-0 \
    libatspi2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    libgtk2.0-0 \
    libnotify-dev \
    libgconf-2-4 \
    libxss1 \
    libasound2 \
    xvfb \
  && rm -rf /var/lib/apt/lists/*

# install chrome
RUN curl --silent --show-error --location --fail --retry 3 --output /tmp/google-chrome-stable_current_amd64.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
  && ( dpkg -i /tmp/google-chrome-stable_current_amd64.deb ||  apt-get -fy install)  \
  && rm -rf /tmp/google-chrome-stable_current_amd64.deb \
  &&  sed -i 's|HERE/chrome"|HERE/chrome" --disable-setuid-sandbox --no-sandbox|g' \
          "/opt/google/chrome/google-chrome" \
  && google-chrome --version

// @endif

RUN npm install -g aurelia-cli@^1.2.0


WORKDIR /app

# install dependencies
COPY ./*.json  ./
RUN npm install

// @if feat.webpack
COPY config ./config
// @endif
COPY aurelia_project  ./aurelia_project

// @if feat.typescript && feat.webpack
COPY types ./types
// @endif

// @if feat.webpack
COPY static ./static
// @endif

# Copy files in the root folder
COPY *.* ./

# Copy source files
COPY src ./src


// @if feat.cypress || feat.protractor || feat.jest || feat.karma
# Copy test, unit & e2e
COPY test ./test
// @endif

// @if feat["cli-bundler"] && feat["dotnet-core"]
COPY wwwroot ./wwwroot
// @endif

// @if feat.jest || feat.karma
# RUN UNIT TESTS
RUN au test
// @endif

// @if feat.cypress || feat.protractor
# RUN E2E TESTS
RUN npm run e2e:headless
// @endif

# build
FROM build-stage as publish-stage
RUN au build --env prod

# production stage
FROM nginx:alpine as production-stage
COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html

// @if feat.webpack && !feat["dotnet-core"]
COPY --from=publish-stage /app/dist/ .
// @endif

// @if feat.webpack && feat["dotnet-core"]
COPY --from=publish-stage /app/wwwroot/dist/ .
// @endif

// @if feat["cli-bundler"] && feat["dotnet-core"]
COPY --from=publish-stage /app/wwwroot/ .
// @endif

// @if feat["cli-bundler"] && !feat["dotnet-core"]
  // @if feat["scaffold-navigation"]
COPY --from=publish-stage /app/bootstrap/dist/ ./bootstrap/dist/
  // @endif
COPY --from=publish-stage /app/scripts/ ./scripts/
COPY --from=publish-stage /app/index.html/ .
// @endif

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
