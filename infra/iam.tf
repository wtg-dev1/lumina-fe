# ------------------------------------------------------------------------------
# GitHub Actions OIDC deploy role for the frontend repo.
#
# The OIDC *provider* is account-wide and is created by the backend Terraform
# (lumina-be/infra/iam.tf). We reference it by data source here rather than
# creating a duplicate — AWS allows only one provider per URL per account.
# ------------------------------------------------------------------------------

# OIDC provider ARNs are deterministic given the account ID and issuer URL,
# so we construct the ARN rather than calling iam:ListOpenIDConnectProviders
# (which the terraform-admin user isn't entitled to).
data "aws_caller_identity" "current" {}

locals {
  github_oidc_provider_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
}

resource "aws_iam_role" "fe_deploy" {
  name = "lumina-fe-${var.environment}-github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "sts:AssumeRoleWithWebIdentity"
      Principal = {
        Federated = local.github_oidc_provider_arn
      }
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:*"
        }
      }
    }]
  })

  tags = { Name = "lumina-fe-${var.environment}-github-actions" }
}

resource "aws_iam_role_policy" "fe_deploy" {
  name = "lumina-fe-${var.environment}-deploy"
  role = aws_iam_role.fe_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "S3ListBucket"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = [aws_s3_bucket.site.arn]
      },
      {
        Sid    = "S3Objects"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = ["${aws_s3_bucket.site.arn}/*"]
      },
      {
        Sid    = "CloudFrontInvalidate"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:GetDistribution"
        ]
        Resource = [aws_cloudfront_distribution.site.arn]
      }
    ]
  })
}
