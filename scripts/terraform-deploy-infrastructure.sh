#!/bin/bash

# ==============================================================================
# Terraform Infrastructure Deployment Script
# ==============================================================================
# 
# DESCRIPTION:
#   Deploys Firebase infrastructure using Terraform for a specific year.
#   Supports planning, applying, and destroying infrastructure with proper
#   workspace management and configuration validation.
#
# USAGE:
#   ./scripts/terraform-deploy-infrastructure.sh <year> [action]
#   ./scripts/terraform-deploy-infrastructure.sh --help
#
# PARAMETERS:
#   year          The year for the event (e.g., 2024, 2025)
#   action        Terraform action: plan, apply, or destroy (default: plan)
#
# OPTIONS:
#   --help, -h    Show help message and exit
#
# EXAMPLES:
#   ./scripts/terraform-deploy-infrastructure.sh 2025
#   ./scripts/terraform-deploy-infrastructure.sh 2025 plan
#   ./scripts/terraform-deploy-infrastructure.sh 2025 apply
#   ./scripts/terraform-deploy-infrastructure.sh 2025 destroy
#   ./scripts/terraform-deploy-infrastructure.sh --help
#
# PREREQUISITES:
#   - Terraform must be installed and initialized
#   - Google Cloud CLI must be installed and authenticated
#   - terraform-YEAR.tfvars and terraform-YEAR.secrets.tfvars must exist
#
# AUTHOR: Techwork Team
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

# Valid actions
readonly VALID_ACTIONS=("plan" "apply" "destroy")

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
Terraform Infrastructure Deployment Script

DESCRIPTION:
    Deploys Firebase infrastructure using Terraform for a specific year.
    Supports planning, applying, and destroying infrastructure with proper
    workspace management and configuration validation.

USAGE:
    $SCRIPT_NAME <year> [action]
    $SCRIPT_NAME --help|-h

PARAMETERS:
    year          The year for the event (e.g., 2024, 2025)
    action        Terraform action to perform (default: plan)
                  Valid actions: plan, apply, destroy

OPTIONS:
    --help, -h    Show this help message and exit

EXAMPLES:
    # Plan infrastructure for 2025
    $SCRIPT_NAME 2025
    $SCRIPT_NAME 2025 plan

    # Deploy infrastructure for 2025
    $SCRIPT_NAME 2025 apply

    # Destroy infrastructure for 2024
    $SCRIPT_NAME 2024 destroy

    # Show help
    $SCRIPT_NAME --help

PREREQUISITES:
    - Terraform must be installed and initialized
    - Google Cloud CLI must be installed and authenticated
    - terraform-YEAR.tfvars must exist in terraform/ directory
    - terraform-YEAR.secrets.tfvars must exist in terraform/ directory

WHAT THIS SCRIPT DOES:
    1. Validates input parameters and prerequisites
    2. Creates or selects Terraform workspace for the year
    3. Checks for required configuration files
    4. Executes the specified Terraform action
    5. Saves outputs for environment variable updates (on apply)

WORKSPACE MANAGEMENT:
    Each year gets its own Terraform workspace for isolation.
    Workspaces are automatically created if they don't exist.

For more information, see: docs/INFRASTRUCTURE.md
EOF
}

# Check if value is in array
is_valid_action() {
    local action="$1"
    local valid_action
    
    for valid_action in "${VALID_ACTIONS[@]}"; do
        if [[ "$action" == "$valid_action" ]]; then
            return 0
        fi
    done
    
    return 1
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

    if [[ $# -gt 2 ]]; then
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

# Validate action
validate_action() {
    local action="$1"
    
    if ! is_valid_action "$action"; then
        print_error "Invalid action: $action"
        print_info "Valid actions: ${VALID_ACTIONS[*]}"
        return 1
    fi
    
    return 0
}

# ==============================================================================
# PREREQUISITE CHECKS
# ==============================================================================

# Check if Terraform is installed and initialized
check_terraform_prerequisites() {
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed!"
        print_info "Run: ./scripts/terraform-setup-environment.sh"
        return 1
    fi
    
    if [[ ! -d "$TERRAFORM_DIR/.terraform" ]]; then
        print_warning "Terraform not initialized. Running setup..."
        if ! "$SCRIPT_DIR/terraform-setup-environment.sh"; then
            print_error "Failed to set up Terraform environment"
            return 1
        fi
    fi
    
    print_success "Terraform prerequisites met"
    return 0
}

# Check if required configuration files exist
check_configuration_files() {
    local year="$1"
    local tfvars_file="$TERRAFORM_DIR/terraform-${year}.tfvars"
    local secrets_file="$TERRAFORM_DIR/terraform-${year}.secrets.tfvars"
    
    print_info "Checking configuration files for year $year..."
    
    if [[ ! -f "$tfvars_file" ]]; then
        print_error "Configuration file not found: $tfvars_file"
        print_info "Please create this file with your configuration."
        print_info "You can use terraform-2025.tfvars as a template if it exists."
        return 1
    fi
    
    if [[ ! -f "$secrets_file" ]]; then
        print_error "Secrets file not found: $secrets_file"
        print_info "Please create this file with your secrets (billing_account_id, etc.)"
        print_info "You can use terraform-2025.secrets.tfvars as a template if it exists."
        return 1
    fi
    
    print_success "Configuration files found"
    print_info "  Config: $(basename "$tfvars_file")"
    print_info "  Secrets: $(basename "$secrets_file")"
    
    return 0
}

# ==============================================================================
# TERRAFORM WORKSPACE MANAGEMENT
# ==============================================================================

# Create or select Terraform workspace for the year
manage_terraform_workspace() {
    local year="$1"
    
    print_info "Setting up Terraform workspace for year $year..."
    
    cd "$TERRAFORM_DIR" || {
        print_error "Could not change to Terraform directory: $TERRAFORM_DIR"
        return 1
    }
    
    # Check if workspace exists
    if terraform workspace list | grep -q "\\b$year\\b"; then
        print_info "Selecting existing workspace: $year"
        terraform workspace select "$year"
    else
        print_info "Creating new workspace: $year"
        terraform workspace new "$year"
    fi
    
    print_success "Workspace $year is ready"
    
    cd "$PROJECT_ROOT" || return 1
    return 0
}

# ==============================================================================
# TERRAFORM OPERATIONS
# ==============================================================================

# Execute Terraform plan
execute_terraform_plan() {
    local year="$1"
    local tfvars_file="terraform-${year}.tfvars"
    local secrets_file="terraform-${year}.secrets.tfvars"
    local plan_file="tfplan-${year}"
    
    print_info "Running terraform plan for year $year..."
    
    cd "$TERRAFORM_DIR" || return 1
    
    # Decrypt secrets if needed
    local secrets_to_use="$secrets_file"
    if grep -q "ENC\\[" "$secrets_file" 2>/dev/null; then
        print_info "Decrypting SOPS-encrypted secrets..."
        secrets_to_use="terraform-${year}.secrets.decrypted.tfvars"
        
        if ! sops -d "$secrets_file" > "$secrets_to_use"; then
            print_error "Failed to decrypt secrets file"
            return 1
        fi
    fi
    
    # Run terraform plan
    if terraform plan -var-file="$tfvars_file" -var-file="$secrets_to_use" -out="$plan_file"; then
        print_success "Plan completed successfully!"
        echo ""
        print_info "To apply these changes, run:"
        print_info "  $SCRIPT_NAME $year apply"
    else
        print_error "Terraform plan failed"
        return 1
    fi
    
    # Clean up decrypted secrets
    if [[ "$secrets_to_use" != "$secrets_file" ]]; then
        rm -f "$secrets_to_use"
    fi
    
    cd "$PROJECT_ROOT" || return 1
    return 0
}

# Execute Terraform apply
execute_terraform_apply() {
    local year="$1"
    local tfvars_file="terraform-${year}.tfvars"
    local secrets_file="terraform-${year}.secrets.tfvars"
    local plan_file="tfplan-${year}"
    local outputs_file="outputs-${year}.json"
    
    print_info "Running terraform apply for year $year..."
    
    cd "$TERRAFORM_DIR" || return 1
    
    # Decrypt secrets if needed
    local secrets_to_use="$secrets_file"
    if grep -q "ENC\\[" "$secrets_file" 2>/dev/null; then
        print_info "Decrypting SOPS-encrypted secrets..."
        secrets_to_use="terraform-${year}.secrets.decrypted.tfvars"
        
        if ! sops -d "$secrets_file" > "$secrets_to_use"; then
            print_error "Failed to decrypt secrets file"
            return 1
        fi
    fi
    
    # Apply terraform changes
    local apply_result=0
    if [[ -f "$plan_file" ]]; then
        print_info "Applying existing plan..."
        terraform apply "$plan_file" || apply_result=$?
    else
        print_info "No existing plan found. Creating and applying..."
        terraform apply -var-file="$tfvars_file" -var-file="$secrets_to_use" || apply_result=$?
    fi
    
    # Clean up decrypted secrets
    if [[ "$secrets_to_use" != "$secrets_file" ]]; then
        rm -f "$secrets_to_use"
    fi
    
    if [[ $apply_result -eq 0 ]]; then
        print_success "Infrastructure deployed successfully for year $year!"
        
        # Save outputs
        print_info "Saving Terraform outputs..."
        terraform output -json > "$outputs_file"
        
        echo ""
        echo "=================================================="
        echo "  Deployment Summary for $year"
        echo "=================================================="
        terraform output
        echo ""
        print_success "Firebase configuration saved to: $outputs_file"
        print_info "Use 'task update-env YEAR=$year' to update environment variables."
    else
        print_error "Terraform apply failed"
        return 1
    fi
    
    cd "$PROJECT_ROOT" || return 1
    return 0
}

# Execute Terraform destroy
execute_terraform_destroy() {
    local year="$1"
    local tfvars_file="terraform-${year}.tfvars"
    local secrets_file="terraform-${year}.secrets.tfvars"
    local plan_file="tfplan-${year}"
    local outputs_file="outputs-${year}.json"
    
    print_warning "This will destroy ALL infrastructure for year $year!"
    echo ""
    read -p "Are you sure? Type 'yes' to confirm: " -r confirm
    
    if [[ "$confirm" != "yes" ]]; then
        print_info "Destroy operation cancelled"
        return 0
    fi
    
    print_info "Running terraform destroy for year $year..."
    
    cd "$TERRAFORM_DIR" || return 1
    
    # Decrypt secrets if needed
    local secrets_to_use="$secrets_file"
    if grep -q "ENC\\[" "$secrets_file" 2>/dev/null; then
        print_info "Decrypting SOPS-encrypted secrets..."
        secrets_to_use="terraform-${year}.secrets.decrypted.tfvars"
        
        if ! sops -d "$secrets_file" > "$secrets_to_use"; then
            print_error "Failed to decrypt secrets file"
            return 1
        fi
    fi
    
    # Destroy infrastructure
    local destroy_result=0
    terraform destroy -var-file="$tfvars_file" -var-file="$secrets_to_use" || destroy_result=$?
    
    # Clean up decrypted secrets
    if [[ "$secrets_to_use" != "$secrets_file" ]]; then
        rm -f "$secrets_to_use"
    fi
    
    if [[ $destroy_result -eq 0 ]]; then
        print_success "Infrastructure destroyed for year $year"
        
        # Clean up files
        rm -f "$plan_file" "$outputs_file"
        
        # Delete workspace
        terraform workspace select default
        terraform workspace delete "$year"
        
        print_success "Workspace $year deleted"
    else
        print_error "Terraform destroy failed"
        return 1
    fi
    
    cd "$PROJECT_ROOT" || return 1
    return 0
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main() {
    local year="$1"
    local action="${2:-plan}"
    
    # Validate arguments
    validate_arguments "$@"
    validate_year "$year" || exit 1
    validate_action "$action" || exit 1
    
    # Display header
    echo "=================================================="
    echo "  Terraform Infrastructure Deployment"
    echo "  Techwork Event Website"
    echo "  Year: $year"
    echo "  Action: $action"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    check_terraform_prerequisites || exit 1
    check_configuration_files "$year" || exit 1
    
    # Manage workspace
    manage_terraform_workspace "$year" || exit 1
    
    # Execute the requested action
    case "$action" in
        "plan")
            execute_terraform_plan "$year" || exit 1
            ;;
        "apply")
            execute_terraform_apply "$year" || exit 1
            ;;
        "destroy")
            execute_terraform_destroy "$year" || exit 1
            ;;
        *)
            print_error "Unknown action: $action"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Operation completed successfully!"
}

# Run main function with all arguments
main "$@"
