@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo     REPPARTON MICROSERVICES GENERATOR
echo ===============================================
echo.

set /p SERVICE_NAME="Nhap ten service (vi du: analytics): "
set /p SERVICE_PORT="Nhap port service (vi du: 8089): "
set /p SERVICE_DESC="Nhap mo ta service: "

set PACKAGE_NAME=%SERVICE_NAME:-=service%

echo.
echo Tao service %SERVICE_NAME% tren port %SERVICE_PORT%...
echo.

REM Tao thu muc service
mkdir %SERVICE_NAME%-service
cd %SERVICE_NAME%-service

REM Tao cau truc thu muc
mkdir src\main\java\com\DA2\%PACKAGE_NAME%
mkdir src\main\java\com\DA2\%PACKAGE_NAME%\entity
mkdir src\main\java\com\DA2\%PACKAGE_NAME%\repository  
mkdir src\main\java\com\DA2\%PACKAGE_NAME%\service
mkdir src\main\java\com\DA2\%PACKAGE_NAME%\controller
mkdir src\main\resources

REM Tao pom.xml
echo ^<?xml version="1.0" encoding="UTF-8"?^> > pom.xml
echo ^<project xmlns="http://maven.apache.org/POM/4.0.0" >> pom.xml
echo          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" >> pom.xml
echo          xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd"^> >> pom.xml
echo     ^<modelVersion^>4.0.0^</modelVersion^> >> pom.xml
echo. >> pom.xml
echo     ^<parent^> >> pom.xml
echo         ^<groupId^>com.DA2^</groupId^> >> pom.xml
echo         ^<artifactId^>repparton-microservices^</artifactId^> >> pom.xml
echo         ^<version^>1.0.0^</version^> >> pom.xml
echo     ^</parent^> >> pom.xml
echo. >> pom.xml
echo     ^<artifactId^>%SERVICE_NAME%-service^</artifactId^> >> pom.xml
echo     ^<name^>%SERVICE_NAME% Service^</name^> >> pom.xml
echo     ^<description^>%SERVICE_DESC%^</description^> >> pom.xml
echo. >> pom.xml
echo     ^<dependencies^> >> pom.xml
echo         ^<dependency^> >> pom.xml
echo             ^<groupId^>com.DA2^</groupId^> >> pom.xml
echo             ^<artifactId^>shared-common^</artifactId^> >> pom.xml
echo             ^<version^>1.0.0^</version^> >> pom.xml
echo         ^</dependency^> >> pom.xml
echo         ^<dependency^> >> pom.xml
echo             ^<groupId^>org.springframework.boot^</groupId^> >> pom.xml
echo             ^<artifactId^>spring-boot-starter-web^</artifactId^> >> pom.xml
echo         ^</dependency^> >> pom.xml
echo         ^<dependency^> >> pom.xml
echo             ^<groupId^>org.springframework.boot^</groupId^> >> pom.xml
echo             ^<artifactId^>spring-boot-starter-data-mongodb^</artifactId^> >> pom.xml
echo         ^</dependency^> >> pom.xml
echo         ^<dependency^> >> pom.xml
echo             ^<groupId^>org.springframework.cloud^</groupId^> >> pom.xml
echo             ^<artifactId^>spring-cloud-starter-netflix-eureka-client^</artifactId^> >> pom.xml
echo         ^</dependency^> >> pom.xml
echo         ^<dependency^> >> pom.xml
echo             ^<groupId^>org.springframework.boot^</groupId^> >> pom.xml
echo             ^<artifactId^>spring-boot-starter-validation^</artifactId^> >> pom.xml
echo         ^</dependency^> >> pom.xml
echo         ^<dependency^> >> pom.xml
echo             ^<groupId^>org.springframework.cloud^</groupId^> >> pom.xml
echo             ^<artifactId^>spring-cloud-starter-openfeign^</artifactId^> >> pom.xml
echo         ^</dependency^> >> pom.xml
echo     ^</dependencies^> >> pom.xml
echo. >> pom.xml
echo     ^<build^> >> pom.xml
echo         ^<plugins^> >> pom.xml
echo             ^<plugin^> >> pom.xml
echo                 ^<groupId^>org.springframework.boot^</groupId^> >> pom.xml
echo                 ^<artifactId^>spring-boot-maven-plugin^</artifactId^> >> pom.xml
echo             ^</plugin^> >> pom.xml
echo         ^</plugins^> >> pom.xml
echo     ^</build^> >> pom.xml
echo ^</project^> >> pom.xml

REM Tao application.yml
echo spring: > src\main\resources\application.yml
echo   application: >> src\main\resources\application.yml
echo     name: %SERVICE_NAME%-service >> src\main\resources\application.yml
echo   data: >> src\main\resources\application.yml
echo     mongodb: >> src\main\resources\application.yml
echo       uri: mongodb://localhost:27017/%SERVICE_NAME%db >> src\main\resources\application.yml
echo. >> src\main\resources\application.yml
echo server: >> src\main\resources\application.yml
echo   port: %SERVICE_PORT% >> src\main\resources\application.yml
echo. >> src\main\resources\application.yml
echo eureka: >> src\main\resources\application.yml
echo   client: >> src\main\resources\application.yml
echo     service-url: >> src\main\resources\application.yml
echo       defaultZone: http://localhost:8761/eureka/ >> src\main\resources\application.yml
echo     fetch-registry: true >> src\main\resources\application.yml
echo     register-with-eureka: true >> src\main\resources\application.yml
echo   instance: >> src\main\resources\application.yml
echo     prefer-ip-address: true >> src\main\resources\application.yml

echo.
echo ===============================================
echo     SERVICE %SERVICE_NAME% DA DUOC TAO!
echo ===============================================
echo.
echo Duong dan: %SERVICE_NAME%-service
echo Port: %SERVICE_PORT%
echo Database: %SERVICE_NAME%db
echo.
echo Tiep theo ban can:
echo 1. Tao cac Entity trong package entity
echo 2. Tao cac Repository trong package repository  
echo 3. Tao cac Service trong package service
echo 4. Tao cac Controller trong package controller
echo 5. Tao Main Application class
echo.
pause