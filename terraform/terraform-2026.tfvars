# GCP Configuration
project_id           = "techwork"      # Base project ID (year will be appended to create "techwork-2026")
use_existing_project = true            # Set to true to use existing Firebase project
existing_project_id  = "techwork-2026" # Required when use_existing_project = true
region               = "europe-west1"

# Event Configuration
year        = "2026" # Change this for each year's deployment
event_name  = "techwork"
domain_name = "techwork.events"
site_suffix = "website" # Suffix to make site name unique

# Firebase Services Configuration
enable_hosting   = true
enable_firestore = true
enable_storage   = false # Disabled temporarily due to domain verification issue
enable_auth      = false # Disabled temporarily due to quota project issue
enable_analytics = true

# Custom Domain Configuration
enable_custom_domain           = true
custom_domain_certificate_type = "GROUPED" # Valid values: GROUPED, PROJECT_GROUPED, DEDICATED

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
  "https://techwork.events",
  "https://localhost:4321",
  "https://localhost:3000"
]

# Labels for resource organization
labels = {
  environment = "production"
  team        = "techwork"
  managed_by  = "terraform"
}
