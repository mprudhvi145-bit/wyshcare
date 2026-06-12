resource 'aws_vpc' 'main' {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "wyshcare-${var.environment}", Environment = var.environment }
}

resource 'aws_subnet' 'private' {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "wyshcare-private-${count.index}", Environment = var.environment }
}

resource 'aws_subnet' 'public' {
  count                   = 3
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index + 3)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "wyshcare-public-${count.index}", Environment = var.environment }
}

resource 'aws_internet_gateway' 'main' {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "wyshcare-${var.environment}", Environment = var.environment }
}

resource 'aws_eip' 'nat' {
  domain = 'vpc'
  tags   = { Name = "wyshcare-nat-${var.environment}" }
}

resource 'aws_nat_gateway' 'main' {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  tags          = { Name = "wyshcare-${var.environment}" }
}

data 'aws_availability_zones' 'available' {
  state = 'available'
}

output 'vpc_id'            { value = aws_vpc.main.id }
output 'private_subnets'   { value = aws_subnet.private[*].id }
output 'public_subnets'    { value = aws_subnet.public[*].id }
