# Development Guide

This guide covers the complete development workflow for the Techwork website, including both web development and infrastructure management using the modern Taskfile approach.

## 🎯 What is Taskfile?

Taskfile replaces traditional shell scripts with a modern, structured approach:

-   **YAML Syntax**: Clear and readable configuration
-   **Dependency Management**: Automatic task dependencies
-   **Variables & Templating**: Built-in variable support
-   **Integrated Documentation**: Description for each task
-   **Parameter Validation**: Automatic parameter validation

## 📦 Installation

### Install Task

```bash
# macOS
brew install go-task/tap/go-task

# Linux
sudo snap install task --classic
# or
sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d

# Windows
choco install go-task
# or
scoop install task
```

### Verify Installation

```bash
task --version
```

## 🚀 Quick Start Commands

### Initial Setup

```bash
# Show all available tasks
task

# Show detailed help
task help

# Complete development environment setup
task setup-dev

# Terraform setup only
task setup
```

### Development Workflow

```bash
# Quick start (install + dev server)
task start

# Install dependencies
task install

# Development server
task dev

# Build for production
task build

# Preview build locally
task preview

# Linting and testing
task lint
task test

# Clean up
task clean-web      # Clean build artifacts
task clean-deps     # Clean Node.js dependencies
```

### Infrastructure Management

```bash
# Plan infrastructure deployment
task plan YEAR=2025

# Deploy infrastructure
task apply YEAR=2025

# Complete deployment (plan + apply + update-env)
task deploy YEAR=2025

# Update environment variables
task update-env YEAR=2025

# Destroy infrastructure for a year
task destroy YEAR=2024
```

### Website Deployment

```bash
# Deploy website to Firebase Hosting
task deploy-web YEAR=2025

# Complete deployment: infrastructure + website
task full-deploy YEAR=2025
```

### Validation and Maintenance

```bash
# Validate Terraform configuration
task validate

# Format Terraform files
task format

# Clean temporary files
task clean

# List Terraform workspaces
task list-workspaces

# Show outputs for a year
task show-outputs YEAR=2025
```

## 📋 Complete Workflows

### 1. First-Time Development Setup

```bash
# Complete environment setup
task setup-dev
```

This task:

-   ✅ Checks Node.js installation
-   ✅ Checks Terraform and gcloud installation
-   ✅ Installs Node.js dependencies
-   ✅ Prepares development environment

### 2. Daily Development Workflow

```bash
# Quick start development server
task start

# Or clean start (cleans everything first)
task fresh-start
```

### 3. Build and Test Workflow

```bash
# Production build
task build

# Local preview
task preview

# Run tests and linting
task lint
task test
```

### 4. Infrastructure Setup (One-time per year)

```bash
# Initialize Terraform
task setup
```

This task:

-   ✅ Checks Terraform and gcloud installation
-   ✅ Authenticates with Google Cloud
-   ✅ Initializes Terraform
-   ✅ Creates `terraform.tfvars` from example

### 5. Infrastructure Deployment

```bash
# Step by step deployment
task plan YEAR=2025      # See what will be created
task apply YEAR=2025     # Create infrastructure
task update-env YEAR=2025  # Update environment variables

# Or complete deployment in one command
task deploy YEAR=2025
```

### 6. Complete Deployment Workflow

```bash
# Deploy everything: infrastructure + website
task full-deploy YEAR=2025
```

This task:

-   ✅ Deploys Firebase infrastructure
-   ✅ Builds website for production
-   ✅ Deploys to Firebase Hosting
-   ✅ Updates environment variables

### 7. Multi-Year Management

```bash
# Deploy for 2026 in parallel
task full-deploy YEAR=2026

# List active workspaces
task list-workspaces

# Clean up 2023 infrastructure
task destroy YEAR=2023
```

## 🔧 Advanced Usage

### Custom Environment Variables

```bash
# Update specific environment file
task update-env YEAR=2025 ENV_FILE=.env.production

# Update staging environment
task update-env YEAR=2025 ENV_FILE=.env.staging
```

### Manual Environment Variable Updates

For manual updates to environment variables (when automatic updates from Terraform outputs are not available):

```bash
# 1. Decrypt the encrypted environment file
task decrypt-env

# 2. Remove the encrypted file to avoid conflicts
rm .env-encrypted

# 3. Edit the .env file with your preferred editor
nano .env  # or vim, code, etc.

# 4. Encrypt the updated file
task encrypt-env

# Alternative: Use the guided workflow
task update-env-manual
```

**Note:** This manual workflow is more reliable than the automated SOPS editor integration and provides better control over the editing process.

### Validation and Debug

```bash
# Validate configuration before deployment
task validate

# Format files automatically
task format

# Show outputs for specific year
task show-outputs YEAR=2025
```

### Cleanup

```bash
# Clean temporary files
task clean

# Completely remove infrastructure for a year
task destroy YEAR=2024
```

## 📊 Task Structure

### Configuration Tasks

-   `setup-dev` - Complete development environment setup
-   `setup` - Terraform initialization
-   `check-requirements` - Check prerequisites
-   `authenticate-gcloud` - Google Cloud authentication
-   `validate` - Configuration validation

### Development Tasks

-   `install` - Install Node.js dependencies
-   `dev` - Start development server
-   `build` - Production build
-   `preview` - Preview build locally
-   `lint` - Run linting
-   `test` - Run tests
-   `start` - Quick start (install + dev)
-   `fresh-start` - Clean start

### Infrastructure Tasks

-   `plan` - Plan infrastructure changes
-   `apply` - Apply infrastructure changes
-   `deploy` - Complete infrastructure deployment
-   `destroy` - Destroy infrastructure

### Deployment Tasks

-   `deploy-web` - Deploy website to Firebase
-   `full-deploy` - Complete deployment (infrastructure + website)
-   `update-env` - Update environment variables

### Utility Tasks

-   `clean` - Clean temporary files
-   `clean-web` - Clean web build artifacts
-   `clean-deps` - Clean Node.js dependencies
-   `format` - Format Terraform files
-   `list-workspaces` - List Terraform workspaces
-   `show-outputs` - Show Terraform outputs

## 🎨 Taskfile vs Shell Scripts

### Advantages of Taskfile

| Aspect            | Shell Scripts         | Taskfile               |
| ----------------- | --------------------- | ---------------------- |
| **Readability**   | Complex bash syntax   | Clear YAML structure   |
| **Dependencies**  | Manual management     | Automatic dependencies |
| **Variables**     | Complex export/source | Built-in variables     |
| **Documentation** | Scattered comments    | Description per task   |
| **Validation**    | Manual validation     | Automatic validation   |
| **Reusability**   | Code duplication      | Modular tasks          |
| **Maintenance**   | Hard to maintain      | Clear structure        |

### Migration from Scripts

Old scripts are still available in `scripts/` but Taskfile is now recommended:

```bash
# Old: ./scripts/deploy.sh 2025 apply
# New: task apply YEAR=2025

# Old: ./scripts/update-env.sh 2025
# New: task update-env YEAR=2025

# Old: ./scripts/setup-terraform.sh
# New: task setup
```

## 🛠️ Customization

### Custom Variables

You can define custom variables in the Taskfile:

```yaml
vars:
    MY_CUSTOM_VAR: 'value'

tasks:
    my-task:
        cmds:
            - echo "{{.MY_CUSTOM_VAR}}"
```

### Custom Tasks

Add your own tasks for specific needs:

```yaml
tasks:
    deploy-staging:
        desc: 'Deploy to staging environment'
        cmds:
            - task: apply
              vars: { YEAR: '2025' }
            - task: update-env
              vars: { YEAR: '2025', ENV_FILE: '.env.staging' }
```

## 🔍 Troubleshooting

### Common Issues

1. **Task not found**

    ```bash
    # Check installation
    task --version

    # Reinstall if necessary
    brew install go-task/tap/go-task
    ```

2. **Variables not defined**

    ```bash
    # Always specify YEAR for deployment tasks
    task plan YEAR=2025
    ```

3. **Terraform errors**

    ```bash
    # Validate first
    task validate

    # Then retry
    task plan YEAR=2025
    ```

## 📚 Resources

-   [Official Task Documentation](https://taskfile.dev/)
-   [Infrastructure Guide](./INFRASTRUCTURE.md)
-   [Security & Secrets Guide](./SECURITY.md)
-   [Terraform Documentation](../terraform/README.md)
-   [Main Documentation](./README.md)

## 🎉 Conclusion

The Taskfile significantly simplifies Firebase infrastructure management:

-   **Simpler** than shell scripts
-   **More robust** with automatic validation
-   **More maintainable** with YAML structure
-   **Better documented** with integrated descriptions

Start with `task setup-dev` and follow the instructions! 🚀
