resource 'aws_eks_cluster' 'main' {
  name     = "wyshcare-${var.environment}"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = var.cluster_version
  vpc_config {
    subnet_ids              = concat(var.private_subnets, var.public_subnets)
    endpoint_private_access = true
    endpoint_public_access  = true
  }
  tags = { Environment = var.environment }
}

resource 'aws_eks_node_group' 'main' {
  cluster_name    = aws_eks_cluster.main.name
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = var.private_subnets
  instance_types  = ['t3.medium', 't3.large']
  scaling_config {
    desired_size = 2
    min_size     = 2
    max_size     = 10
  }
  tags = { Environment = var.environment }
}

resource 'aws_iam_role' 'eks_cluster' {
  name = "wyshcare-eks-cluster-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.eks_assume.json
}

resource 'aws_iam_role' 'eks_nodes' {
  name = "wyshcare-eks-nodes-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

data 'aws_iam_policy_document' 'eks_assume' {
  statement {
    actions = ['sts:AssumeRole']
    principals {
      type        = 'Service'
      identifiers = ['eks.amazonaws.com']
    }
  }
}

data 'aws_iam_policy_document' 'ec2_assume' {
  statement {
    actions = ['sts:AssumeRole']
    principals {
      type        = 'Service'
      identifiers = ['ec2.amazonaws.com']
    }
  }
}

output 'cluster_name'                     { value = aws_eks_cluster.main.name }
output 'cluster_endpoint'                 { value = aws_eks_cluster.main.endpoint }
output 'cluster_certificate_authority_data' { value = aws_eks_cluster.main.certificate_authority[0].data }
