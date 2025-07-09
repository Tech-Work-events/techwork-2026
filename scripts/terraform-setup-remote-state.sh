#!/bin/bash

# ==============================================================================
# Terraform Remote State Backend Setup Script
# ==============================================================================
# 
# DESCRIPTION:
#   Sets up Google Cloud Storage as the remote backend for Terraform state.
#   Creates a GCS bucket with versioning enabled and configures Terraform
#   to use it for state storage with proper organization.
#
# USAGE:
#   ./scripts/terraform-setup-remote-state.sh
#   ./scripts/terraform-setup-remote-state.sh --help
#
# PARAMETERS:
#   None
#
# OPTIONS:
#   --help, -h        Show help message and exit
#
# EXAMPLES:
#   ./scripts/terraform-setup-remote-state.sh
#   ./scripts/terraform-setup-remote-state.sh --help
#
# PREREQUISITES:
#   - Google Cloud CLI must be installed and authenticated
#   - Active Google Cloud project must be set
#   - Storage Admin permissions on the project
#
# AUTHOR: Cloud Nord Team
# ==============================================================================

set -e

# Script configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly TERRAFORM_DIR="$PROJECT_ROOT/terraform"

# GCS configuration
readonly BUCKET_NAME="tf-states-cloudnord"
readonly BUCKET_LOCATION="europe-west1"
readonly STATE_PREFIX="terraform/state/cloudnord-website/"

# Color codes for output formatting
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[1;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_RESET='\033[0m'

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

# Print formatted messages
print_info() {
    echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $1"
}

print_success() {
    echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_RESET} $1"
}

print_warning() {
    echo -e "${COLOR_YELLOW}[WARNING]${COLOR_RESET} $1"
}

print_error() {
    echo -e "${COLOR_RED}[ERROR]${COLOR_RESET} $1" >&2
}

# Display help information
show_help() {
    cat << EOF
Terraform Remote State Backend Setup Script

DESCRIPTION:
    Sets up Google Cloud Storage as the remote backend for Terraform state.
    Creates a GCS bucket with versioning enabled and configures Terraform
    to use it for state storage with proper organization.

USAGE:
    $SCRIPT_NAME
    $SCRIPT_NAME --help|-h

OPTIONS:
    --help, -h        Show this help message and exit

EXAMPLES:
    # Set up remote state backend
    $SCRIPT_NAME

    # Show help
    $SCRIPT_NAME --help

PREREQUISITES:
    - Google Cloud CLI must be installed and authenticated
    - Active Google Cloud project must be set
    - Storage Admin permissions on the project

WHAT THIS SCRIPT DOES:
    1. Checks Google Cloud authentication and project
    2. Creates GCS bucket for Terraform state (if not exists)
    3. Enables versioning on the bucket
    4. Creates/updates backend.tf configuration
    5. Provides instructions for Terraform initialization

BUCKET CONFIGURATION:
    - Name: $BUCKET_NAME
    - Location: $BUCKET_LOCATION
    - State prefix: $STATE_PREFIX
    - Versioning: Enabled

SECURITY CONSIDERATIONS:
    - The bucket contains sensitive Terraform state
    - Access should be restricted to authorized team members
    - Consider enabling bucket-level IAM policies

For more information, see: docs/INFRASTRUCTURE.md
EOF
}

# Validate script arguments
validate_arguments() {
    if [[ "$1" == "--help" || "$1" == "-h" ]]; then
        show_help
        exit 0
    fi

    if [[ $# -gt 0 ]]; then
        print_error "This script doesn't accept arguments!"
        echo ""
        show_help
        exit 1
    fi
}

# ==============================================================================
# PREREQUISITE CHECKS
# ==============================================================================

# Check if Google Cloud CLI is installed
check_gcloud_installation() {
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud CLI is not installed!"
        print_info "Install gcloud:"
        print_info "  Visit: https://cloud.google.com/sdk/docs/install"
        print_info "  macOS: brew install google-cloud-sdk"
        print_info "  Ubuntu: sudo apt-get install google-cloud-cli"
        return 1
    fi
    
    print_success "Google Cloud CLI is installed"
    return 0
}

# Check Google Cloud authentication and project
check_gcloud_configuration() {
    print_info "Checking Google Cloud configuration..."
    
    # Check authentication
    local active_account
    active_account=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -n1)
    
    if [[ -z "$active_account" ]]; then
        print_error "Not authenticated with Google Cloud!"
        print_info "Please run: gcloud auth login"
        return 1
    fi
    
    print_success "Authenticated as: $active_account"
    
    # Check active project
    local project_id
    project_id=$(gcloud config get-value project 2>/dev/null || echo "")
    
    if [[ -z "$project_id" ]]; then
        print_error "No active Google Cloud project found!"
        print_info "Please run: gcloud config set project YOUR_PROJECT_ID"
        return 1
    fi
    
    print_success "Active project: $project_id"
    echo "$project_id"
    return 0
}

# Check if gsutil is available
check_gsutil_availability() {
    if ! command -v gsutil &> /dev/null; then
        print_error "gsutil is not available!"
        print_info "gsutil should be included with Google Cloud CLI"
        print_info "Try: gcloud components install gsutil"
        return 1
    fi
    
    print_success "gsutil is available"
    return 0
}

# Check if Terraform directory exists
check_terraform_directory() {
    if [[ ! -d "$TERRAFORM_DIR" ]]; then
        print_error "Terraform directory not found: $TERRAFORM_DIR"
        print_info "Please ensure you're running this from the project root"
        return 1
    fi
    
    if [[ ! -f "$TERRAFORM_DIR/main.tf" ]]; then
        print_error "Terraform configuration not found: $TERRAFORM_DIR/main.tf"
        print_info "Please ensure Terraform is properly set up"
        return 1
    fi
    
    print_success "Terraform directory found"
    return 0
}

# ==============================================================================
# GCS BUCKET MANAGEMENT
# ==============================================================================

# Check if GCS bucket exists
check_bucket_exists() {
    local bucket_name="$1"
    
    if gsutil ls -b "gs://$bucket_name" &>/dev/null; then
        return 0  # Bucket exists
    else
        return 1  # Bucket doesn't exist
    fi
}

# Create GCS bucket for Terraform state
create_gcs_bucket() {
    local project_id="$1"
    
    print_info "Creating GCS bucket for Terraform state..."
    
    # Create bucket
    if gsutil mb -p "$project_id" -c STANDARD -l "$BUCKET_LOCATION" "gs://$BUCKET_NAME"; then
        print_success "Bucket created: gs://$BUCKET_NAME"
    else
        print_error "Failed to create bucket"
        return 1
    fi
    
    # Enable versioning
    if gsutil versioning set on "gs://$BUCKET_NAME"; then
        print_success "Versioning enabled on bucket"
    else
        print_error "Failed to enable versioning"
        return 1
    fi
    
    return 0
}

# Set up bucket lifecycle policy (optional)
setup_bucket_lifecycle() {
    print_info "Setting up bucket lifecycle policy..."
    
    local lifecycle_config=$(cat << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 90,
          "isLive": false
        }
      }
    ]
  }
}
EOF
)
    
    echo "$lifecycle_config" | gsutil lifecycle set /dev/stdin "gs://$BUCKET_NAME"
    print_success "Lifecycle policy applied (delete old versions after 90 days)"
}

# ==============================================================================
# TERRAFORM BACKEND CONFIGURATION
# ==============================================================================

# Create or update backend.tf configuration
create_backend_configuration() {
    local backend_file="$TERRAFORM_DIR/backend.tf"
    
    print_info "Creating Terraform backend configuration..."
    
    cat > "$backend_file" << EOF
# ==============================================================================
# Terraform Backend Configuration
# ==============================================================================
# 
# This file configures Google Cloud Storage as the backend for Terraform state.
# The state is stored in a centralized location with versioning enabled.
#
# Bucket: $BUCKET_NAME
# Prefix: $STATE_PREFIX
# Location: $BUCKET_LOCATION
#
# DO NOT MODIFY THIS FILE MANUALLY
# Generated by: $SCRIPT_NAME
# ==============================================================================

terraform {
  backend "gcs" {
    bucket = "$BUCKET_NAME"
    prefix = "$STATE_PREFIX"
  }
}
EOF
    
    print_success "Backend configuration created: $(basename "$backend_file")"
}

# ==============================================================================
# NEXT STEPS DISPLAY
# ==============================================================================

# Display next steps for the user
show_next_steps() {
    local project_id="$1"
    
    echo ""
    echo "=================================================="
    echo "  Remote State Backend Setup Complete!"
    echo "=================================================="
    echo ""
    print_success "Configuration Summary:"
    echo "  Bucket: gs://$BUCKET_NAME"
    echo "  Location: $BUCKET_LOCATION"
    echo "  Project: $project_id"
    echo "  State prefix: $STATE_PREFIX"
    echo ""
    print_info "📝 Next steps:"
    echo ""
    echo "1. Initialize Terraform with the new backend:"
    echo "   cd terraform && terraform init"
    echo ""
    echo "2. If prompted about migrating state, type 'yes'"
    echo ""
    echo "3. Verify the setup:"
    echo "   terraform workspace list"
    echo ""
    print_warning "Important Security Notes:"
    echo "  - This bucket contains sensitive Terraform state"
    echo "  - Restrict access to authorized team members only"
    echo "  - Consider enabling bucket-level IAM policies"
    echo "  - State files may contain secrets and credentials"
    echo ""
    print_info "For more information, see: docs/INFRASTRUCTURE.md"
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main() {
    # Validate arguments
    validate_arguments "$@"
    
    # Display header
    echo "=================================================="
    echo "  Terraform Remote State Backend Setup"
    echo "  Cloud Nord Event Website"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    check_gcloud_installation || exit 1
    check_gsutil_availability || exit 1
    check_terraform_directory || exit 1
    
    # Get project configuration
    local project_id
    project_id=$(check_gcloud_configuration) || exit 1
    
    print_info "Configuration:"
    echo "  Project ID: $project_id"
    echo "  Bucket Name: $BUCKET_NAME"
    echo "  Location: $BUCKET_LOCATION"
    echo ""
    
    # Handle bucket creation
    if check_bucket_exists "$BUCKET_NAME"; then
        print_success "Bucket already exists: gs://$BUCKET_NAME"
    else
        create_gcs_bucket "$project_id" || exit 1
        setup_bucket_lifecycle || print_warning "Failed to set lifecycle policy (non-critical)"
    fi
    
    # Create backend configuration
    create_backend_configuration || exit 1
    
    # Show next steps
    show_next_steps "$project_id"
}

# Run main function with all arguments
main "$@"
