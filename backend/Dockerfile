FROM eclipse-temurin:17-jdk

WORKDIR /app

# Mavenをインストール
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# pom.xmlとソースをコピー
COPY pom.xml .
COPY src ./src

# アプリケーションをビルド
RUN mvn clean package -DskipTests

# 実行可能JARを実行
ENTRYPOINT ["java", "-jar", "target/kaizen-backend-0.0.1-SNAPSHOT.jar"]

EXPOSE 8080

