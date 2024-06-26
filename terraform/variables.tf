#
# Variables Configuration
#
variable "cluster-name" {
default = "terraform-eks-demo"
type = string
}

data "aws_eks_cluster_auth" "demo" {
  name = var.cluster-name
}