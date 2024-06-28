
## Local Development
### STEP 1: Installing the dependencies for backend:
```bash
#!/bin/bash
set -e

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

pip install --upgrade pip

# Install the required packages
pip install -r requirements.txt
```

### STEP 2: Running the docker container locally:
After all the dependencies are deployed. Make sure you have a redis container running on your Docker Desktop. 
You can use the redis image on Docker Hub
```bash
docker run -d -p 6379:6379 --name redis -i redis
```

### STEP 3: Running the backend:
Once the redis container is healthy and port forwarded to 6378 locally, run the twtr.py
change the redis host to local

```bash
export REDIS_HOST=localhost
python twtr.py
```

### STEP 4: Running the Frontend
Install all the dependencies in the package-json
```bash
npm install
```
Frontend connects to the backend URL, which is passed as environment variable
```bash

export REACT_APP_API_SERVICE_URL=http://localhost:5000
```
Start the application
```bash
npm run start
```

The application will be available at http://localhost:3000

## Connecting various client to Local Backend Server

Using ngrok you can connect to a single backend server using its https url
Make sure the backend is running
```bash
ngrok http 5000
```
Copy the https server url 

```bash
cd fe
export REACT_APP_API_SERVICE_URL=your-https-ngrok-server
```

You need to update your frontend APIs to pass the ngrok response, so make sure you do that
```bash
const headers = {
            'ngrok-skip-browser-warning': 'any_value_here',
        };
        
```
Pass in each of your get requests


# Deployment on Cloud with EKS, CodeBuild, and Terraform

## Step 1: Initialize and Apply Terraform Configuration
1. Run the following Terraform commands:
    ```sh
    cd terraform
    terraform init
    terraform plan
    terraform apply
    terraform output kubeconfig > kubeconfig
    terraform output config_map_aws_auth > config-map-aws-auth.yaml
    ```

## Step 2: Kubernetes EKS Configuration
1. Copy the kubeconfig file:
    ```sh
    cp kubeconfig ~/.kube/config-eks
    export KUBECONFIG=~/.kube/config-eks
    ```
2. Apply the AWS auth configuration:
    ```sh
    kubectl apply -f config-map-aws-auth.yaml
    ```
3. Verify the Terraform configuration by checking the nodes:
    ```sh
    kubectl get nodes
    ```

## Step 3: Obtain Node IP
1. Get the node IPs:
    ```sh
    kubectl get nodes -o wide
    ```
2. Copy the node IP and update the `REACT_APP_API_SERVICE_URL` variable in `buildspec.yaml`:
    ```sh
    http://<nodeIP>:30001
    ```
3. Push the code to GitHub for CodeBuild to run automatically. The images will be updated in ECR.

## Step 4: Apply Kubernetes Configuration Files
1. Navigate to the k8s directory:
    ```sh
    cd k8s
    ```
2. Apply the deployment and service configurations:
    ```sh
    kubectl apply -f redis-deployment.yaml -f redis-service.yaml -f backend-deployment.yaml -f backend-service.yaml -f frontend-deployment.yaml -f frontend-service.yaml
    ```
3. Verify the database setup:
    ```sh
    kubectl get pods
    kubectl exec -it <redis-pod-name> redis-cli
    KEYS '*'
    ```

## Step 5: Destroy the Terraform Infrastructure
1. Destroy the infrastructure:
    ```sh
    terraform destroy
    ```

Replace `<redis-pod-name>` with the actual name of the Redis pod obtained from the `kubectl get pods` command.

Our code is working on EKS for the features that do not require Geolocation because we have not implemented HTTP to Https with SSL certificate. Apart from this, all other functionalities are working on EKS as well as locally.
