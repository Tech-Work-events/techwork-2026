# Cloud Nord Website

Site web pour l'événement Cloud Nord. Les sites 2018-2024 sont [ici](https://github.com/Sunny-Tech/website/).

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/cloud-nord/website-v2/)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/cloud-nord/website-v2/)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/cloud-nord/website-v2?devcontainer_path=.devcontainer/basics/devcontainer.json)

## 🚀 Quick Start

```sh
git clone git@github.com:cloud-nord/website-v2.git
cd website-v2

# Install Task (recommended)
# Mac
brew install go-task/tap/go-task

# Linux
sh -c "$(curl --location https://taskfile.dev/install.sh)"

# Complete development setup
task setup-dev

# Start development server
task start
```

### 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

### 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🏗️ Infrastructure as Code

Ce projet utilise **Terraform** pour gérer l'infrastructure Firebase avec un système de déploiement basé sur les années.

### 🚀 Démarrage Rapide avec Taskfile

```bash
# Installation de Task (recommandé)
brew install go-task/tap/go-task

# Configuration complète de l'environnement de développement
task setup-dev

# Démarrage du serveur de développement
task start

# Déploiement complet pour 2025 (infrastructure + site web)
task full-deploy YEAR=2025
```

#### Commandes de Développement Web

```bash
task install       # Installer les dépendances
task dev           # Serveur de développement
task build         # Build de production
task preview       # Prévisualiser le build
task lint          # Linting
task test          # Tests
```

#### Commandes d'Infrastructure

**⚠️ IMPORTANT:** Before running infrastructure commands, complete the setup in [Infrastructure Guide](./docs/INFRASTRUCTURE.md#initial-setup)

```bash
task setup                # Configuration Terraform
task deploy YEAR=2026     # Déployer l'infrastructure
task deploy-web YEAR=2026 # Déployer le site web
task update-env YEAR=2026 # Mettre à jour .env
```

### 📖 Documentation

-   **[Infrastructure Guide](./docs/INFRASTRUCTURE.md)** - **START HERE** for complete infrastructure setup and management
-   **[Development Guide](./docs/DEVELOPMENT.md)** - Development workflow and commands
-   **[Terraform Documentation](./terraform/README.md)** - Detailed Terraform configuration

### 🔧 First-Time Setup Checklist

Before deploying infrastructure, ensure you have:

1. ✅ **Google Cloud Authentication** - `gcloud auth login` and `gcloud auth application-default login`
2. ✅ **Project Access** - Verify you have owner/editor permissions on your GCP project
3. ✅ **GCS Bucket** - Create bucket for Terraform state storage
4. ✅ **Terraform Init** - Run `terraform init -reconfigure` in terraform directory

**See [Infrastructure Guide](./docs/INFRASTRUCTURE.md#initial-setup) for detailed step-by-step instructions.**
