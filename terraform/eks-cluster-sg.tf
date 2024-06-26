#
# EKS Cluster Resources
# * EC2 Security Group to allow networking traffic with EKS cluster
#
resource "aws_security_group" "demo-cluster" {
name = "terraform-eks-demo-cluster"
description = "Cluster communication with worker nodes"
vpc_id = "${aws_vpc.demo.id}"
egress {
from_port = 0
to_port = 0
protocol = "-1"
cidr_blocks = ["0.0.0.0/0"]
}
tags = {
Name = "terraform-eks-demo"
}
}
resource "aws_security_group_rule" "demo-cluster-ingress-node-https" {
description = "Allow pods to communicate with the cluster API Server"
from_port = 443
protocol = "tcp"
security_group_id = "${aws_security_group.demo-cluster.id}"
source_security_group_id = "${aws_security_group.demo-node.id}"
to_port = 443
type = "ingress"
}
resource "aws_security_group_rule" "demo-cluster-ingress-workstation-https" {
#cidr_blocks = ["${local.workstation-external-cidr}"]
cidr_blocks = ["0.0.0.0/0"]
description = "Allow workstation to communicate with the cluster API Server"
from_port = 443
protocol = "tcp"
security_group_id = "${aws_security_group.demo-cluster.id}"
to_port = 443
type = "ingress"
}




# New rules for ports 30001 and 30002 from anywhere
resource "aws_security_group_rule" "demo-cluster-ingress-nodeport-30001" {
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow access to NodePort 30001 from anywhere"
  from_port         = 5000
  protocol          = "tcp"
  security_group_id = "${aws_security_group.demo-cluster.id}"
  to_port           = 5000
  type              = "ingress"
}

resource "aws_security_group_rule" "demo-cluster-ingress-nodeport-30002" {
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Allow access to NodePort 30002 from anywhere"
  from_port         = 80
  protocol          = "tcp"
  security_group_id = "${aws_security_group.demo-cluster.id}"
  to_port           = 80
  type              = "ingress"
}