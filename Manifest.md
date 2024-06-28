
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

## Deployment on cloud with EKS, CodeBuild and Terraform:

1. Run terraform init
    a. terraform plan
    b. terraform apply
    c. terraform output kubeconfig > kubeconfig
    d. terraform output config_map_aws_auth > config-map-aws-auth.yaml

2. Kubernetes EKS configuration
   a. cp kubeconfig ~/.kube/config-eks
   b. export KUBECONFIG=~/.kube/config-eks
   c. kubectl apply -f config-map-aws-auth.yaml
   d. Check for "kubectl get nodes" to verify terraform configuration

4. Node IP
   a. kubectl get nodes -owide
   b. Copy the nodeIP 
   c. Paste the nodeIP with "http://nodeIP:30001" in REACT_APP_API_SERVICE_URL variable in buildspec.yaml and push code to GitHub for the CodeBuild to run automatically and images will be  updated in ECR

6. Apply k8s config files
   a. cd k8s
   b. kubectl apply -f redis-deployment.yaml -f redis-service.yaml -f backend-deployment.yaml -f backend-service.yaml -f frontend-deployment.yaml -f frontend-service.yaml
   c. To verify db, check "kubectl get pods"
   d. kubectl exec -it <redis-pod-name> redis-cli
   e. KEYS '*'
   f. terraform destroy
