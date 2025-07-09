# Security & Secrets Management Guide

This guide covers all security aspects of the Cloud Nord infrastructure, including secret management with SOPS, Google Cloud authentication, and security best practices.

## 🛠️ Prerequisites Installation

### Required Tools

**macOS:**

```bash
# Install all tools at once
brew install terraform google-cloud-sdk go-task/tap/go-task node@20 age sops jq

# Or individually
brew install terraform
brew install google-cloud-sdk
brew install go-task/tap/go-task
brew install node@20
brew install age sops jq
```

**Ubuntu/Debian:**

```bash
# Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Task
sudo snap install task --classic

# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# SOPS and Age
sudo apt install age
wget https://github.com/mozilla/sops/releases/download/v3.8.1/sops-v3.8.1.linux.amd64
sudo mv sops-v3.8.1.linux.amd64 /usr/local/bin/sops
sudo chmod +x /usr/local/bin/sops

# jq
sudo apt install jq
```

### Verification

```bash
# Verify all tools are installed
terraform --version
gcloud --version
task --version
node --version
age --version
sops --version
jq --version

# Or use the automated check
task check-requirements
```

## 🔐 SOPS Secret Management

### Overview

SOPS (Secrets OPerationS) encrypts sensitive data while keeping the structure readable. Only values are encrypted, not keys, making it perfect for version control.

### Initial Setup

```bash
# Generate Age key and configure SOPS
task setup-sops
```

This command:

-   Generates an Age encryption key
-   Updates `.sops.yaml` with your public key
-   Configures environment variables

### Environment Configuration

Add to your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
export SOPS_AGE_KEY_FILE="$HOME/.config/sops/age/keys.txt"
```

Then reload:

```bash
source ~/.bashrc  # or ~/.zshrc
```

### Daily Usage

```bash
# Encrypt secrets for a year
task encrypt-secrets YEAR=2025

# Edit encrypted secrets
task edit-secrets YEAR=2025

# Deploy (automatic decryption)
task plan YEAR=2025
task apply YEAR=2025
```

### File Structure

```
terraform/
├── terraform-2025.tfvars              # Public configuration
├── terraform-2025.secrets.tfvars      # Encrypted secrets (committed)
└── terraform-2025.secrets.decrypted.tfvars  # Temporary (git ignored)
```

### Team Collaboration

#### Adding New Team Members

**New member generates key:**

```bash
task setup-sops
task show-my-public-key
```

**Team lead adds member:**

```bash
task add-team-member PUBLIC_KEY=age1abc123def456...
git add .sops.yaml terraform/*.secrets.tfvars
git commit -m "feat: add [name] to SOPS encryption"
git push
```

**New member can now work:**

```bash
git pull
task edit-secrets YEAR=2025  # Should work now
```

#### Removing Team Members

1. Edit `.sops.yaml` to remove the public key
2. Re-encrypt all secrets:
    ```bash
    find terraform -name "*.secrets.tfvars" -exec sops updatekeys {} \;
    git add .sops.yaml terraform/*.secrets.tfvars
    git commit -m "security: remove [name] from SOPS encryption"
    git push
    ```

### SOPS Troubleshooting

**Error: "no key could decrypt the data"**

```bash
# Check environment variable
echo $SOPS_AGE_KEY_FILE

# Check key file exists
ls -la $SOPS_AGE_KEY_FILE

# Reconfigure if needed
task setup-sops
```

**Error: "sops: command not found"**

```bash
# Install SOPS
brew install sops  # macOS
sudo apt install sops  # Ubuntu
```

## 🌐 Google Cloud Authentication

### Application Default Credentials Setup

```bash
# Basic authentication
gcloud auth login
gcloud auth application-default login

# Set default project
gcloud config set project cloudnord-2025
```

### Quota Project Configuration

**Problem:** "quota project not set" error

**Solution 1 (Recommended):**

```bash
# Set quota project for ADC
gcloud auth application-default set-quota-project cloudnord-2025

# Verify configuration
gcloud auth application-default print-access-token
```

**Solution 2: Re-authenticate with project:**

```bash
gcloud auth application-default login --project=cloudnord-2025
gcloud config set project cloudnord-2025
```

### Service Account Setup (Alternative)

```bash
# Create service account
gcloud iam service-accounts create terraform-sa \
    --display-name="Terraform Service Account" \
    --project=cloudnord-2025

# Assign necessary roles
gcloud projects add-iam-policy-binding cloudnord-2025 \
    --member="serviceAccount:terraform-sa@cloudnord-2025.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding cloudnord-2025 \
    --member="serviceAccount:terraform-sa@cloudnord-2025.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create ~/terraform-sa-key.json \
    --iam-account=terraform-sa@cloudnord-2025.iam.gserviceaccount.com

# Use service account
export GOOGLE_APPLICATION_CREDENTIALS=~/terraform-sa-key.json
```

### Authentication Troubleshooting

**Check current authentication:**

```bash
gcloud auth list
gcloud config get-value project
gcloud auth application-default print-access-token
```

**Test API access:**

```bash
gcloud services list --enabled --filter="name:identitytoolkit.googleapis.com"
```

**Common fixes:**

```bash
# Reset and reconfigure
gcloud auth application-default revoke
gcloud auth application-default login --project=cloudnord-2025
gcloud auth application-default set-quota-project cloudnord-2025
```

## 🛡️ Security Best Practices

### ✅ Safe to Commit

-   `.sops.yaml` (SOPS configuration)
-   `terraform-*.secrets.tfvars` (encrypted secrets)
-   `terraform-*.tfvars` (public configuration)

### ❌ Never Commit

-   `~/.config/sops/age/keys.txt` (private keys)
-   `terraform-*.secrets.decrypted.tfvars` (plaintext secrets)
-   Service account JSON keys
-   Terraform plan files with secrets

### Secret Management Guidelines

1. **Individual Keys**: Each team member has their own Age key
2. **Key Rotation**: Remove compromised keys and re-encrypt
3. **Backup Keys**: Securely backup your private Age key
4. **Environment Separation**: Use different keys for different environments
5. **Audit Trail**: Git tracks who has access via `.sops.yaml`

### CI/CD Integration

**GitHub Actions:**

```yaml
- name: Setup SOPS
  run: |
      echo "${{ secrets.SOPS_AGE_KEY }}" > /tmp/sops-key.txt
      echo "SOPS_AGE_KEY_FILE=/tmp/sops-key.txt" >> $GITHUB_ENV
```

Store the private key content in GitHub secrets as `SOPS_AGE_KEY`.

## 🚀 Quick Commands Reference

```bash
# Setup and configuration
task setup-sops                    # Initial SOPS setup
task check-requirements            # Verify all tools installed

# Secret management
task encrypt-secrets YEAR=2025     # Encrypt secrets
task edit-secrets YEAR=2025        # Edit encrypted secrets
task show-my-public-key            # Show your public key

# Team management
task add-team-member PUBLIC_KEY=<key>  # Add team member

# Authentication
gcloud auth application-default set-quota-project cloudnord-2025

# Deployment (with automatic secret decryption)
task plan YEAR=2025
task apply YEAR=2025
task destroy YEAR=2025
```

---

**Need help?** Check the [Infrastructure Guide](./INFRASTRUCTURE.md) for deployment issues or the [Development Guide](./DEVELOPMENT.md) for development environment problems.
