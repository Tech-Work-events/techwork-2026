#!/bin/bash

# ==============================================================================
# Terraform Environment Setup Script
# ==============================================================================
# 
# DESCRIPTION:
#   Sets up Terraform environment for Firebase infrastructure deployment.
#   Checks prerequisites, authenticates with Google Cloud, and initializes Terraform.
#
# USAGE:
#   ./scripts/terraform-setup-environment.sh
#   ./scripts/terraform-setup-environment.sh --help
#
# PARAMETERS:
#   None
#
# OPTIONS:
#   --help, -h        Show help message and exit
#
# EXAMPLES:
#   ./scripts/terraform-setup-environment.sh
#   ./scripts/terraform-setup-environment.sh --help
#
# PREREQUISITES:
#   - Terraform must be installed
#   - Google Cloud CLI (gcloud) must be installed
#   - Google Cloud account with appropriate permissions
#
# AUTHOR: Cloud Nord Team
# ==============================================================================

set -e

# Script configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly TERRAFORM_DIR="$PROJECT_ROOT/terraform"

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
Terraform Environment Setup Script

DESCRIPTION:
    Sets up Terraform environment for Firebase infrastructure deployment.
    Checks prerequisites, authenticates with Google Cloud, and initializes Terraform.

USAGE:
    $SCRIPT_NAME
    $SCRIPT_NAME --help|-h

OPTIONS:
    --help, -h        Show this help message and exit

EXAMPLES:
    # Set up Terraform environment
    $SCRIPT_NAME

    # Show help
    $SCRIPT_NAME --help

PREREQUISITES:
    - Terraform must be installed
    - Google Cloud CLI (gcloud) must be installed
    - Google Cloud account with appropriate permissions

WHAT THIS SCRIPT DOES:
    1. Checks if Terraform and gcloud are installed
    2. Authenticates with Google Cloud (if needed)
    3. Creates terraform.tfvars from example (if needed)
    4. Initializes Terraform
    5. Validates Terraform configuration

AFTER RUNNING THIS SCRIPT:
    1. Edit terraform/terraform.tfvars with your specific values
    2. Run: task plan YEAR=2025
    3. Run: task apply YEAR=2025

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

# Check if Terraform is installed
check_terraform_installation() {
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed!"
        print_info "Install Terraform:"
        print_info "  Visit: https://developer.hashicorp.com/terraform/downloads"
        print_info "  macOS: brew install terraform"
        print_info "  Ubuntu: sudo apt-get install terraform"
        return 1
    fi
    
    local version
    version=$(terraform version -json 2>/dev/null | jq -r '.terraform_version' 2>/dev/null || terraform version | head -n1 | cut -d' ' -f2)
    print_success "Terraform is installed (version: $version)"
    return 0
}

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
    
    local version
    version=$(gcloud version --format="value(Google Cloud SDK)" 2>/dev/null | head -n1)
    print_success "Google Cloud CLI is installed (version: $version)"
    return 0
}

# Check if jq is available (optional but helpful)
check_jq_availability() {
    if ! command -v jq &> /dev/null; then
        print_warning "jq is not installed (optional but recommended)"
        print_info "Install jq:"
        print_info "  macOS: brew install jq"
        print_info "  Ubuntu: sudo apt-get install jq"
    else
        print_success "jq is available"
    fi
}

# ==============================================================================
# GOOGLE CLOUD AUTHENTICATION
# ==============================================================================

# Check Google Cloud authentication status
check_gcloud_authentication() {
    print_info "Checking Google Cloud authentication..."
    
    local active_account
    active_account=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -n1)
    
    if [[ -z "$active_account" ]]; then
        print_warning "Not authenticated with Google Cloud"
        return 1
    else
        print_success "Authenticated as: $active_account"
        return 0
    fi
}

# Authenticate with Google Cloud
authenticate_gcloud() {
    print_info "Starting Google Cloud authentication..."
    
    print_info "Authenticating user account..."
    if ! gcloud auth login; then
        print_error "Failed to authenticate user account"
        return 1
    fi
    
    print_info "Setting up application default credentials..."
    if ! gcloud auth application-default login; then
        print_error "Failed to set up application default credentials"
        return 1
    fi
    
    print_success "Google Cloud authentication completed"
}

# ==============================================================================
# TERRAFORM CONFIGURATION
# ==============================================================================

# Set up Terraform configuration files
setup_terraform_configuration() {
    print_info "Setting up Terraform configuration..."
    
    cd "$TERRAFORM_DIR" || {
        print_error "Could not change to Terraform directory: $TERRAFORM_DIR"
        return 1
    }
    
    # Check if terraform.tfvars exists
    if [[ ! -f "terraform.tfvars" ]]; then
        if [[ -f "terraform.tfvars.example" ]]; then
            print_info "Creating terraform.tfvars from example..."
            cp "terraform.tfvars.example" "terraform.tfvars"
            print_success "terraform.tfvars created from example"
            
            print_warning "Please edit terraform.tfvars with your specific values:"
            print_info "  - billing_account_id: Your GCP billing account ID"
            print_info "  - project_id: Your base project ID"
            print_info "  - year: The year for deployment"
            echo ""
            read -p "Press Enter to continue after editing terraform.tfvars..." -r
        else
            print_error "terraform.tfvars.example not found!"
            return 1
        fi
    else
        print_success "terraform.tfvars already exists"
    fi
    
    cd "$PROJECT_ROOT" || return 1
}

# Initialize Terraform
initialize_terraform() {
    print_info "Initializing Terraform..."
    
    cd "$TERRAFORM_DIR" || {
        print_error "Could not change to Terraform directory: $TERRAFORM_DIR"
        return 1
    }
    
    if terraform init; then
        print_success "Terraform initialized successfully"
    else
        print_error "Terraform initialization failed"
        return 1
    fi
    
    cd "$PROJECT_ROOT" || return 1
}

# Validate Terraform configuration
validate_terraform_configuration() {
    print_info "Validating Terraform configuration..."
    
    cd "$TERRAFORM_DIR" || {
        print_error "Could not change to Terraform directory: $TERRAFORM_DIR"
        return 1
    }
    
    if terraform validate; then
        print_success "Terraform configuration is valid"
    else
        print_error "Terraform configuration validation failed"
        return 1
    fi
    
    cd "$PROJECT_ROOT" || return 1
}

# ==============================================================================
# NEXT STEPS DISPLAY
# ==============================================================================

# Display next steps for the user
show_next_steps() {
    echo ""
    echo "=================================================="
    echo "  Setup Completed Successfully!"
    echo "=================================================="
    echo ""
    print_success "Terraform environment is ready for use"
    echo ""
    print_info "📝 Next steps:"
    echo ""
    echo "1. Review and edit terraform/terraform.tfvars with your specific values"
    echo "2. Plan infrastructure changes:"
    echo "   task plan YEAR=2025"
    echo "3. Apply infrastructure changes:"
    echo "   task apply YEAR=2025"
    echo "4. Update environment variables:"
    echo "   task update-env YEAR=2025"
    echo ""
    print_info "Alternative: Use the deployment script:"
    echo "   task deploy YEAR=2025"
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
    echo "  Terraform Environment Setup"
    echo "  Cloud Nord Event Website"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    check_terraform_installation || exit 1
    check_gcloud_installation || exit 1
    check_jq_availability
    
    # Handle Google Cloud authentication
    if ! check_gcloud_authentication; then
        authenticate_gcloud || exit 1
    fi
    
    # Set up Terraform
    setup_terraform_configuration || exit 1
    initialize_terraform || exit 1
    validate_terraform_configuration || exit 1
    
    # Show next steps
    show_next_steps
}

# Run main function with all arguments
main "$@"
