# Infrastructure as Code - Complete Guide

This guide covers the complete setup and management of Firebase infrastructure using Terraform with year-based deployments for the Techwork website.

## 🎯 Overview

The infrastructure automation provides:

-   **Existing Project Support**: Uses manually created Firebase projects
-   **Year-based Organization**: Isolated infrastructure per year (2025, 2026, etc.)
-   **Complete Firebase Stack**: Hosting, Authentication, Firestore, Storage, Analytics
-   **Custom Domain**: Automated techwork.events configuration with SSL
-   **Security Best Practices**: Proper IAM, security rules, and CORS configuration
-   **Taskfile Integration**: Modern YAML-based task management

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│               Existing Firebase Project                     │
│                  (Manually Created)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Terraform Managed Resources                  │
├─────────────────────────────────────────────────────────────┤
│ • Firebase Hosting (with custom domain)                     │
│ • Firestore Database                                        │
│ • Firebase Storage                                          │
│ • Firebase Authentication                                   │
│ • Firebase Analytics                                        │
│ • API Enablement                                            │
│ • Security Rules                                            │
└─────────────────────────────────────────────────────────────┘
```

### Year-based Organization

Each year gets its own isolated infrastructure:

-   **2024**: `techwork-2024` hosting site
-   **2025**: `techwork-2025` hosting site
-   **2026**: `techwork-2026` hosting site

Benefits:

-   Complete isolation between years
-   Historical preservation of previous sites
-   Parallel development capabilities
-   Clear cost tracking
-   Risk mitigation

## 🚀 Quick Start

### Prerequisites

1. **Tools Required**:

    ```bash
    # Install Task (recommended)
    brew install go-task/tap/go-task

    # Install Terraform
    brew install terraform

    # Install Google Cloud CLI
    curl https://sdk.cloud.google.com | bash

    # Install jq for JSON processing
    brew install jq
    ```

2. **Google Cloud Project Setup**:

    - Create Firebase project manually in Firebase Console (e.g., `techwork-2026`)
    - Enable billing on the project
    - Verify ownership of your domain in Google Search Console

### Initial Setup

**⚠️ IMPORTANT: Complete these steps before running `task deploy YEAR=XXXX`**

#### 1. Google Cloud Authentication Setup

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set up application default credentials (required for Terraform)
gcloud auth application-default login

# Configure the default project (replace with your project ID)
gcloud config set project techwork-2026

# Verify authentication and project access
gcloud projects describe techwork-2026
```

**Expected output:** You should see project details including project ID, name, and number.

#### 2. Verify Permissions

```bash
# Check your IAM roles on the project
gcloud projects get-iam-policy techwork-2026 \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:$(gcloud config get-value account)"
```

**Required roles:** You need at least `roles/owner` or `roles/editor` on the project.

#### 3. Google Cloud Storage Backend Setup

```bash
# Create the GCS bucket for Terraform state storage
gsutil mb -p techwork-2026 -c STANDARD -l europe-west1 gs://tf-states-techwork

# Enable versioning for state file protection
gsutil versioning set on gs://tf-states-techwork

# Verify bucket access
gsutil ls gs://tf-states-techwork
```

#### 4. Terraform Backend Initialization

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform with the new backend
terraform init -reconfigure

# Verify initialization was successful
terraform workspace list
```

**Expected output:** You should see `* default` workspace listed.

#### 5. Configuration Setup

```bash
# Copy and edit configuration (if not already done)
cp terraform/terraform.tfvars.example terraform/terraform-YEAR.tfvars
# Edit terraform-YEAR.tfvars with your specific values

# Set up secrets file (will be created automatically on first run)
# The deploy command will prompt you to configure secrets if needed
```

### Troubleshooting Authentication Issues

**Problem:** `Permission denied` errors during deployment

**Solutions:**

1. **Re-authenticate:**

    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```

2. **Check project access:**

    ```bash
    gcloud projects list --filter="projectId:techwork-2026"
    ```

3. **Verify bucket permissions:**
    ```bash
    gsutil iam get gs://tf-states-techwork
    ```

**Problem:** `Backend configuration changed` error

**Solution:**

```bash
terraform init -reconfigure
```

**Problem:** `Bucket doesn't exist` error

**Solution:**

```bash
gsutil mb -p techwork-2026 gs://tf-states-techwork
terraform init -reconfigure
```

### Configuration

Edit `terraform/terraform.tfvars`:

```hcl
# Project Configuration
use_existing_project = true
existing_project_id  = "your-existing-firebase-project-id"

# Event Configuration
year        = "2025"
event_name  = "techwork"
domain_name = "techwork.events"

# Custom Domain
enable_custom_domain = true
custom_domain_certificate_type = "MANAGED"

# Services Configuration
enable_hosting    = true
enable_firestore  = true
enable_storage    = true
enable_auth       = true
enable_analytics  = true
```

### Deploy Infrastructure

**⚠️ Prerequisites:** Ensure you have completed all steps in the "Initial Setup" section above.

```bash
# Option 1: Complete deployment in one command
task deploy YEAR=2026

# Option 2: Step by step
task plan YEAR=2026      # See what will be created
task apply YEAR=2026     # Create the infrastructure
task update-env YEAR=2026  # Update environment variables
```

**First-time deployment checklist:**

-   ✅ Google Cloud authentication configured
-   ✅ Application default credentials set up
-   ✅ Project permissions verified (owner/editor role)
-   ✅ GCS bucket created for Terraform state
-   ✅ Terraform backend initialized
-   ✅ Configuration files created and edited

### Deploy Website

```bash
# Deploy website to Firebase Hosting
task deploy-web YEAR=2025

# Or complete deployment (infrastructure + website)
task full-deploy YEAR=2025
```

## 🔧 Management Commands

### Infrastructure Management

```bash
# Deploy new year
task deploy YEAR=2026

# Update existing year
task plan YEAR=2025
task apply YEAR=2025

# Destroy old year (when no longer needed)
task destroy YEAR=2023

# List all workspaces
task list-workspaces

# Show outputs for specific year
task show-outputs YEAR=2025
```

### Validation and Maintenance

```bash
# Validate Terraform configuration
task validate

# Format Terraform files
task format

# Clean temporary files
task clean

# Show help
task help
```

## 🌐 Custom Domain Setup

### Automatic Configuration

When `enable_custom_domain = true`, Terraform automatically:

1. Creates Firebase Hosting custom domain
2. Configures managed SSL certificate
3. Sets up domain verification

### Manual DNS Configuration

Point your domain to Firebase Hosting:

```text
A    techwork.events    151.101.1.195
A    techwork.events    151.101.65.195
```

### Verification

```bash
# Check domain status
task show-outputs YEAR=2025

# Test domain
curl -I https://techwork.events
```

## 🔐 Security Features

### Firestore Security Rules

Automatically configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read, authenticated write
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // User-specific data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Firebase Storage

-   Public read access for images and assets
-   CORS configuration for techwork.events and localhost
-   Automatic lifecycle management (365-day retention)

### Firebase Hosting

-   Security headers (CSP, HSTS, X-Frame-Options)
-   Cache optimization for static assets
-   Custom redirects support

## 📊 State Management

### Remote State Configuration

-   **Bucket**: `tf-states-cloudnord` (existing)
-   **Prefix**: `terraform/state/cloudnord-website/`
-   **Workspace**: Year-based isolation

### Benefits

-   Team collaboration with shared state
-   Year isolation with separate state files
-   Automatic state backup
-   State locking prevents concurrent modifications

## 🔄 CI/CD Integration

### GitHub Actions

Update your workflows with the new Firebase configuration:

1. **Secrets** (sensitive data):

    - `FIREBASE_API_KEY`
    - `FIREBASE_SERVICE_ACCOUNT_*`

2. **Variables** (non-sensitive):
    - `FIREBASE_PROJECT_ID`
    - `FIREBASE_AUTH_DOMAIN`
    - `FIREBASE_STORAGE_BUCKET`

### Environment Variables

After deployment, Terraform outputs are automatically converted to environment variables:

```bash
# Update .env file
task update-env YEAR=2025

# Update specific environment file
task update-env YEAR=2025 ENV_FILE=.env.production
```

## 🛠️ Troubleshooting

### Common Issues

1. **Project Not Found**

    ```text
    Error: Project not found: your-project-id
    ```

    **Solution**: Verify `existing_project_id` in terraform.tfvars

2. **API Not Enabled**

    ```text
    Error: Firebase API not enabled
    ```

    **Solution**: APIs are enabled automatically, wait for propagation

3. **Domain Verification Failed**

    ```text
    Error: Domain verification required
    ```

    **Solution**: Verify domain ownership in Google Search Console

4. **Billing Not Enabled**

    ```text
    Error: Billing account required
    ```

    **Solution**: Enable billing on your Firebase project

### Debug Commands

```bash
# Check Terraform state
terraform workspace list
terraform state list

# Validate configuration
task validate

# Check outputs
task show-outputs YEAR=2025
```

## 📚 Additional Resources

-   [Terraform Firebase Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/firebase_project)
-   [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
-   [Custom Domain Setup](https://firebase.google.com/docs/hosting/custom-domain)
-   [Terraform Workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces)

## 💡 Best Practices

1. **Always plan first**: Run `task plan YEAR=2025` before applying
2. **Use workspaces**: Keep years isolated with Terraform workspaces
3. **Version control**: Never commit sensitive data in `terraform.tfvars`
4. **Regular backups**: Export Firestore data regularly
5. **Monitor costs**: Set up billing alerts for each project
6. **Clean up**: Destroy old infrastructure when no longer needed

---

**Need help?** Check the [Development Guide](./DEVELOPMENT.md), [Security Guide](./SECURITY.md), or the detailed [Terraform documentation](../terraform/README.md). For a complete overview, see the [Main Documentation](./README.md).
