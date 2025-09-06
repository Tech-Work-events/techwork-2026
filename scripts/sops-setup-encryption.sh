#!/bin/bash

# ==============================================================================
# SOPS Encryption Setup Script
# ==============================================================================
# 
# DESCRIPTION:
#   Sets up SOPS (Secrets OPerationS) encryption for the Techwork project.
#   Generates Age encryption keys and configures SOPS for secure secrets management.
#
# USAGE:
#   ./scripts/sops-setup-encryption.sh
#   ./scripts/sops-setup-encryption.sh --help
#
# PARAMETERS:
#   None
#
# OPTIONS:
#   --help, -h        Show help message and exit
#
# EXAMPLES:
#   ./scripts/sops-setup-encryption.sh
#   ./scripts/sops-setup-encryption.sh --help
#
# PREREQUISITES:
#   - Age must be installed (brew install age)
#   - SOPS must be installed (brew install sops)
#
# AUTHOR: Techwork Team
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

# Age configuration
readonly AGE_KEYS_DIR="$HOME/.config/sops/age"
readonly AGE_KEY_FILE="$AGE_KEYS_DIR/keys.txt"

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
SOPS Encryption Setup Script

DESCRIPTION:
    Sets up SOPS (Secrets OPerationS) encryption for the Techwork project.
    Generates Age encryption keys and configures SOPS for secure secrets management.

USAGE:
    $SCRIPT_NAME
    $SCRIPT_NAME --help|-h

OPTIONS:
    --help, -h        Show this help message and exit

EXAMPLES:
    # Set up SOPS encryption
    $SCRIPT_NAME

    # Show help
    $SCRIPT_NAME --help

PREREQUISITES:
    - Age must be installed (brew install age)
    - SOPS must be installed (brew install sops)

WHAT THIS SCRIPT DOES:
    1. Checks if Age and SOPS are installed
    2. Creates Age keys directory if it doesn't exist
    3. Generates a new Age key pair (if not already present)
    4. Creates/updates .sops.yaml configuration
    5. Sets up environment variables for SOPS

AFTER RUNNING THIS SCRIPT:
    1. Add to your shell profile (~/.bashrc, ~/.zshrc, etc.):
       export SOPS_AGE_KEY_FILE="$AGE_KEY_FILE"
    2. Restart your terminal or source your profile
    3. Create secrets files: task encrypt-secrets YEAR=2025
    4. Share your public key with team members for collaboration

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
# VALIDATION FUNCTIONS
# ==============================================================================

# Check if Age is installed
check_age_installation() {
    if ! command -v age &> /dev/null; then
        print_error "Age is not installed!"
        print_info "Install Age:"
        print_info "  macOS: brew install age"
        print_info "  Ubuntu: sudo apt install age"
        print_info "  Manual: https://github.com/FiloSottile/age/releases"
        return 1
    fi
    
    print_success "Age is installed"
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
# AGE KEY MANAGEMENT
# ==============================================================================

# Create Age keys directory
create_age_keys_directory() {
    if [[ ! -d "$AGE_KEYS_DIR" ]]; then
        print_info "Creating Age keys directory: $AGE_KEYS_DIR"
        mkdir -p "$AGE_KEYS_DIR"
        print_success "Age keys directory created"
    else
        print_success "Age keys directory already exists"
    fi
}

# Generate Age key pair
generate_age_key() {
    if [[ -f "$AGE_KEY_FILE" ]]; then
        print_success "Age key already exists: $AGE_KEY_FILE"
        return 0
    fi
    
    print_info "Generating new Age key pair..."
    age-keygen -o "$AGE_KEY_FILE"
    print_success "Age key generated: $AGE_KEY_FILE"
}

# Extract public key from Age key file
get_age_public_key() {
    if [[ ! -f "$AGE_KEY_FILE" ]]; then
        print_error "Age key file not found: $AGE_KEY_FILE"
        return 1
    fi
    
    local public_key
    public_key=$(grep "# public key:" "$AGE_KEY_FILE" | cut -d' ' -f4)
    
    if [[ -z "$public_key" ]]; then
        print_error "Could not extract public key from Age key file"
        return 1
    fi
    
    echo "$public_key"
}

# ==============================================================================
# SOPS CONFIGURATION
# ==============================================================================

# Create or update .sops.yaml configuration
create_sops_configuration() {
    local public_key="$1"
    local sops_file="$PROJECT_ROOT/.sops.yaml"
    
    print_info "Creating SOPS configuration: .sops.yaml"
    
    cat > "$sops_file" << EOF
creation_rules:
  # Terraform secrets files
  - path_regex: terraform/.*\.secrets\.tfvars$
    age: >-
      $public_key
  
  # Default rule for any .secrets files
  - path_regex: \.secrets\.(yaml|yml|json|env)$
    age: >-
      $public_key
EOF
    
    print_success ".sops.yaml configuration created"
}

# ==============================================================================
# ENVIRONMENT SETUP
# ==============================================================================

# Display environment setup instructions
show_environment_setup() {
    local public_key="$1"
    
    echo ""
    print_info "Environment Setup Instructions:"
    echo ""
    echo "Add this line to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
    echo "  export SOPS_AGE_KEY_FILE=\"$AGE_KEY_FILE\""
    echo ""
    echo "Then restart your terminal or run:"
    echo "  source ~/.bashrc  # or ~/.zshrc"
    echo ""
}

# Display next steps
show_next_steps() {
    local public_key="$1"
    
    echo ""
    echo "=================================================="
    echo "  SOPS Setup Complete!"
    echo "=================================================="
    echo ""
    print_success "Your Age public key: $public_key"
    echo ""
    print_info "📝 Next steps:"
    echo ""
    echo "1. Set up environment (see instructions above)"
    echo "2. Create and encrypt secrets:"
    echo "   task encrypt-secrets YEAR=2025"
    echo "3. Share your public key with team members:"
    echo "   echo \"$public_key\""
    echo "4. Team members can add you with:"
    echo "   task add-team-member PUBLIC_KEY=\"$public_key\""
    echo ""
    print_warning "IMPORTANT: Keep your private key ($AGE_KEY_FILE) secure and backed up!"
    print_warning "Without it, you cannot decrypt your secrets!"
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
    echo "  SOPS Encryption Setup"
    echo "  Techwork Event Website"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    check_age_installation || exit 1
    check_sops_installation || exit 1
    
    # Set up Age keys
    print_info "Setting up Age encryption keys..."
    create_age_keys_directory || exit 1
    generate_age_key || exit 1
    
    # Get public key
    local public_key
    public_key=$(get_age_public_key) || exit 1
    print_success "Public key extracted: $public_key"
    
    # Create SOPS configuration
    create_sops_configuration "$public_key" || exit 1
    
    # Set environment variable for current session
    export SOPS_AGE_KEY_FILE="$AGE_KEY_FILE"
    
    # Show setup instructions and next steps
    show_environment_setup "$public_key"
    show_next_steps "$public_key"
}

# Run main function with all arguments
main "$@"
