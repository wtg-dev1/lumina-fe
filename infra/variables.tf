variable "environment" {
  description = "Environment name (staging or production)"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be staging or production."
  }
}

variable "aws_region" {
  description = "AWS region (must be us-east-1 — ACM for CloudFront requires it)"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Root domain name (e.g. luminatherapyalliance.com)"
  type        = string
}

variable "fe_subdomain" {
  description = "Subdomain for the frontend (e.g. 'ops' for prod, 'ops-staging' for staging)"
  type        = string
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for the domain"
  type        = string
}

variable "github_org" {
  description = "GitHub organization or username for OIDC trust"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name for the frontend (e.g. lumina-fe)"
  type        = string
}
