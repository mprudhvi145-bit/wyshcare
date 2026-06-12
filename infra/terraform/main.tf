terraform {
  required_version = '>= 1.9'
  backend 's3' {
    bucket = 'wyshcare-terraform-state'
    key    = 'production/terraform.tfstate'
    region = 'ap-south-1'
    encrypt = true
  }
  required_providers {
    aws = {
      source  = 'hashicorp/aws'
      version = '~> 5.0'
    }
    kubernetes = {
      source  = 'hashicorp/kubernetes'
      version = '~> 2.0'
    }
    helm = {
      source  = 'hashicorp/helm'
      version = '~> 2.0'
    }
  }
}

provider 'aws' {
  region = var.aws_region
}

provider 'kubernetes' {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  exec {
    api_version = 'client.authentication.k8s.io/v1beta1'
    command     = 'aws'
    args        = ['eks', 'get-token', '--cluster-name', module.eks.cluster_name]
  }
}

module 'vpc' {
  source = './modules/network'
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

module 'eks' {
  source = './modules/compute'
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  public_subnets  = module.vpc.public_subnets
  cluster_version = var.cluster_version
}

module 'rds' {
  source = './modules/data'
  environment   = var.environment
  vpc_id        = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  db_password   = var.db_password
  db_name       = var.db_name
}

module 'security' {
  source = './modules/security'
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  eks_cluster_name = module.eks.cluster_name
}
