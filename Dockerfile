# Step 1: Use Maven with Java to build the application
FROM maven:3.8-openjdk-17 AS build

# Set working directory inside the container
WORKDIR /app

# Copy Maven files first (for caching dependencies)
COPY pom.xml .
COPY src ./src

# Build the Spring Boot app
RUN mvn clean install -DskipTests

# Step 2: Use a slim JDK image to run the app
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (optional, just for documentation)
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
