terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # State key is workspace-aware: fe/staging/terraform.tfstate, fe/production/terraform.tfstate
  backend "s3" {
    bucket               = "lumina-terraform-state-wtg"
    key                  = "fe/terraform.tfstate"
    workspace_key_prefix = "fe"
    region               = "us-east-1"
    dynamodb_table       = "lumina-terraform-locks"
    encrypt              = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "lumina"
      Component   = "frontend"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
