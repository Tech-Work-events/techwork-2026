# Security configuration for Firebase services

# Firestore Security Rules
resource "google_firestore_document" "security_rules" {
  count       = var.enable_firestore ? 1 : 0
  project     = google_firebase_project.default.project
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

  depends_on = [google_firestore_database.default]
}

# Storage bucket IAM for public read access
resource "google_storage_bucket_iam_member" "public_read" {
  count  = var.enable_storage ? 1 : 0
  bucket = google_storage_bucket.firebase_storage[0].name
  role   = "roles/storage.objectViewer"
  member = "allUsers"

  depends_on = [google_storage_bucket.firebase_storage]
}
