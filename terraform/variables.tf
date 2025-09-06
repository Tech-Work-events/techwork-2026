variable "project_id" {
  description = "The GCP project ID (base name, year will be appended if creating new project)"
  type        = string
}

variable "billing_account_id" {
  description = "The GCP billing account ID (required only when creating new project)"
  type        = string
  default     = ""
}

variable "use_existing_project" {
  description = "Whether to use an existing Firebase project instead of creating a new one"
  type        = bool
  default     = true
}

variable "existing_project_id" {
  description = "The ID of the existing Firebase project to use (required when use_existing_project is true)"
  type        = string
  default     = ""
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "europe-west1"
}

variable "year" {
  description = "The year for the event (used for resource naming)"
  type        = string
  validation {
    condition     = can(regex("^20[0-9]{2}$", var.year))
    error_message = "Year must be in format YYYY (e.g., 2024)."
  }
}

variable "event_name" {
  description = "The name of the event"
  type        = string
  default     = "techwork"
}

variable "domain_name" {
  description = "The domain name for the website"
  type        = string
  default     = "cloudnord.fr"
}

variable "site_suffix" {
  description = "Suffix to make Firebase Hosting site name unique"
  type        = string
  default     = "website"
}

variable "enable_custom_domain" {
  description = "Enable custom domain for Firebase Hosting"
  type        = bool
  default     = true
}

variable "custom_domain_certificate_type" {
  description = "Type of SSL certificate for custom domain (GROUPED, PROJECT_GROUPED, DEDICATED, or empty)"
  type        = string
  default     = "GROUPED"

  validation {
    condition     = contains(["GROUPED", "PROJECT_GROUPED", "DEDICATED", ""], var.custom_domain_certificate_type)
    error_message = "Certificate type must be one of: GROUPED, PROJECT_GROUPED, DEDICATED, or empty string."
  }
}

variable "enable_analytics" {
  description = "Enable Google Analytics for Firebase"
  type        = bool
  default     = true
}

variable "enable_hosting" {
  description = "Enable Firebase Hosting"
  type        = bool
  default     = true
}

variable "enable_firestore" {
  description = "Enable Firestore database"
  type        = bool
  default     = true
}

variable "enable_storage" {
  description = "Enable Firebase Storage"
  type        = bool
  default     = true
}

variable "enable_auth" {
  description = "Enable Firebase Authentication"
  type        = bool
  default     = true
}

variable "firestore_location" {
  description = "The location for Firestore database"
  type        = string
  default     = "europe-west1"
}

variable "storage_location" {
  description = "The location for Firebase Storage"
  type        = string
  default     = "europe-west1"
}

variable "auth_providers" {
  description = "List of authentication providers to enable"
  type        = list(string)
  default     = ["google.com"]
}

variable "google_oauth_client_id" {
  description = "Google OAuth Client ID for Firebase Authentication"
  type        = string
  default     = ""
  sensitive   = true
}

variable "hosting_redirects" {
  description = "List of hosting redirects"
  type = list(object({
    source      = string
    destination = string
    type        = number
  }))
  default = [
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
}

variable "cors_origins" {
  description = "List of CORS origins for Firebase Storage"
  type        = list(string)
  default     = ["https://cloudnord.fr", "https://localhost:4321"]
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

# Terraform State Management
variable "state_bucket_name" {
  description = "Name of the existing GCS bucket for Terraform state storage"
  type        = string
  default     = "tf-states-cloudnord"
}

variable "state_bucket_location" {
  description = "Location for the Terraform state bucket"
  type        = string
  default     = "europe-west1"
}

variable "enable_state_bucket" {
  description = "Whether to create a GCS bucket for Terraform state storage (false for existing bucket)"
  type        = bool
  default     = false
}
