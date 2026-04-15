# ------------------------------------------------------------------------------
# CloudFront distribution fronting the private S3 bucket.
# - Origin Access Control (OAC) so only this distribution can read from S3
# - SPA routing: 403/404 → /index.html 200
# - Long cache for /assets/*, no cache for /index.html
# ------------------------------------------------------------------------------

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "lumina-ops-${var.environment}-oac"
  description                       = "OAC for lumina-ops ${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Managed cache policy IDs — AWS-provided, stable.
# CachingOptimized: compress, long TTL, no query strings
# CachingDisabled: no cache
locals {
  managed_cache_policy_caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  managed_cache_policy_caching_disabled  = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "lumina-ops ${var.environment}"
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # NA + EU

  aliases = ["${var.fe_subdomain}.${var.domain_name}"]

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-site"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  # Default: fingerprinted Vite assets — long cache, compressed
  default_cache_behavior {
    target_origin_id       = "s3-site"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.managed_cache_policy_caching_optimized
  }

  # /index.html must never be cached (it references fingerprinted assets)
  ordered_cache_behavior {
    path_pattern           = "/index.html"
    target_origin_id       = "s3-site"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = local.managed_cache_policy_caching_disabled
  }

  # SPA routing — any S3 miss (deep link) returns index.html
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = { Name = "lumina-ops-${var.environment}" }
}
