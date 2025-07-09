# GCP Configuration
project_id          = "cloudnord"  # Base project ID (year will be appended)
use_existing_project = true       # Set to true if using existing Firebase project
existing_project_id = "cloudnord-2025"           # Required if use_existing_project = true
region             = "europe-west1"

# Event Configuration
year = "2025"  # Change this for each year's deployment
event_name  = "cloud-nord"
domain_name = "cloudnord.fr"
site_suffix = "website"  # Suffix to make site name unique

# Firebase Services Configuration
enable_hosting    = true
enable_firestore  = true
enable_storage    = false  # Disabled temporarily due to domain verification issue
enable_auth       = false  # Disabled temporarily due to quota project issue
enable_analytics  = true

# Custom Domain Configuration
enable_custom_domain = true
custom_domain_certificate_type = "GROUPED"  # Valid values: GROUPED, PROJECT_GROUPED, DEDICATED

# Locations
firestore_location = "europe-west1"
storage_location   = "europe-west1"

# Authentication Providers
auth_providers = ["google.com"]

# Google OAuth Configuration (leave empty to disable OAuth)
google_oauth_client_id = ""

# Hosting Configuration
hosting_redirects = [
  {
    source      = "/sponsoring"
    destination = "https://docs.google.com/presentation/d/1sciaOrYSHTAZNhAUc1llxIJiHBjTlD-BCPLcEKGK0Q4/preview"
    type        = 302
  },
  {
    source      = "/sponsoring/en"
    destination = "https://docs.google.com/presentation/d/1CkW-yAcO7HZc-HbwUCtezigkIEVmM55XiGlHso_7IQA/preview"
    type        = 302
  },
  {
    source      = "/faq"
    destination = "https://openplanner.fr/public/event/GB9qNr4UMNsQHd0F8uYu/faq/"
    type        = 302
  },
  {
    source      = "/gladia"
    destination = "https://openplanner.fr/public/event/GB9qNr4UMNsQHd0F8uYu/transcription"
    type        = 302
  }
]

# CORS Origins for Storage
cors_origins = [
  "https://techwork.fr",
  "https://localhost:4321",
  "https://localhost:3000"
]

# Labels for resource organization
labels = {
  environment = "production"
  team        = "tech-work"
  managed_by  = "terraform"
}
