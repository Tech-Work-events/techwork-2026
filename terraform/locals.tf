# Local values for computed and derived configurations
locals {
  # Project configuration
  project_id   = var.use_existing_project ? var.existing_project_id : "${var.project_id}-${var.year}"
  project_name = "${var.event_name}-${var.year}"

  # Resource naming
  site_id = "${var.event_name}-${var.year}-${var.site_suffix}"

  # Common labels applied to all resources
  common_labels = merge(var.labels, {
    environment = "production"
    event       = var.event_name
    year        = var.year
    managed-by  = "terraform"
    project     = "cloudnord-website"
  })

  # Alias for backward compatibility
  labels = local.common_labels

  # Firebase APIs to enable
  firebase_apis = [
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "identitytoolkit.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "serviceusage.googleapis.com"
  ]

  # Authentication providers configuration
  auth_providers_config = {
    for provider in var.auth_providers : provider => {
      enabled = true
      config = provider == "google.com" ? {
        issuer    = "https://accounts.google.com"
        client_id = var.google_oauth_client_id
      } : {}
    }
  }

  # Storage bucket configuration
  storage_bucket_name = var.enable_storage ? "${local.project_id}-storage" : null

  # Custom domain configuration
  custom_domain_config = var.enable_custom_domain ? {
    domain_name      = var.domain_name
    certificate_type = var.custom_domain_certificate_type
  } : null
}
