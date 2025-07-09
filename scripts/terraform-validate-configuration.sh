#!/bin/bash

# ==============================================================================
# Terraform Configuration Validation Script
# ==============================================================================
#
# DESCRIPTION:
#   Validates Terraform configuration files, checks syntax, formatting,
#   and performs security scans. Provides comprehensive validation for
#   infrastructure code before deployment.
#
# USAGE:
#   ./scripts/terraform-validate-configuration.sh [year]
#   ./scripts/terraform-validate-configuration.sh --help
#
# PARAMETERS:
#   year          Optional. The year to validate specific configuration files
#                 If not provided, validates all configurations
#
# OPTIONS:
#   --help, -h    Show help message and exit
#   --fix         Automatically fix formatting issues
#
# EXAMPLES:
#   ./scripts/terraform-validate-configuration.sh
#   ./scripts/terraform-validate-configuration.sh 2025
#   ./scripts/terraform-validate-configuration.sh --fix
#   ./scripts/terraform-validate-configuration.sh --help
#
# PREREQUISITES:
#   - Terraform must be installed
#   - Terraform must be initialized (terraform init)
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

# Validation options
FIX_FORMATTING=false

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
Terraform Configuration Validation Script

DESCRIPTION:
    Validates Terraform configuration files, checks syntax, formatting,
    and performs security scans. Provides comprehensive validation for
    infrastructure code before deployment.

USAGE:
    $SCRIPT_NAME [year]
    $SCRIPT_NAME [options]
    $SCRIPT_NAME --help|-h

PARAMETERS:
    year          Optional. The year to validate specific configuration files
                  If not provided, validates all configurations

OPTIONS:
    --help, -h    Show this help message and exit
    --fix         Automatically fix formatting issues

EXAMPLES:
    # Validate all Terraform configurations
    $SCRIPT_NAME

    # Validate configuration for specific year
    $SCRIPT_NAME 2025

    # Validate and fix formatting issues
    $SCRIPT_NAME --fix

    # Show help
    $SCRIPT_NAME --help

PREREQUISITES:
    - Terraform must be installed
    - Terraform must be initialized (terraform init)

WHAT THIS SCRIPT DOES:
    1. Checks Terraform installation and initialization
    2. Validates Terraform syntax (terraform validate)
    3. Checks code formatting (terraform fmt)
    4. Validates configuration files exist for specified year
    5. Performs basic security checks
    6. Reports validation results

VALIDATION CHECKS:
    - Terraform syntax validation
    - Code formatting consistency
    - Required files existence
    - Basic security patterns
    - Variable definitions

For more information, see: docs/INFRASTRUCTURE.md
EOF
}

# Validate year format if provided
validate_year() {
    local year="$1"

    if [[ -n "$year" && ! "$year" =~ ^20[0-9]{2}$ ]]; then
        print_error "Year must be in format YYYY (e.g., 2024, 2025)"
        return 1
    fi

    return 0
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

# Check if Terraform is initialized
check_terraform_initialization() {
    if [[ ! -d "$TERRAFORM_DIR/.terraform" ]]; then
        print_error "Terraform not initialized!"
        print_info "Run: cd terraform && terraform init"
        return 1
    fi

    print_success "Terraform is initialized"
    return 0
}

# Check if Terraform directory exists
check_terraform_directory() {
    if [[ ! -d "$TERRAFORM_DIR" ]]; then
        print_error "Terraform directory not found: $TERRAFORM_DIR"
        return 1
    fi

    if [[ ! -f "$TERRAFORM_DIR/main.tf" ]]; then
        print_error "Main Terraform configuration not found: $TERRAFORM_DIR/main.tf"
        return 1
    fi

    print_success "Terraform directory found"
    return 0
}

# ==============================================================================
# VALIDATION FUNCTIONS
# ==============================================================================

# Validate Terraform syntax
validate_terraform_syntax() {
    print_info "Validating Terraform syntax..."

    cd "$TERRAFORM_DIR" || return 1

    if terraform validate; then
        print_success "Terraform syntax is valid"
        cd "$PROJECT_ROOT" || return 1
        return 0
    else
        print_error "Terraform syntax validation failed"
        cd "$PROJECT_ROOT" || return 1
        return 1
    fi
}

# Check Terraform formatting
check_terraform_formatting() {
    print_info "Checking Terraform formatting..."

    cd "$TERRAFORM_DIR" || return 1

    local format_check_result
    if $FIX_FORMATTING; then
        print_info "Fixing formatting issues..."
        terraform fmt -recursive
        print_success "Formatting issues fixed"
        format_check_result=0
    else
        # Check formatting without fixing
        if terraform fmt -check -recursive; then
            print_success "Terraform formatting is correct"
            format_check_result=0
        else
            print_warning "Terraform formatting issues found"
            print_info "Run with --fix to automatically fix formatting"
            print_info "Or run: cd terraform && terraform fmt -recursive"
            format_check_result=1
        fi
    fi

    cd "$PROJECT_ROOT" || return 1
    return $format_check_result
}

# Validate configuration files for specific year
validate_year_configuration() {
    local year="$1"

    if [[ -z "$year" ]]; then
        print_info "No specific year provided, skipping year-specific validation"
        return 0
    fi

    print_info "Validating configuration files for year $year..."

    local tfvars_file="$TERRAFORM_DIR/terraform-${year}.tfvars"
    local secrets_file="$TERRAFORM_DIR/terraform-${year}.secrets.tfvars"

    local validation_errors=0

    # Check main configuration file
    if [[ -f "$tfvars_file" ]]; then
        print_success "Configuration file found: $(basename "$tfvars_file")"

        # Basic validation of tfvars file
        if grep -q "year.*=.*$year" "$tfvars_file"; then
            print_success "Year variable correctly set in configuration"
        else
            print_warning "Year variable not found or incorrect in $tfvars_file"
            ((validation_errors++))
        fi
    else
        print_error "Configuration file not found: $tfvars_file"
        ((validation_errors++))
    fi

    # Check secrets file
    if [[ -f "$secrets_file" ]]; then
        print_success "Secrets file found: $(basename "$secrets_file")"

        # Check if file is encrypted with SOPS
        if grep -q "ENC\\[" "$secrets_file"; then
            print_success "Secrets file is encrypted with SOPS"
        else
            print_warning "Secrets file is not encrypted (consider using SOPS)"
        fi
    else
        print_error "Secrets file not found: $secrets_file"
        print_info "Create it with: task encrypt-secrets YEAR=$year"
        ((validation_errors++))
    fi

    if [[ $validation_errors -eq 0 ]]; then
        print_success "Year-specific configuration validation passed"
        return 0
    else
        print_error "Year-specific configuration validation failed ($validation_errors errors)"
        return 1
    fi
}

# Perform basic security checks
perform_security_checks() {
    print_info "Performing basic security checks..."

    local security_issues=0

    # Check for hardcoded secrets in .tf files
    print_info "Checking for hardcoded secrets..."
    local secret_patterns=("password" "secret" "key" "token" "credential")

    for pattern in "${secret_patterns[@]}"; do
        if grep -r -i "$pattern.*=" "$TERRAFORM_DIR"/*.tf 2>/dev/null | grep -v "variable\\|output\\|data\\|resource"; then
            print_warning "Potential hardcoded secret found (pattern: $pattern)"
            ((security_issues++))
        fi
    done

    # Check for unencrypted .tfvars files with sensitive content
    print_info "Checking for unencrypted sensitive files..."
    while IFS= read -r -d '' file; do
        if [[ "$file" == *".secrets.tfvars" ]] && ! grep -q "ENC\\[" "$file"; then
            print_warning "Unencrypted secrets file: $(basename "$file")"
            ((security_issues++))
        fi
    done < <(find "$TERRAFORM_DIR" -name "*.tfvars" -print0 2>/dev/null)

    if [[ $security_issues -eq 0 ]]; then
        print_success "Basic security checks passed"
        return 0
    else
        print_warning "Security checks completed with $security_issues potential issues"
        return 1
    fi
}

# ==============================================================================
# VALIDATION SUMMARY
# ==============================================================================

# Display validation summary
show_validation_summary() {
    local year="$1"
    local syntax_result="$2"
    local format_result="$3"
    local year_config_result="$4"
    local security_result="$5"

    echo ""
    echo "=================================================="
    echo "  Validation Summary"
    echo "=================================================="
    echo ""

    # Display results
    echo "Validation Results:"
    [[ $syntax_result -eq 0 ]] && echo "  ✅ Syntax validation: PASSED" || echo "  ❌ Syntax validation: FAILED"
    [[ $format_result -eq 0 ]] && echo "  ✅ Formatting check: PASSED" || echo "  ⚠️  Formatting check: ISSUES FOUND"

    if [[ -n "$year" ]]; then
        [[ $year_config_result -eq 0 ]] && echo "  ✅ Year configuration: PASSED" || echo "  ❌ Year configuration: FAILED"
    fi

    [[ $security_result -eq 0 ]] && echo "  ✅ Security checks: PASSED" || echo "  ⚠️  Security checks: ISSUES FOUND"

    echo ""

    # Overall result
    local overall_result=0
    [[ $syntax_result -ne 0 ]] && overall_result=1
    [[ -n "$year" && $year_config_result -ne 0 ]] && overall_result=1

    if [[ $overall_result -eq 0 ]]; then
        print_success "Overall validation: PASSED"
        echo ""
        print_info "Your Terraform configuration is ready for deployment!"
        if [[ -n "$year" ]]; then
            print_info "Next steps:"
            print_info "  task plan YEAR=$year"
            print_info "  task apply YEAR=$year"
        fi
    else
        print_error "Overall validation: FAILED"
        echo ""
        print_info "Please fix the issues above before proceeding with deployment."
    fi

    echo ""
    print_info "For more information, see: docs/INFRASTRUCTURE.md"

    return $overall_result
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main() {
    local year=""

    # Parse arguments directly
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --fix)
                FIX_FORMATTING=true
                shift
                ;;
            --*)
                print_error "Unknown option: $1"
                echo ""
                show_help
                exit 1
                ;;
            *)
                if [[ -z "$year" ]]; then
                    year="$1"
                    shift
                else
                    print_error "Too many arguments provided!"
                    echo ""
                    show_help
                    exit 1
                fi
                ;;
        esac
    done

    # Validate year if provided
    if [[ -n "$year" ]]; then
        validate_year "$year" || exit 1
    fi

    # Display header
    echo "=================================================="
    echo "  Terraform Configuration Validation"
    echo "  Cloud Nord Event Website"
    if [[ -n "$year" ]]; then
        echo "  Year: $year"
    fi
    echo "=================================================="
    echo ""

    # Check prerequisites
    check_terraform_installation || exit 1
    check_terraform_directory || exit 1
    check_terraform_initialization || exit 1

    # Perform validations
    local syntax_result=0
    local format_result=0
    local year_config_result=0
    local security_result=0

    validate_terraform_syntax || syntax_result=$?
    check_terraform_formatting || format_result=$?
    validate_year_configuration "$year" || year_config_result=$?
    perform_security_checks || security_result=$?

    # Show summary and exit with appropriate code
    show_validation_summary "$year" $syntax_result $format_result $year_config_result $security_result
}

# Run main function with all arguments
main "$@"
