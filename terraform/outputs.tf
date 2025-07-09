output "project_id" {
  description = "The Firebase project ID"
  value       = google_firebase_project.default.project
}

output "project_number" {
  description = "The Firebase project number"
  value       = google_firebase_project.default.project_number
}

output "firebase_config" {
  description = "Firebase configuration for the web app"
  value = {
    apiKey             = data.google_firebase_web_app_config.default.api_key
    authDomain         = data.google_firebase_web_app_config.default.auth_domain
    databaseURL        = data.google_firebase_web_app_config.default.database_url
    projectId          = google_firebase_project.default.project
    storageBucket      = data.google_firebase_web_app_config.default.storage_bucket
    messagingSenderId  = data.google_firebase_web_app_config.default.messaging_sender_id
    appId              = google_firebase_web_app.default.app_id
    measurementId      = data.google_firebase_web_app_config.default.measurement_id
  }
  sensitive = true
}

output "hosting_site_id" {
  description = "Firebase Hosting site ID"
  value       = var.enable_hosting ? google_firebase_hosting_site.default[0].site_id : null
}

output "hosting_url" {
  description = "Firebase Hosting URL"
  value       = var.enable_hosting ? "https://${google_firebase_hosting_site.default[0].site_id}.web.app" : null
}

output "custom_domain_url" {
  description = "Custom domain URL for Firebase Hosting"
  value       = var.enable_hosting && var.enable_custom_domain ? "https://${var.domain_name}" : null
}

output "custom_domain_verification" {
  description = "Custom domain verification information"
  value = var.enable_hosting && var.enable_custom_domain ? {
    domain_name = google_firebase_hosting_custom_domain.default[0].custom_domain
    status      = google_firebase_hosting_custom_domain.default[0].cert_preference
  } : null
}

output "storage_bucket_name" {
  description = "Firebase Storage bucket name"
  value       = var.enable_storage ? google_storage_bucket.firebase_storage[0].name : null
}

output "firestore_database_name" {
  description = "Firestore database name"
  value       = var.enable_firestore ? google_firestore_database.default[0].name : null
}

output "web_app_id" {
  description = "Firebase Web App ID"
  value       = google_firebase_web_app.default.app_id
}

output "year" {
  description = "The year this infrastructure was deployed for"
  value       = var.year
}

output "environment_variables" {
  description = "Environment variables for the application"
  value = {
    FIREBASE_API_KEY             = data.google_firebase_web_app_config.default.api_key
    FIREBASE_AUTH_DOMAIN         = data.google_firebase_web_app_config.default.auth_domain
    FIREBASE_DATABASE_URL        = data.google_firebase_web_app_config.default.database_url
    FIREBASE_PROJECT_ID          = google_firebase_project.default.project
    FIREBASE_STORAGE_BUCKET      = data.google_firebase_web_app_config.default.storage_bucket
    FIREBASE_MESSAGING_SENDER_ID = data.google_firebase_web_app_config.default.messaging_sender_id
    FIREBASE_APP_ID              = google_firebase_web_app.default.app_id
    FIREBASE_MEASUREMENT_ID      = data.google_firebase_web_app_config.default.measurement_id
  }
  sensitive = true
}

# Additional useful outputs
output "gcp_region" {
  description = "The GCP region used for deployment"
  value       = var.region
}

output "labels" {
  description = "Labels applied to resources"
  value       = local.labels
}

# Terraform State Management outputs
output "terraform_state_bucket_name" {
  description = "Name of the existing GCS bucket used for Terraform state storage"
  value       = var.state_bucket_name
}

output "terraform_state_bucket_url" {
  description = "URL of the existing GCS bucket used for Terraform state storage"
  value       = "gs://${var.state_bucket_name}"
}
