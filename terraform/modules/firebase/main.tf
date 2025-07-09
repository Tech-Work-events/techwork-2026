# Local values
locals {
  project_name = "${var.event_name}-${var.year}"
}

# Firestore Security Rules
resource "google_firestore_document" "security_rules" {
  count       = var.enable_firestore ? 1 : 0
  project     = var.project_id
  collection  = "security_rules"
  document_id = "firestore_rules"
  
  fields = jsonencode({
    rules = {
      stringValue = <<-EOT
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Users can read and write their own data
            match /users/{userId} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
            
            // Allow authenticated users to read public data
            match /public/{document=**} {
              allow read: if true;
              allow write: if request.auth != null;
            }
            
            // Sessions and schedule data - read for all, write for authenticated users
            match /sessions/{sessionId} {
              allow read: if true;
              allow write: if request.auth != null;
            }
            
            // Event data - read for all
            match /events/{eventId} {
              allow read: if true;
              allow write: if request.auth != null;
            }
          }
        }
      EOT
    }
  })
}

# Firebase Storage Security Rules
resource "google_storage_bucket_iam_member" "public_read" {
  count  = var.enable_storage ? 1 : 0
  bucket = "${var.project_id}.appspot.com"
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Firestore Indexes for better query performance
resource "google_firestore_index" "user_sessions_index" {
  count      = var.enable_firestore ? 1 : 0
  project    = var.project_id
  database   = "(default)"
  collection = "users"
  
  fields {
    field_path = "uid"
    order      = "ASCENDING"
  }
  
  fields {
    field_path = "sessions"
    order      = "ASCENDING"
  }
}

resource "google_firestore_index" "sessions_index" {
  count      = var.enable_firestore ? 1 : 0
  project    = var.project_id
  database   = "(default)"
  collection = "sessions"
  
  fields {
    field_path = "track"
    order      = "ASCENDING"
  }
  
  fields {
    field_path = "startTime"
    order      = "ASCENDING"
  }
}

# Firebase Hosting configuration
resource "google_firebase_hosting_version" "default" {
  count    = var.enable_hosting ? 1 : 0
  provider = google-beta
  site_id  = "${var.event_name}-${var.year}"
  
  config {
    # Redirects configuration
    dynamic "redirects" {
      for_each = var.hosting_redirects
      content {
        glob         = redirects.value.source
        status_code  = redirects.value.type
        location     = redirects.value.destination
      }
    }
    
    # Headers for security
    headers {
      glob = "**"
      headers = {
        "X-Content-Type-Options" = "nosniff"
        "X-Frame-Options"        = "DENY"
        "X-XSS-Protection"       = "1; mode=block"
        "Strict-Transport-Security" = "max-age=31536000; includeSubDomains"
        "Referrer-Policy"        = "strict-origin-when-cross-origin"
        "Content-Security-Policy" = "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; media-src 'self' https:; object-src 'none'; frame-src 'self' https:;"
      }
    }
    
    # Cache headers for static assets
    headers {
      glob = "**/*.{js,css,png,jpg,jpeg,gif,ico,svg,woff,woff2,ttf,eot}"
      headers = {
        "Cache-Control" = "public, max-age=31536000, immutable"
      }
    }
    
    # HTML files should not be cached
    headers {
      glob = "**/*.html"
      headers = {
        "Cache-Control" = "public, max-age=0, must-revalidate"
      }
    }
  }
}

# Firebase Hosting release
resource "google_firebase_hosting_release" "default" {
  count        = var.enable_hosting ? 1 : 0
  provider     = google-beta
  site_id      = "${var.event_name}-${var.year}"
  version_name = google_firebase_hosting_version.default[0].name
  message      = "Deployed via Terraform for ${var.year}"
}
