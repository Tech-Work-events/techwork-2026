# Data sources for external resources and configurations

# Data source for existing project (if using existing project)
data "google_project" "existing_project" {
  count      = var.use_existing_project ? 1 : 0
  project_id = var.existing_project_id
}

# Data source to read Firebase Web App Configuration
data "google_firebase_web_app_config" "default" {
  provider   = google-beta
  project    = google_firebase_web_app.default.project
  web_app_id = google_firebase_web_app.default.app_id

  depends_on = [google_firebase_web_app.default]
}
