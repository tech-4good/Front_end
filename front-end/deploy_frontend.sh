#!/bin/bash

set -e

sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl start docker
sudo systemctl enable docker

echo "Digite seu usuário Docker Hub:"
read DOCKER_USER

echo "Digite sua senha Docker Hub:"
read -s DOCKER_PASS

echo $DOCKER_PASS | sudo docker login --username $DOCKER_USER --password-stdin

IMAGE_NAME="lucas20matos/front-end-app:latest"
sudo docker pull $IMAGE_NAME

sudo docker run -d -p 80:80 $IMAGE_NAME

echo "Front-end rodando na porta 80!"
