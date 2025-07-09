# Terraform Configuration
terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.9"
    }
  }

  # Remote state configuration
  backend "gcs" {
    bucket = "tf-states-cloudnord"
    prefix = "terraform/state/cloudnord-website/"
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = local.project_id
  region  = var.region

  # Default labels for all resources
  default_labels = merge(var.labels, {
    managed-by = "terraform"
    project    = "cloudnord-website"
    year       = var.year
  })
}

# Configure the Google Cloud Beta Provider
provider "google-beta" {
  project = local.project_id
  region  = var.region

  # Default labels for all resources
  default_labels = merge(var.labels, {
    managed-by = "terraform"
    project    = "cloudnord-website"
    year       = var.year
  })
}

# Time provider for delays and scheduling
provider "time" {
  # No specific configuration needed
}
