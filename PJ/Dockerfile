FROM eclipse-temurin:17-jdk-jammy
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV ANDROID_HOME=/opt/android-sdk
ENV PATH="${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools"

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip && \
    unzip -q /tmp/cmdline-tools.zip -d /tmp/cmdline-tools && \
    mv /tmp/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm /tmp/cmdline-tools.zip

RUN yes | sdkmanager --licenses > /dev/null && \
    sdkmanager \
        "platform-tools" \
        "platforms;android-36" \
        "build-tools;36.0.0"

ENV GRADLE_USER_HOME=/root/.gradle

WORKDIR /app

COPY gradle/wrapper/gradle-wrapper.properties gradle/wrapper/gradle-wrapper.properties
COPY gradle/wrapper/gradle-wrapper.jar gradle/wrapper/gradle-wrapper.jar
COPY gradlew .
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew && ./gradlew --version

COPY . .

RUN sed -i 's/\r$//' gradlew && chmod +x gradlew && ./gradlew assembleDebug \
    --no-daemon \
    --stacktrace \
    -Dorg.gradle.jvmargs="-Xmx4g -XX:MaxMetaspaceSize=1g"
