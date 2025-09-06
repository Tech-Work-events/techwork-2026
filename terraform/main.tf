# Main Terraform configuration for Techwork Firebase infrastructure
# This file contains the core Firebase resources and configuration

# Create the Firebase project (only if not using existing project)
resource "google_project" "firebase_project" {
  count           = var.use_existing_project ? 0 : 1
  name            = "${var.event_name}-${var.year}"
  project_id      = local.project_id
  billing_account = var.billing_account_id

  labels = local.common_labels

  # Prevent accidental deletion
  lifecycle {
    prevent_destroy = true
  }
}



# Wait for project and billing to be ready
resource "time_sleep" "wait_for_billing" {
  count = var.use_existing_project ? 0 : 1

  depends_on = [google_project.firebase_project]

  create_duration = "30s"
}

# Enable required APIs
resource "google_project_service" "firebase_apis" {
  for_each = toset(local.firebase_apis)

  project = local.project_id
  service = each.value

  disable_on_destroy = false

  depends_on = [
    google_project.firebase_project,
    time_sleep.wait_for_billing
  ]
}

# Initialize Firebase
resource "google_firebase_project" "default" {
  provider = google-beta
  project  = local.project_id

  depends_on = [google_project_service.firebase_apis]
}

# Firebase Web App
resource "google_firebase_web_app" "default" {
  provider     = google-beta
  project      = google_firebase_project.default.project
  display_name = "${local.project_name} Web App"

  depends_on = [google_firebase_project.default]
}



# Firebase Hosting Site
resource "google_firebase_hosting_site" "default" {
  count    = var.enable_hosting ? 1 : 0
  provider = google-beta
  project  = google_firebase_project.default.project
  site_id  = local.site_id

  depends_on = [google_firebase_project.default]
}

# Custom Domain for Firebase Hosting
resource "google_firebase_hosting_custom_domain" "default" {
  count       = var.enable_hosting && var.enable_custom_domain ? 1 : 0
  provider    = google-beta
  project     = google_firebase_project.default.project
  site_id     = google_firebase_hosting_site.default[0].site_id
  custom_domain = var.domain_name

  cert_preference = var.custom_domain_certificate_type

  depends_on = [google_firebase_hosting_site.default]
}

# Firestore Database
resource "google_firestore_database" "default" {
  count       = var.enable_firestore ? 1 : 0
  provider    = google-beta
  project     = google_firebase_project.default.project
  name        = "(default)"
  location_id = var.firestore_location
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.firebase_apis]
}

# Firebase Storage Bucket
resource "google_storage_bucket" "firebase_storage" {
  count    = var.enable_storage ? 1 : 0
  name     = "${local.project_id}-storage"
  location = var.storage_location
  project  = local.project_id

  # Enable uniform bucket-level access
  uniform_bucket_level_access = true

  # CORS configuration
  cors {
    origin          = var.cors_origins
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  # Lifecycle rules
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }

  labels = local.common_labels

  depends_on = [google_firebase_project.default]
}

# Firebase Authentication
resource "google_identity_platform_config" "auth" {
  count   = var.enable_auth ? 1 : 0
  project = google_firebase_project.default.project

  sign_in {
    allow_duplicate_emails = false

    dynamic "anonymous" {
      for_each = contains(var.auth_providers, "anonymous") ? [1] : []
      content {
        enabled = true
      }
    }

    dynamic "email" {
      for_each = contains(var.auth_providers, "password") ? [1] : []
      content {
        enabled           = true
        password_required = true
      }
    }
  }

  depends_on = [google_project_service.firebase_apis]
}

# Google OAuth Provider
resource "google_identity_platform_oauth_idp_config" "google_oauth" {
  count         = var.enable_auth && contains(var.auth_providers, "google.com") && var.google_oauth_client_id != "" ? 1 : 0
  project       = google_firebase_project.default.project
  name          = "google.com"
  display_name  = "Google"
  enabled       = true

  # Required OAuth configuration
  issuer    = "https://accounts.google.com"
  client_id = var.google_oauth_client_id

  depends_on = [google_identity_platform_config.auth]
}

# Firebase Analytics is automatically enabled when creating a Firebase project
# No additional resource needed for basic analytics


