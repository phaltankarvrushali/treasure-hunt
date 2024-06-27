## Project Overview
This project is a Treasure Hunt Game developed using ReactJS for the frontend, Flask for the backend, and Redis for real-time data storage. The application is deployed on AWS EKS with a CI/CD pipeline using AWS CodeBuild and Terraform

The Treasure Hunt Game allows players to participate in a location-based treasure hunt. The players' locations are updated in real-time using Redis, ensuring a smooth and responsive gaming experience.

## Architecture
Frontend: Built with ReactJS, it provides the user interface for the game.
Backend: Developed with Flask, it handles the game logic and communicates with Redis for data storage.
Redis: Used for storing and updating player locations in real-time.
CI/CD: Implemented using AWS CodeBuild for continuous integration and delivery.
Deployment: The application is deployed on AWS EKS and accessed using a NodePort service.
Prerequisites
Node.js and npm
Python and pip
Docker
AWS CLI
kubectl
eksctl
Terraform

## CI/CD Pipeline
The CI/CD pipeline is configured using AWS CodeBuild. Ensure you have the following files configured:
buildspec.yml: Defines the build steps for your application.

## Deployment
Deploy the application on AWS EKS:

Create an EKS cluster using Terraform
Deploy the application using Kubernetes manifests:

Create a Kubernetes deployment and service for the frontend.
Create a Kubernetes deployment and service for the backend.
Create a Kubernetes deployment and service for Redis.

## Team Members:
Vrushali Phaltankar, Unnati Aggarwal, Mengyue Liu
