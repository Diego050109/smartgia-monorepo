###############################################
# ✅ SECURITY GROUP PRIVADO (para instancias privadas)
###############################################
resource "aws_security_group" "private_sg" {

  name_prefix = "${local.prefix}-private-sg-"
  description = "Allow SSH from Bastion + HTTP from ALB"
  vpc_id      = aws_vpc.main.id

  ###############################################
  # ✅ SSH SOLO desde Bastion
  ###############################################
  ingress {
    description     = "SSH from Bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  ###############################################
  # ✅ HTTP SOLO desde el ALB
  ###############################################
  ingress {
    description     = "HTTP from ALB"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ###############################################
  # ✅ Salida libre
  ###############################################
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, {
    Name = "${local.prefix}-private-sg"
  })
}

###############################################
# ✅ LAUNCH TEMPLATE (plantilla para ASG)
###############################################
resource "aws_launch_template" "smartgia_lt" {

  name_prefix = "${local.prefix}-lt-"

  # ✅ AMI FIJO (Ubuntu)
  image_id = "ami-0030e4319cbf4dbf2"

  instance_type = "t2.micro"
  key_name      = aws_key_pair.bastion_key.key_name

  # ✅ SECURITY GROUP PRIVADO
  vpc_security_group_ids = [aws_security_group.private_sg.id]

  ###############################################
  # ✅ IAM INSTANCE PROFILE (LAB) - NO CREA ROLES
  ###############################################
  iam_instance_profile {
    name = "LabInstanceProfile"
  }

  ###############################################
  # ✅ USER DATA: instala Docker + baja imágenes de ECR + levanta servicios
  ###############################################
  user_data = base64encode(<<-EOF
#!/bin/bash
set -e

exec > /var/log/user-data.log 2>&1

apt-get update -y
apt-get install -y docker.io awscli

systemctl enable docker
systemctl start docker

# Plugin docker compose (si no existe, no falla)
apt-get install -y docker-compose-plugin || true

AWS_REGION="us-east-1"
ACCOUNT_ID="286053287583"
ECR="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
REPO="smartgia-backend"

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR

cat > /opt/smartgia-compose.yml <<'YAML'
services:
  api-gateway:
    image: 286053287583.dkr.ecr.us-east-1.amazonaws.com/smartgia-backend:api-gateway
    ports:
      - "80:4000"
    environment:
      AUTH_SERVICE_URL: http://auth-service:4001
      USER_SERVICE_URL: http://user-service:4002
      ROUTINE_SERVICE_URL: http://routine-service:4003
      EXERCISE_SERVICE_URL: http://exercise-service:4004
      ATTENDANCE_SERVICE_URL: http://attendance-service:4005
      HISTORY_SERVICE_URL: http://history-service:4006
      PROGRESS_SERVICE_URL: http://progress-service:4007
      NOTIFICATION_SERVICE_URL: http://notification-service:4008
      AI_SERVICE_URL: http://ai-service:4009

  auth-service:
    image: 286053287583.dkr.ecr.us-east-1.amazonaws.com/smartgia-backend:auth-service

  user-service:
    image: 286053287583.dkr.ecr.us-east-1.amazonaws.com/smartgia-backend:user-service

  routine-service:
    image: 286053287583.dkr.ecr.us-east-1.amazonaws.com/smartgia-backend:routine-service

  exercise-service:
    image: 286053287583.dkr.ecr.us-east-1.amazonaws.com/smartgia-backend:exercise-service

  attendance-service:
    image: 286053287583.dkr.ecr.us-east-1.amazonaws.com/smartgia-backend:attendance-service

  history-service:
    image: 286053287583.dkr.ecr.us-east-1.amazonaws.com/smartgia-backend:history-service

  progress-service:
    image: 286053287583.dkr.ecr.us-east-1.amazonaws.com/smartgia-backend:progress-service

  notification-service:
    image: 286053287583.dkr.ecr.us-east-1.amazonaws.com/smartgia-backend:notification-service

  ai-service:
    image: 286053287583.dkr.ecr.us-east-1.amazonaws.com/smartgia-backend:ai-service
YAML

docker compose -f /opt/smartgia-compose.yml pull
docker compose -f /opt/smartgia-compose.yml up -d
EOF
  )

  tag_specifications {
    resource_type = "instance"

    tags = merge(local.tags, {
      Name = "${local.prefix}-asg-instance"
    })
  }

  tags = merge(local.tags, {
    Name = "${local.prefix}-launch-template"
  })
}

###############################################
# ✅ AUTO SCALING GROUP (Alta disponibilidad)
###############################################
resource "aws_autoscaling_group" "smartgia_asg" {

  name = "${local.prefix}-asg"

  desired_capacity = 2
  min_size         = 2
  max_size         = 4

  vpc_zone_identifier = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id
  ]

  ###############################################
  # ✅ TARGET GROUP EXISTENTE DEL ALB
  ###############################################
  target_group_arns = [aws_lb_target_group.tg.arn]

  health_check_type         = "ELB"
  health_check_grace_period = 60

  launch_template {
    id      = aws_launch_template.smartgia_lt.id
    version = "$Latest"
  }

  lifecycle {
    create_before_destroy = true
  }

  dynamic "tag" {
    for_each = local.tags
    content {
      key                 = tag.key
      value               = tag.value
      propagate_at_launch = true
    }
  }

  tag {
    key                 = "Name"
    value               = "${local.prefix}-asg-instance"
    propagate_at_launch = true
  }
}

