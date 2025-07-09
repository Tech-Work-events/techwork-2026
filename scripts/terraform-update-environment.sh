#!/bin/bash

# ==============================================================================
# Terraform Environment Variables Update Script
# ==============================================================================
# 
# DESCRIPTION:
#   Updates environment variables from Terraform outputs after infrastructure
#   deployment. Reads Terraform outputs and updates the .env file with
#   Firebase configuration values.
#
# USAGE:
#   ./scripts/terraform-update-environment.sh <year>
#   ./scripts/terraform-update-environment.sh --help
#
# PARAMETERS:
#   year          The year for the event (e.g., 2024, 2025)
#
# OPTIONS:
#   --help, -h    Show help message and exit
#
# EXAMPLES:
#   ./scripts/terraform-update-environment.sh 2025
#   ./scripts/terraform-update-environment.sh --help
#
# PREREQUISITES:
#   - Terraform must be initialized and infrastructure deployed
#   - Terraform outputs must be available for the specified year
#   - .env file must exist in the project root
#
# AUTHOR: Cloud Nord Team
# ==============================================================================

set -e

# Script configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly TERRAFORM_DIR="$PROJECT_ROOT/terraform"
readonly ENV_FILE="$PROJECT_ROOT/.env"

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
Terraform Environment Variables Update Script

DESCRIPTION:
    Updates environment variables from Terraform outputs after infrastructure
    deployment. Reads Terraform outputs and updates the .env file with
    Firebase configuration values.

USAGE:
    $SCRIPT_NAME <year>
    $SCRIPT_NAME --help|-h

PARAMETERS:
    year          The year for the event (e.g., 2024, 2025)

OPTIONS:
    --help, -h    Show this help message and exit

EXAMPLES:
    # Update environment variables for 2025
    $SCRIPT_NAME 2025

    # Show help
    $SCRIPT_NAME --help

PREREQUISITES:
    - Terraform must be initialized and infrastructure deployed
    - Terraform outputs must be available for the specified year
    - .env file must exist in the project root

WHAT THIS SCRIPT DOES:
    1. Validates the year parameter and prerequisites
    2. Switches to the correct Terraform workspace
    3. Reads Terraform outputs for Firebase configuration
    4. Updates the .env file with new values
    5. Preserves existing environment variables not managed by Terraform

ENVIRONMENT VARIABLES UPDATED:
    - FIREBASE_PROJECT_ID: The Firebase project ID
    - FIREBASE_API_KEY: The Firebase web API key
    - FIREBASE_AUTH_DOMAIN: The Firebase auth domain
    - FIREBASE_STORAGE_BUCKET: The Firebase storage bucket
    - FIREBASE_MESSAGING_SENDER_ID: The Firebase messaging sender ID
    - FIREBASE_APP_ID: The Firebase app ID

For more information, see: docs/INFRASTRUCTURE.md
EOF
}

# Validate script arguments
validate_arguments() {
    if [[ "$1" == "--help" || "$1" == "-h" ]]; then
        show_help
        exit 0
    fi

    if [[ $# -eq 0 ]]; then
        print_error "Year is required!"
        echo ""
        show_help
        exit 1
    fi

    if [[ $# -gt 1 ]]; then
        print_error "Too many arguments provided!"
        echo ""
        show_help
        exit 1
    fi
}

# Validate year format
validate_year() {
    local year="$1"
    
    if [[ ! "$year" =~ ^20[0-9]{2}$ ]]; then
        print_error "Year must be in format YYYY (e.g., 2024, 2025)"
        return 1
    fi
    
    return 0
}

# ==============================================================================
# PREREQUISITE CHECKS
# ==============================================================================

# Check if Terraform is available and initialized
check_terraform_prerequisites() {
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed!"
        print_info "Run: ./scripts/terraform-setup-environment.sh"
        return 1
    fi
    
    if [[ ! -d "$TERRAFORM_DIR/.terraform" ]]; then
        print_error "Terraform not initialized!"
        print_info "Run: cd terraform && terraform init"
        return 1
    fi
    
    print_success "Terraform prerequisites met"
    return 0
}

# Check if .env file exists
check_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        print_error ".env file not found: $ENV_FILE"
        print_info "Please create a .env file in the project root"
        return 1
    fi
    
    print_success ".env file found"
    return 0
}

# Check if jq is available for JSON parsing
check_jq_availability() {
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed!"
        print_info "Install jq:"
        print_info "  macOS: brew install jq"
        print_info "  Ubuntu: sudo apt-get install jq"
        return 1
    fi
    
    print_success "jq is available"
    return 0
}

# ==============================================================================
# TERRAFORM OPERATIONS
# ==============================================================================

# Switch to the correct Terraform workspace
switch_terraform_workspace() {
    local year="$1"
    
    print_info "Switching to Terraform workspace: $year"
    
    cd "$TERRAFORM_DIR" || {
        print_error "Could not change to Terraform directory: $TERRAFORM_DIR"
        return 1
    }
    
    # Check if workspace exists
    if terraform workspace list | grep -q "\\b$year\\b"; then
        terraform workspace select "$year"
        print_success "Switched to workspace: $year"
    else
        print_error "Terraform workspace '$year' not found!"
        print_info "Available workspaces:"
        terraform workspace list
        print_info "Deploy infrastructure first: ./scripts/terraform-deploy-infrastructure.sh $year apply"
        return 1
    fi
    
    cd "$PROJECT_ROOT" || return 1
    return 0
}

# Get Terraform outputs
get_terraform_outputs() {
    print_info "Reading Terraform outputs..."
    
    cd "$TERRAFORM_DIR" || return 1
    
    local outputs_json
    if ! outputs_json=$(terraform output -json 2>/dev/null); then
        print_error "Failed to read Terraform outputs!"
        print_info "Make sure infrastructure is deployed: ./scripts/terraform-deploy-infrastructure.sh apply"
        return 1
    fi
    
    cd "$PROJECT_ROOT" || return 1
    
    # Check if outputs are empty
    if [[ "$outputs_json" == "{}" || -z "$outputs_json" ]]; then
        print_error "No Terraform outputs found!"
        print_info "Make sure infrastructure is deployed and outputs are defined"
        return 1
    fi
    
    print_success "Terraform outputs retrieved"
    echo "$outputs_json"
    return 0
}

# Extract specific value from Terraform outputs
extract_output_value() {
    local outputs_json="$1"
    local key="$2"
    
    local value
    value=$(echo "$outputs_json" | jq -r ".$key.value // empty" 2>/dev/null)
    
    if [[ -z "$value" || "$value" == "null" ]]; then
        return 1
    fi
    
    echo "$value"
    return 0
}

# ==============================================================================
# ENVIRONMENT FILE MANAGEMENT
# ==============================================================================

# Update or add environment variable in .env file
update_env_variable() {
    local key="$1"
    local value="$2"
    local env_file="$3"
    
    # Escape special characters in value for sed
    local escaped_value
    escaped_value=$(printf '%s\n' "$value" | sed 's/[[\.*^$()+?{|]/\\&/g')
    
    if grep -q "^$key=" "$env_file"; then
        # Update existing variable
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^$key=.*/$key=$escaped_value/" "$env_file"
        else
            # Linux
            sed -i "s/^$key=.*/$key=$escaped_value/" "$env_file"
        fi
        print_info "  Updated: $key"
    else
        # Add new variable
        echo "$key=$value" >> "$env_file"
        print_info "  Added: $key"
    fi
}

# Update environment variables from Terraform outputs
update_environment_variables() {
    local year="$1"
    local outputs_json="$2"
    
    print_info "Updating environment variables..."
    
    # Create backup of .env file
    local backup_file="$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$ENV_FILE" "$backup_file"
    print_info "Created backup: $(basename "$backup_file")"
    
    # Define the mapping of Terraform outputs to environment variables
    declare -A env_mappings=(
        ["firebase_project_id"]="FIREBASE_PROJECT_ID"
        ["firebase_api_key"]="FIREBASE_API_KEY"
        ["firebase_auth_domain"]="FIREBASE_AUTH_DOMAIN"
        ["firebase_storage_bucket"]="FIREBASE_STORAGE_BUCKET"
        ["firebase_messaging_sender_id"]="FIREBASE_MESSAGING_SENDER_ID"
        ["firebase_app_id"]="FIREBASE_APP_ID"
    )
    
    local updated_count=0
    local failed_count=0
    
    # Update each environment variable
    for terraform_key in "${!env_mappings[@]}"; do
        local env_key="${env_mappings[$terraform_key]}"
        local value
        
        if value=$(extract_output_value "$outputs_json" "$terraform_key"); then
            update_env_variable "$env_key" "$value" "$ENV_FILE"
            ((updated_count++))
        else
            print_warning "  Skipped: $env_key (no Terraform output: $terraform_key)"
            ((failed_count++))
        fi
    done
    
    print_success "Environment update completed"
    print_info "  Updated: $updated_count variables"
    if [[ $failed_count -gt 0 ]]; then
        print_warning "  Skipped: $failed_count variables"
    fi
}

# ==============================================================================
# NEXT STEPS DISPLAY
# ==============================================================================

# Display next steps for the user
show_next_steps() {
    local year="$1"
    
    echo ""
    echo "=================================================="
    echo "  Environment Variables Updated!"
    echo "=================================================="
    echo ""
    print_success "Firebase configuration updated for year $year"
    echo ""
    print_info "📝 Next steps:"
    echo ""
    echo "1. Review the updated .env file:"
    echo "   cat .env"
    echo ""
    echo "2. Test the website locally:"
    echo "   task dev"
    echo ""
    echo "3. Deploy the website:"
    echo "   task deploy-web YEAR=$year"
    echo ""
    print_info "The .env file has been updated with Firebase configuration from Terraform."
    print_info "A backup was created in case you need to restore previous values."
    echo ""
    print_info "For more information, see: docs/INFRASTRUCTURE.md"
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main() {
    local year="$1"
    
    # Validate arguments
    validate_arguments "$@"
    validate_year "$year" || exit 1
    
    # Display header
    echo "=================================================="
    echo "  Terraform Environment Variables Update"
    echo "  Cloud Nord Event Website"
    echo "  Year: $year"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    check_terraform_prerequisites || exit 1
    check_env_file || exit 1
    check_jq_availability || exit 1
    
    # Switch to correct workspace
    switch_terraform_workspace "$year" || exit 1
    
    # Get Terraform outputs
    local outputs_json
    outputs_json=$(get_terraform_outputs) || exit 1
    
    # Update environment variables
    update_environment_variables "$year" "$outputs_json" || exit 1
    
    # Show next steps
    show_next_steps "$year"
}

# Run main function with all arguments
main "$@"
