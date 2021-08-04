DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
  id int NOT NULL AUTO_INCREMENT,
  first_name varchar(255),
  last_name varchar(255),
  title varchar(255),
  department varchar(255),
  salary int,
  manager varchar(255),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(255),
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
  id int NOT NULL AUTO_INCREMENT,
  title varchar(255),
  department varchar(255),
  salary int,
  PRIMARY KEY (id)
);