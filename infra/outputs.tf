output "bucket_name" {
  description = "S3 bucket holding the built site (feed to deploy workflow as FE_BUCKET_*)"
  value       = aws_s3_bucket.site.id
}

output "distribution_id" {
  description = "CloudFront distribution ID (feed to deploy workflow as FE_DIST_ID_*)"
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain" {
  description = "CloudFront domain name (*.cloudfront.net)"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions OIDC (feed to deploy workflow as AWS_FE_DEPLOY_ROLE_ARN secret)"
  value       = aws_iam_role.fe_deploy.arn
}

output "site_url" {
  description = "Public URL of the site"
  value       = "https://${var.fe_subdomain}.${var.domain_name}"
}
