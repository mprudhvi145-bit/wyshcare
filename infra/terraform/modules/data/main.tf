resource 'aws_db_instance' 'main' {
  identifier        = "wyshcare-${var.environment}"
  engine            = 'postgres'
  engine_version    = '16.3'
  instance_class    = 'db.t3.medium'
  allocated_storage = 100
  storage_encrypted = true
  db_name  = var.db_name
  username = 'wyshcare'
  password = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  backup_retention_period = 30
  backup_window           = '03:00-04:00'
  maintenance_window      = 'sun:04:00-sun:05:00'
  skip_final_snapshot     = false
  deletion_protection     = true
  tags = { Environment = var.environment }
}

resource 'aws_elasticache_cluster' 'redis' {
  cluster_id           = "wyshcare-${var.environment}"
  engine               = 'redis'
  node_type            = 'cache.t3.micro'
  num_cache_nodes      = 1
  parameter_group_name = 'default.redis7'
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  tags = { Environment = var.environment }
}
