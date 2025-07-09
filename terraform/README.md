# Firebase Infrastructure as Code

This Terraform configuration automates the deployment of Firebase infrastructure for the Cloud Nord website, designed to work with existing Firebase projects while automating all service configuration.

## Overview

This setup supports:

-   **Existing Firebase Project**: Uses your manually created Firebase project
-   **Automated Service Configuration**: Enables and configures Firebase services
-   **Year-based Organization**: Supports multiple deployments with year-based naming
-   **Custom Domain Support**: Configures cloudnord.fr domain with SSL
-   **Infrastructure as Code**: All infrastructure defined and versioned in code

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Existing Firebase Project                │
│                  (Manually Created)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Terraform Managed Resources                  │
├─────────────────────────────────────────────────────────────┤
│ • Firebase Hosting (with custom domain)                    │
│ • Firestore Database                                       │
│ • Firebase Storage                                         │
│ • Firebase Authentication                                  │
│ • Firebase Analytics                                       │
│ • API Enablement                                          │
│ • Security Rules                                          │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### Manual Setup Required

1. **Firebase Project**: Create a Firebase project manually in the Firebase Console
2. **Billing Account**: Ensure the project has billing enabled
3. **Domain Ownership**: Verify ownership of cloudnord.fr in Google Search Console

### Tools Required

-   Terraform >= 1.0
-   Google Cloud CLI (gcloud)
-   Firebase CLI (for deployment)
-   jq (for JSON processing)

## Quick Start

### 1. Setup Development Environment

```bash
task setup-dev
```

### 2. Configure Terraform

```bash
# Copy and edit configuration
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Edit with your values
vim terraform/terraform.tfvars
```

### 3. Deploy Infrastructure

```bash
# Plan deployment
task plan YEAR=2025

# Apply changes
task apply YEAR=2025

# Update environment variables
task update-env YEAR=2025
```

### 4. Deploy Website

```bash
task deploy-web YEAR=2025
```

## Configuration

### Required Variables

Edit `terraform/terraform.tfvars`:

```hcl
# Project Configuration
use_existing_project = true
existing_project_id  = "your-firebase-project-id"

# Event Configuration
year        = "2025"
event_name  = "cloud-nord"
domain_name = "cloudnord.fr"

# Custom Domain
enable_custom_domain = true
```

### Key Configuration Options

| Variable               | Description                   | Default  |
| ---------------------- | ----------------------------- | -------- |
| `use_existing_project` | Use existing Firebase project | `true`   |
| `existing_project_id`  | Your Firebase project ID      | Required |
| `enable_custom_domain` | Enable cloudnord.fr domain    | `true`   |
| `enable_hosting`       | Enable Firebase Hosting       | `true`   |
| `enable_firestore`     | Enable Firestore database     | `true`   |
| `enable_storage`       | Enable Firebase Storage       | `true`   |
| `enable_auth`          | Enable Firebase Auth          | `true`   |

## Year-based Deployments

The system supports multiple year-based deployments:

```bash
# Deploy for 2025
task deploy YEAR=2025

# Deploy for 2026 (future)
task deploy YEAR=2026

# List all deployments
task list-workspaces
```

Each year creates:

-   Separate Terraform workspace
-   Year-specific hosting site (`cloud-nord-2025`)
-   Isolated configuration files

## Custom Domain Setup

### Automatic Configuration

When `enable_custom_domain = true`, Terraform will:

1. Create Firebase Hosting custom domain
2. Configure SSL certificate (managed by Google)
3. Set up domain verification

### Manual Steps Required

1. **Domain Verification**: Verify cloudnord.fr ownership in Google Search Console
2. **DNS Configuration**: Point your domain to Firebase Hosting
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

## Firebase Services

### Hosting

-   **Site ID**: `cloud-nord-{year}`
-   **Custom Domain**: `cloudnord.fr`
-   **SSL**: Managed by Google
-   **Redirects**: Configured for sponsoring, FAQ, etc.

### Firestore

-   **Location**: `europe-west1`
-   **Type**: Native mode
-   **Security Rules**: Configured for public read, authenticated write

### Storage

-   **Location**: `europe-west1`
-   **CORS**: Configured for cloudnord.fr and localhost
-   **Lifecycle**: 365-day retention

### Authentication

-   **Providers**: Google OAuth
-   **Configuration**: Anonymous and email/password optional

## State Management

Terraform state is stored in Google Cloud Storage:

-   **Bucket**: `tf-states-cloudnord` (existing)
-   **Prefix**: `terraform/state/cloudnord-website/`
-   **Workspace**: Year-based isolation

## Security

### Best Practices Implemented

-   Terraform state in remote backend
-   Sensitive outputs marked as sensitive
-   Resource labels for organization
-   Firestore security rules
-   CORS configuration for storage

### Security Rules

```javascript
// Firestore Rules (automatically applied)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read, authenticated write
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Project Not Found

```text
Error: Project not found: your-project-id
```

**Solution**: Verify `existing_project_id` in terraform.tfvars

#### 2. API Not Enabled

```text
Error: Firebase API not enabled
```

**Solution**: APIs are enabled automatically, wait for propagation

#### 3. Domain Verification Failed

```text
Error: Domain verification required
```

**Solution**: Verify domain ownership in Google Search Console

#### 4. Billing Not Enabled

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

## Deployment Workflow

### Complete Deployment

```bash
# 1. Setup (one-time)
task setup

# 2. Deploy infrastructure
task deploy YEAR=2025

# 3. Deploy website
task deploy-web YEAR=2025

# 4. Verify deployment
curl -I https://cloudnord.fr
```

### Development Workflow

```bash
# Start development
task start

# Build and test
task build
task preview

# Deploy when ready
task full-deploy YEAR=2025
```

## Support

### Documentation

-   [Terraform Firebase Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/firebase_project)
-   [Firebase Hosting](https://firebase.google.com/docs/hosting)
-   [Custom Domains](https://firebase.google.com/docs/hosting/custom-domain)

### Getting Help

1. Check this README
2. Review Terraform documentation
3. Check Firebase Console for service status
4. Use `task help` for available commands
