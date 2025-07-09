# Infrastructure as Code - Complete Guide

This guide covers the complete setup and management of Firebase infrastructure using Terraform with year-based deployments for the Cloud Nord website.

## 🎯 Overview

The infrastructure automation provides:

-   **Existing Project Support**: Uses manually created Firebase projects
-   **Year-based Organization**: Isolated infrastructure per year (2025, 2026, etc.)
-   **Complete Firebase Stack**: Hosting, Authentication, Firestore, Storage, Analytics
-   **Custom Domain**: Automated cloudnord.fr configuration with SSL
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

-   **2024**: `cloud-nord-2024` hosting site
-   **2025**: `cloud-nord-2025` hosting site
-   **2026**: `cloud-nord-2026` hosting site

Benefits:

-   Complete isolation between years
-   Historical preservation of previous sites
-   Parallel development capabilities
-   Clear cost tracking
-   Risk mitigation

## 🚀 Quick Start

### Prerequisites

1. **Manual Setup Required**:

    - Create Firebase project manually in Firebase Console
    - Enable billing on the project
    - Verify ownership of cloudnord.fr in Google Search Console

2. **Tools Required**:

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

### Initial Setup

```bash
# 1. Complete development environment setup
task setup-dev

# 2. Configure Terraform
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edit terraform.tfvars with your Firebase project ID

# 3. Initialize Terraform
task setup
```

### Configuration

Edit `terraform/terraform.tfvars`:

```hcl
# Project Configuration
use_existing_project = true
existing_project_id  = "your-existing-firebase-project-id"

# Event Configuration
year        = "2025"
event_name  = "cloud-nord"
domain_name = "cloudnord.fr"

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

```bash
# Option 1: Complete deployment in one command
task deploy YEAR=2025

# Option 2: Step by step
task plan YEAR=2025      # See what will be created
task apply YEAR=2025     # Create the infrastructure
task update-env YEAR=2025  # Update environment variables
```

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
A    cloudnord.fr    151.101.1.195
A    cloudnord.fr    151.101.65.195
```

### Verification

```bash
# Check domain status
task show-outputs YEAR=2025

# Test domain
curl -I https://cloudnord.fr
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
-   CORS configuration for cloudnord.fr and localhost
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
