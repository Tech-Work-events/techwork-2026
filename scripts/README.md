# Scripts Directory

This directory contains refactored and improved scripts for managing the Techwork Event Website infrastructure and deployment. All scripts have been redesigned with comprehensive documentation, error handling, and consistent interfaces.

## 📋 Script Overview

### 🔐 SOPS Encryption Scripts

#### `sops-setup-encryption.sh`

**Purpose**: Sets up SOPS (Secrets OPerationS) encryption for secure secrets management.

**Usage**:

```bash
./scripts/sops-setup-encryption.sh
./scripts/sops-setup-encryption.sh --help
```

**What it does**:

-   Checks if Age and SOPS are installed
-   Generates Age encryption keys
-   Creates .sops.yaml configuration
-   Sets up environment variables

**Prerequisites**: Age and SOPS must be installed

#### `sops-add-team-member.sh`

**Purpose**: Adds a new team member's Age public key to SOPS encryption configuration.

**Usage**:

```bash
./scripts/sops-add-team-member.sh <age_public_key>
./scripts/sops-add-team-member.sh --help
```

**What it does**:

-   Validates the Age public key format
-   Updates .sops.yaml with the new key
-   Re-encrypts all existing secrets files
-   Provides next steps for team collaboration

**Prerequisites**: SOPS must be configured, .sops.yaml must exist

### 🏗️ Terraform Infrastructure Scripts

#### `terraform-setup-environment.sh`

**Purpose**: Sets up Terraform environment for Firebase infrastructure deployment.

**Usage**:

```bash
./scripts/terraform-setup-environment.sh
./scripts/terraform-setup-environment.sh --help
```

**What it does**:

-   Checks Terraform and gcloud installation
-   Authenticates with Google Cloud
-   Creates terraform.tfvars from example
-   Initializes and validates Terraform

**Prerequisites**: Terraform and Google Cloud CLI must be installed

#### `terraform-setup-remote-state.sh`

**Purpose**: Sets up Google Cloud Storage as the remote backend for Terraform state.

**Usage**:

```bash
./scripts/terraform-setup-remote-state.sh
./scripts/terraform-setup-remote-state.sh --help
```

**What it does**:

-   Creates GCS bucket for Terraform state
-   Enables versioning on the bucket
-   Creates backend.tf configuration
-   Sets up lifecycle policies

**Prerequisites**: Google Cloud CLI authenticated, Storage Admin permissions

#### `terraform-deploy-infrastructure.sh`

**Purpose**: Deploys Firebase infrastructure using Terraform for a specific year.

**Usage**:

```bash
./scripts/terraform-deploy-infrastructure.sh <year> [action]
./scripts/terraform-deploy-infrastructure.sh --help
```

**Parameters**:

-   `year`: The year for the event (e.g., 2024, 2025)
-   `action`: Terraform action - plan, apply, or destroy (default: plan)

**What it does**:

-   Manages Terraform workspaces by year
-   Validates configuration files
-   Executes Terraform operations with proper error handling
-   Saves outputs for environment variable updates

**Prerequisites**: Terraform initialized, configuration files exist

#### `terraform-update-environment.sh`

**Purpose**: Updates environment variables from Terraform outputs after infrastructure deployment.

**Usage**:

```bash
./scripts/terraform-update-environment.sh <year>
./scripts/terraform-update-environment.sh --help
```

**What it does**:

-   Reads Terraform outputs for Firebase configuration
-   Updates .env file with new values
-   Creates backup of existing .env file
-   Preserves non-Terraform environment variables

**Prerequisites**: Terraform deployed, outputs available, jq installed

#### `terraform-validate-configuration.sh`

**Purpose**: Validates Terraform configuration files and performs security checks.

**Usage**:

```bash
./scripts/terraform-validate-configuration.sh [year]
./scripts/terraform-validate-configuration.sh --help
./scripts/terraform-validate-configuration.sh --fix
```

**Options**:

-   `--fix`: Automatically fix formatting issues
-   `year`: Optional year to validate specific configuration files

**What it does**:

-   Validates Terraform syntax
-   Checks code formatting
-   Validates year-specific configuration files
-   Performs basic security checks
-   Provides comprehensive validation summary

**Prerequisites**: Terraform installed and initialized

## 🚀 Quick Reference

### Common Workflows

#### Initial Setup

```bash
# Set up Terraform environment
./scripts/terraform-setup-environment.sh

# Set up remote state backend
./scripts/terraform-setup-remote-state.sh

# Set up SOPS encryption
./scripts/sops-setup-encryption.sh
```

#### Infrastructure Deployment

```bash
# Plan infrastructure for 2025
./scripts/terraform-deploy-infrastructure.sh 2025 plan

# Deploy infrastructure for 2025
./scripts/terraform-deploy-infrastructure.sh 2025 apply

# Update environment variables
./scripts/terraform-update-environment.sh 2025
```

#### Team Collaboration

```bash
# New team member sets up SOPS
./scripts/sops-setup-encryption.sh

# Team lead adds new member (replace with actual public key)
./scripts/sops-add-team-member.sh age1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef
```

#### Validation and Maintenance

```bash
# Validate all configurations
./scripts/terraform-validate-configuration.sh

# Validate specific year and fix formatting
./scripts/terraform-validate-configuration.sh 2025 --fix

# Destroy infrastructure for old year
./scripts/terraform-deploy-infrastructure.sh 2024 destroy
```

## 🔧 Script Features

### Consistent Interface

-   All scripts support `--help` or `-h` for detailed usage information
-   Consistent parameter validation and error messages
-   Standardized exit codes and error handling

### Comprehensive Documentation

-   Detailed description of purpose and functionality
-   Clear usage examples and parameter explanations
-   Prerequisites and dependency information
-   Next steps and workflow guidance

### Robust Error Handling

-   Input validation for all parameters
-   Prerequisite checks before execution
-   Graceful error messages with actionable guidance
-   Proper cleanup on failure

### Security Best Practices

-   SOPS integration for secrets management
-   Validation of sensitive file encryption
-   Security pattern detection
-   Safe handling of credentials

### User Experience

-   Color-coded output for better readability
-   Progress indicators and status messages
-   Backup creation for destructive operations
-   Clear success/failure reporting

## 📖 Integration with Taskfile

All scripts are integrated with the project's Taskfile.yml for easy execution:

```bash
# Using Taskfile (recommended)
task setup-sops
task deploy YEAR=2025
task update-env YEAR=2025

# Direct script execution (advanced)
./scripts/sops-setup-encryption.sh
./scripts/terraform-deploy-infrastructure.sh 2025 apply
./scripts/terraform-update-environment.sh 2025
```

## 🆘 Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure scripts are executable (`chmod +x scripts/*.sh`)
2. **Missing Prerequisites**: Run `--help` on any script to see requirements
3. **Authentication Issues**: Check Google Cloud authentication with `gcloud auth list`
4. **SOPS Errors**: Verify SOPS_AGE_KEY_FILE environment variable is set
5. **Terraform Issues**: Ensure Terraform is initialized and workspaces exist

### Getting Help

-   Run any script with `--help` for detailed usage information
-   Check the main project documentation in `docs/`
-   Use `task help` for Taskfile integration guidance

## 📝 Migration Notes

### Script Renaming

The following scripts have been renamed for better clarity:

| Old Name                | New Name                              | Purpose                      |
| ----------------------- | ------------------------------------- | ---------------------------- |
| `add-team-member.sh`    | `sops-add-team-member.sh`             | SOPS team management         |
| `setup-sops.sh`         | `sops-setup-encryption.sh`            | SOPS encryption setup        |
| `setup-terraform.sh`    | `terraform-setup-environment.sh`      | Terraform environment setup  |
| `setup-remote-state.sh` | `terraform-setup-remote-state.sh`     | Remote state backend setup   |
| `deploy.sh`             | `terraform-deploy-infrastructure.sh`  | Infrastructure deployment    |
| `update-env.sh`         | `terraform-update-environment.sh`     | Environment variable updates |
| `validate.sh`           | `terraform-validate-configuration.sh` | Configuration validation     |

### Taskfile Updates

The Taskfile.yml has been updated to reference the new script names. All existing task commands continue to work without changes.

---

For more detailed information about infrastructure management, see `docs/INFRASTRUCTURE.md`.
