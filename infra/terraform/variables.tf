variable 'environment' {
  description = 'Deployment environment'
  type        = string
  default     = 'production'
}

variable 'aws_region' {
  description = 'AWS region'
  type        = string
  default     = 'ap-south-1'
}

variable 'vpc_cidr' {
  description = 'VPC CIDR block'
  type        = string
  default     = '10.0.0.0/16'
}

variable 'cluster_version' {
  description = 'EKS cluster version'
  type        = string
  default     = '1.31'
}

variable 'db_password' {
  description = 'RDS master password'
  type        = string
  sensitive   = true
}

variable 'db_name' {
  description = 'RDS database name'
  type        = string
  default     = 'wyshcare'
}
