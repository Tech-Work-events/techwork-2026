output "project_id" {
  description = "The Firebase project ID"
  value       = var.project_id
}

output "hosting_site_id" {
  description = "Firebase Hosting site ID"
  value       = var.enable_hosting ? "${var.event_name}-${var.year}" : null
}

output "hosting_url" {
  description = "Firebase Hosting URL"
  value       = var.enable_hosting ? "https://${var.event_name}-${var.year}.web.app" : null
}

output "firestore_security_rules_applied" {
  description = "Whether Firestore security rules have been applied"
  value       = var.enable_firestore ? true : false
}

output "storage_public_access_configured" {
  description = "Whether Storage public access has been configured"
  value       = var.enable_storage ? true : false
}

output "hosting_version_name" {
  description = "Firebase Hosting version name"
  value       = var.enable_hosting ? google_firebase_hosting_version.default[0].name : null
}

output "hosting_release_name" {
  description = "Firebase Hosting release name"
  value       = var.enable_hosting ? google_firebase_hosting_release.default[0].name : null
}

output "year" {
  description = "The year this module was deployed for"
  value       = var.year
}
