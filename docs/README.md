# Cloud Nord Firebase Infrastructure - Documentation

Welcome to the Cloud Nord Firebase infrastructure documentation. This guide covers everything you need to deploy and manage the Cloud Nord website infrastructure using modern Infrastructure as Code practices.

## 🚀 Quick Start

### Prerequisites

-   [Terraform](https://terraform.io) >= 1.5
-   [Google Cloud CLI](https://cloud.google.com/sdk)
-   [Task](https://taskfile.dev) (modern alternative to shell scripts)
-   [Node.js](https://nodejs.org) >= 20 (for website development)

### Installation

```bash
# macOS
brew install terraform google-cloud-sdk go-task/tap/go-task node@20

# Ubuntu/Debian
sudo apt install terraform google-cloud-cli nodejs npm
sudo snap install task --classic
```

### Setup

```bash
# Complete development environment setup
task setup-dev

# Or step by step
task setup          # Initialize Terraform
task install        # Install Node.js dependencies
```

## 📚 Documentation Structure

### 🏗️ [Infrastructure Guide](./INFRASTRUCTURE.md)

Complete guide for Firebase infrastructure deployment:

-   **Architecture Overview**: Year-based organization and Firebase services
-   **Deployment Workflows**: Step-by-step infrastructure deployment
-   **Custom Domain Setup**: Automated cloudnord.fr configuration
-   **Security Configuration**: Firestore rules, IAM, and CORS
-   **State Management**: Remote state with GCS backend
-   **Troubleshooting**: Common issues and solutions

### 🛠️ [Development Guide](./DEVELOPMENT.md)

Modern development workflow using Taskfile:

-   **Taskfile Introduction**: Why we use Task instead of shell scripts
-   **Development Commands**: Local development server, build, and testing
-   **Infrastructure Management**: Plan, apply, and destroy commands
-   **Environment Configuration**: Automated environment variable management
-   **Advanced Usage**: Custom variables and task customization
-   **Migration Guide**: From old shell scripts to Taskfile

### 🔐 [Security & Secrets Guide](./SECURITY.md)

Comprehensive security practices:

-   **SOPS Encryption**: Secure secret management with Age encryption
-   **Team Collaboration**: Multi-user secret sharing workflows
-   **Google Cloud Authentication**: ADC configuration and troubleshooting
-   **Installation & Setup**: Tools installation and initial configuration
-   **Best Practices**: Security guidelines and common pitfalls

## 🎯 Common Workflows

### First-Time Setup

```bash
# 1. Install prerequisites (see Security Guide)
task setup-dev

# 2. Configure Firebase project
cp terraform/terraform.tfvars.example terraform/terraform-2025.tfvars
# Edit with your Firebase project ID

# 3. Setup secrets (optional)
task setup-sops
task encrypt-secrets YEAR=2025
```

### Daily Development

```bash
# Start development server
task start

# Build and preview
task build
task preview

# Deploy infrastructure
task deploy YEAR=2025

# Deploy website
task deploy-web YEAR=2025
```

### Infrastructure Management

```bash
# Deploy new year
task deploy YEAR=2026

# Update existing infrastructure
task plan YEAR=2025
task apply YEAR=2025

# Clean up old infrastructure
task destroy YEAR=2023
```

## 🌐 Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│               Firebase Project (Manual)                     │
│                  cloudnord-2025                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Terraform Managed Resources                  │
├─────────────────────────────────────────────────────────────┤
│ • Firebase Hosting (cloud-nord-2025-website)               │
│ • Custom Domain (cloudnord.fr)                             │
│ • Firestore Database                                       │
│ • Firebase Storage                                          │
│ • Firebase Authentication                                   │
│ • Security Rules & IAM                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Key Features

-   **Year-based Organization**: Isolated infrastructure per event year
-   **Existing Project Support**: Uses manually created Firebase projects
-   **Complete Firebase Stack**: Hosting, Auth, Firestore, Storage, Analytics
-   **Custom Domain**: Automated SSL certificate management
-   **Security Best Practices**: SOPS encryption, proper IAM, security rules
-   **Modern Tooling**: Taskfile for automation, Terraform for IaC
-   **Team Collaboration**: Multi-user secret sharing with SOPS

## 📞 Support & Troubleshooting

### Common Issues

1. **Authentication Problems**: See [Security Guide - Google Cloud Auth](./SECURITY.md#google-cloud-authentication)
2. **SOPS Encryption Issues**: See [Security Guide - SOPS Troubleshooting](./SECURITY.md#sops-troubleshooting)
3. **Infrastructure Deployment**: See [Infrastructure Guide - Troubleshooting](./INFRASTRUCTURE.md#troubleshooting)
4. **Development Environment**: See [Development Guide - Troubleshooting](./DEVELOPMENT.md#troubleshooting)

### Getting Help

```bash
# Show all available tasks
task

# Show detailed help
task help

# Validate configuration
task validate

# Check requirements
task check-requirements
```

## 🎉 What's New

This documentation consolidates and modernizes the Cloud Nord infrastructure:

-   **Simplified Structure**: 3 focused guides instead of 7 scattered files
-   **Unified Language**: Consistent English documentation
-   **Modern Tooling**: Taskfile replaces complex shell scripts
-   **Better Organization**: Logical grouping of related topics
-   **Improved Navigation**: Clear cross-references and workflows

---

**Ready to get started?** Begin with the [Infrastructure Guide](./INFRASTRUCTURE.md) for deployment or the [Development Guide](./DEVELOPMENT.md) for local development.
