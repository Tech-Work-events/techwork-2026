#!/bin/bash

# ==============================================================================
# SOPS Team Member Management Script
# ==============================================================================
#
# DESCRIPTION:
#   Adds a new team member's Age public key to SOPS encryption configuration.
#   This allows the new team member to decrypt and access encrypted secrets.
#
# USAGE:
#   ./scripts/sops-add-team-member.sh <age_public_key>
#   ./scripts/sops-add-team-member.sh --help
#
# PARAMETERS:
#   age_public_key    The Age public key of the team member to add
#                     Format: age1<58 alphanumeric characters>
#
# EXAMPLES:
#   ./scripts/sops-add-team-member.sh age1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef
#   ./scripts/sops-add-team-member.sh --help
#
# PREREQUISITES:
#   - SOPS must be installed and configured
#   - .sops.yaml must exist (run 'task setup-sops' first)
#   - Age must be installed
#
# AUTHOR: Cloud Nord Team
# ==============================================================================

set -e

# Script configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

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
SOPS Team Member Management Script

DESCRIPTION:
    Adds a new team member's Age public key to SOPS encryption configuration.
    This allows the new team member to decrypt and access encrypted secrets.

USAGE:
    $SCRIPT_NAME <age_public_key>
    $SCRIPT_NAME --help|-h

PARAMETERS:
    age_public_key    The Age public key of the team member to add
                      Format: age1<58 alphanumeric characters>

OPTIONS:
    --help, -h        Show this help message and exit

EXAMPLES:
    # Add a team member with their Age public key
    $SCRIPT_NAME age1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef

    # Show help
    $SCRIPT_NAME --help

PREREQUISITES:
    - SOPS must be installed and configured
    - .sops.yaml must exist (run 'task setup-sops' first)
    - Age must be installed

WORKFLOW:
    1. New team member runs: task setup-sops
    2. New team member shares their public key: grep '# public key:' ~/.config/sops/age/keys.txt
    3. Team lead runs: $SCRIPT_NAME <public_key>
    4. Team lead commits changes: git add .sops.yaml terraform/*.secrets.tfvars && git commit && git push
    5. New team member can now access secrets: task edit-secrets YEAR=2025

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
        print_error "Age public key is required!"
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

# ==============================================================================
# VALIDATION FUNCTIONS
# ==============================================================================

# Validate Age public key format
validate_age_public_key() {
    local public_key="$1"

    if [[ ! "$public_key" =~ ^age1[a-z0-9]{58}$ ]]; then
        print_error "Invalid Age public key format!"
        print_info "Expected format: age1<58 alphanumeric characters>"
        print_info "Example: age1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef"
        return 1
    fi

    return 0
}

# Check if SOPS configuration exists
check_sops_configuration() {
    if [[ ! -f "$PROJECT_ROOT/.sops.yaml" ]]; then
        print_error ".sops.yaml not found!"
        print_info "Please run 'task setup-sops' first to initialize SOPS configuration."
        return 1
    fi

    print_success "SOPS configuration found"
    return 0
}

# Check if SOPS is installed
check_sops_installation() {
    if ! command -v sops &> /dev/null; then
        print_error "SOPS is not installed!"
        print_info "Install SOPS:"
        print_info "  macOS: brew install sops"
        print_info "  Ubuntu: sudo apt install sops"
        print_info "  Manual: https://github.com/mozilla/sops/releases"
        return 1
    fi

    print_success "SOPS is installed"
    return 0
}

# ==============================================================================
# SOPS MANAGEMENT FUNCTIONS
# ==============================================================================

# Extract current Age keys from .sops.yaml
get_current_age_keys() {
    local sops_file="$PROJECT_ROOT/.sops.yaml"
    local current_keys

    # Extract the age keys line and clean it up
    current_keys=$(grep -A 1 "age:" "$sops_file" | tail -1 | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')

    echo "$current_keys"
}

# Check if a public key already exists in configuration
is_key_already_configured() {
    local public_key="$1"
    local current_keys="$2"

    if echo "$current_keys" | grep -q "$public_key"; then
        return 0  # Key exists
    else
        return 1  # Key doesn't exist
    fi
}

# Combine existing keys with new key
combine_age_keys() {
    local current_keys="$1"
    local new_key="$2"
    local combined_keys

    if [[ -n "$current_keys" && "$current_keys" != "null" ]]; then
        combined_keys="$current_keys,$new_key"
    else
        combined_keys="$new_key"
    fi

    echo "$combined_keys"
}

# Update .sops.yaml with new keys
update_sops_configuration() {
    local new_keys="$1"
    local sops_file="$PROJECT_ROOT/.sops.yaml"

    print_info "Updating .sops.yaml with new team member key..."

    cat > "$sops_file" << EOF
creation_rules:
  # Terraform secrets files
  - path_regex: terraform/.*\.secrets\.tfvars$
    age: >-
      $new_keys

  # Default rule for any .secrets files
  - path_regex: \.secrets\.(yaml|yml|json|env)$
    age: >-
      $new_keys
EOF

    print_success ".sops.yaml updated with new team member key"
}

# Re-encrypt all existing secrets files with updated keys
re_encrypt_secrets_files() {
    print_info "Re-encrypting secrets files with updated keys..."

    local secrets_files
    secrets_files=$(find "$PROJECT_ROOT/terraform" -name "*.secrets.tfvars" 2>/dev/null || true)

    if [[ -z "$secrets_files" ]]; then
        print_warning "No secrets files found to re-encrypt"
        return 0
    fi

    local file_count=0
    while IFS= read -r file; do
        if [[ -n "$file" ]]; then
            print_info "  Re-encrypting: $(basename "$file")"
            if sops updatekeys -y "$file"; then
                ((file_count++))
            else
                print_error "Failed to re-encrypt: $file"
                return 1
            fi
        fi
    done <<< "$secrets_files"

    print_success "Re-encrypted $file_count secrets files"
}

# Display next steps for the user
show_next_steps() {
    local public_key="$1"

    echo ""
    echo "=================================================="
    echo "  Team Member Added Successfully!"
    echo "=================================================="
    echo ""
    print_success "Added public key: $public_key"
    echo ""
    print_info "📝 Next steps:"
    echo ""
    echo "1. Commit the updated configuration:"
    echo "   git add .sops.yaml terraform/*.secrets.tfvars"
    echo "   git commit -m 'feat: add new team member to SOPS encryption'"
    echo "   git push"
    echo ""
    echo "2. The new team member can now:"
    echo "   git pull"
    echo "   task edit-secrets YEAR=2025"
    echo "   task plan YEAR=2025"
    echo ""
    print_warning "Important: Keep all private keys secure and never share them!"
    echo ""
    print_info "For more information, see: docs/INFRASTRUCTURE.md"
}

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

main() {
    local new_public_key="$1"

    # Validate arguments
    validate_arguments "$@"

    # Set the public key from first argument
    new_public_key="$1"

    # Display header
    echo "=================================================="
    echo "  SOPS Team Member Management"
    echo "  Cloud Nord Event Website"
    echo "=================================================="
    echo ""

    # Perform validation checks
    print_info "Validating prerequisites..."
    check_sops_installation || exit 1
    check_sops_configuration || exit 1
    validate_age_public_key "$new_public_key" || exit 1

    # Get current configuration
    print_info "Analyzing current SOPS configuration..."
    local current_keys
    current_keys=$(get_current_age_keys)

    print_info "Current keys in .sops.yaml:"
    echo "  $current_keys"

    # Check if key already exists
    if is_key_already_configured "$new_public_key" "$current_keys"; then
        print_warning "This public key is already configured!"
        print_info "No changes needed."
        exit 0
    fi

    # Combine keys
    local new_keys
    new_keys=$(combine_age_keys "$current_keys" "$new_public_key")

    print_info "Updated keys will be:"
    echo "  $new_keys"
    echo ""

    # Update configuration
    update_sops_configuration "$new_keys" || exit 1

    # Re-encrypt secrets
    re_encrypt_secrets_files || exit 1

    # Show next steps
    show_next_steps "$new_public_key"
}

# Run main function with all arguments
main "$@"
