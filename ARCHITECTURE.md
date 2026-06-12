# WyshCare Application Architecture

## Overview

WyshCare is a comprehensive healthcare application consisting of a NestJS backend, a Next.js frontend, a shared TypeScript package, infrastructure as code, an iOS application, and various utility scripts.

## Major Components

1. **Backend** (`./backend`) - NestJS server handling business logic, authentication, and data storage.
2. **Frontend** (`./frontend`) - Next.js application providing the user interface.
3. **Shared** (`./shared`) - TypeScript package containing shared interfaces, contracts, and types used by both frontend and backend.
4. **Infrastructure** (`./infra`) - Infrastructure as code definitions (Terraform, Kubernetes, Docker, monitoring).
5. **iOS Application** (`./ios`) - Native iOS application built with Swift and Xcode.
6. **Scripts** (`./scripts`) - Utility scripts for validation, deployment, and integrity checks.
7. **Documentation** (`./docs`) - Additional documentation.
8. **Archive** (`./archive`) - Archived files.
9. **Exports** (`./exports`) - Exported data.
10. **Performance Testing** (`./k6`) - Load testing scripts using k6.
11. **Supabase Migrations** (`./supabase_migrations`) - Database migration scripts for Supabase.

## Detailed Component Descriptions

### Backend
- **Location**: `./backend`
- **Technology**: NestJS (TypeScript)
- **Description**: The backend serves as the API server, handling authentication, business logic, data validation, and communication with the database (Prisma ORM) and external services (e.g., Razorpay, LiveKit, Gemini AI).
- **Key Features**:
  - REST and GraphQL endpoints
  - Authentication via JWT
  - Role-based access control (RBAC)
  - File storage (local/MinIO/S3)
  - Event-driven architecture (RabbitMQ)
  - Observability (OpenTelemetry, Prometheus, Grafana)
  - AI integration (Gemini, OpenAI, etc.)
- **Observations**:
  - The backend uses a modular structure with features organized in `./backend/src/modules`.
  - TypeScript path mapping (`@wyshcare/shared`) is configured in `tsconfig.base.json` to import shared types.
  - The backend root directory contains numerous JavaScript files and scripts that appear to be dead code (not imported by the TypeScript source and not used in the built application).
  - The `.env` file in the backend root contains hardcoded secrets (though it is ignored by `.gitignore`).
  - The root `package.json` is missing (misnamed as `package.son`), which breaks the npm workspace setup.

### Frontend
- **Location**: `./frontend`
- **Technology**: Next.js (React, TypeScript)
- **Description**: The frontend provides the user interface for patients, doctors, and administrators. It uses the `app` directory (Next.js 13+ app router) and communicates with the backend via REST and GraphQL.
- **Key Features**:
  - Responsive design with Tailwind CSS
  - State management with Zustand
  - Form handling with React Hook Form
  - Data fetching with TanStack Query
  - Authentication context
- **Observations**:
  - The frontend depends on the shared package via `file:../shared` in its `package.json`.
  - The frontend includes a `legacy-src` and `legacy-root` directory, suggesting a migration from an older codebase.
  - The frontend has utility scripts for fixing unused imports (`fix-unused-imports.mjs`, etc.).

### Shared
- **Location**: `./shared`
- **Technology**: TypeScript
- **Description**: Contains shared interfaces, contracts, constants, and schemas that ensure consistency between the frontend and backend.
- **Key Features**:
  - Authentication contracts (`auth-contract.ts`)
  - Role-based constants
  - API contracts
  - Domain schemas
  - Utility types
- **Observations**:
  - The shared package is built and placed in `./shared/dist`.
  - The frontend installs it as a local dependency (`file:../shared`).
  - The backend uses TypeScript path mapping to import from `shared/src` directly.
  - This dual mechanism may lead to inconsistencies; a unified approach (e.g., publishing to a local registry or using npm workspaces for both) is recommended.

### Infrastructure
- **Location**: `./infra`
- **Description**: Defines the infrastructure for deploying the application using Terraform, Kubernetes, Docker, and monitoring tools.
- **Subcomponents**:
  - **Terraform** (`./infra/terraform`): Provisions cloud resources (e.g., AWS, GCP).
  - **Kubernetes** (`./infra/k8s`): Kubernetes manifests for deployments, services, ingress, etc.
  - **Docker** (`./infra/docker`): Dockerfiles and entrypoint scripts for building container images.
  - **Monitoring** (`./infra/{prometheus,grafana,alertmanager,tempo,otel}`): Configuration for observability stack.
- **Observations**:
  - The infrastructure appears to be well-organized and follows best practices for IaC.
  - No obvious issues were found during a high-level review.

### iOS Application
- **Location**: `./ios`
- **Technology**: Swift (Xcode)
- **Description**: Native iOS application that provides a subset of the WyshCare features for iPhone users.
- **Key Features**:
  - SwiftUI or UIKit interface
  - Integration with backend APIs
  - Push notifications
  - Widgets and Live Activities
- **Observations**:
  - The iOS project uses CocoaPods or Swift Package Manager for dependencies (evidenced by `Project.yml` and `Makefile`).
  - The iOS application likely shares some contracts with the shared package (though this was not verified).

### Scripts
- **Location**: `./scripts`
- **Description**: Utility scripts for validating deployment, integrity, and security.
- **Key Scripts**:
  - `validate-deployment.mjs`: Checks deployment readiness.
  - `validate-integrity.ts`: Verifies data integrity.
  - `validate-security.mjs`: Audits security configurations.
- **Observations**:
  - The scripts are written in TypeScript and JavaScript and appear to be well-maintained.

### Other Directories
- **Docs** (`./docs`): Additional documentation (not reviewed in detail).
- **Archive** (`./archive`): Archived files (likely safe to ignore).
- **Exports** (`./exports`): Exported data (purpose unclear).
- **k6** (`./k6`): Performance testing scripts using k6.
- **Supabase Migrations** (`./supabase_migrations`): SQL scripts for migrating the Supabase database.

## Issues Found

### Security Concerns
1. **Hardcoded Secrets in `.env`**: The backend root contains a `.env` file with real secrets (e.g., JWT_SECRET, MASTER_ENCRYPTION_KEY, API keys). Although this file is ignored by `.gitignore` (both root and backend/.gitignore), its presence increases the risk of accidental commitment if the ignore rules are misconfigured or if a developer copies the file to a location that is not ignored.
2. **Missing Root `package.json`**: The file `package.son` should be renamed to `package.json` and contain the workspace definition. Without a proper root `package.json`, the npm workspace setup is broken, which may lead to inconsistent dependency installations.

### Dead Code
Numerous files in the backend root directory are not imported by the TypeScript source (`./backend/src`) and are not used in the built application (as evidenced by the Dockerfile only using the compiled output from `./backend/dist`). Examples include:
- Service files: `abdm.service.js`, `availability.service.js`, `consent.service.js`, `dashboard-analytics.service.js`
- Fix scripts: `fix_prescription.py`, `fix_prescription_final.py`, `fix_events.py`, etc.
- Backup files: `prescription_service_backup.ts`, `prescription_service_orig.ts`
- Configuration files: `db.js`, `db.ts`, `server.js`, `server.mjs`
- Temporary and test files: `temp.ts`, `test.ts`, `work.ts`, `tmp`, `tmp.ts`

### Duplicate Functionality
1. **Multiple Fix Scripts**: Several scripts with similar names (e.g., `fix_prescription.py`, `fix_prescription_final.py`, `fix_prescription_service.py`, `fix_prescription_service2.py`) suggest redundant or obsolete data migration scripts.
2. **Duplicate Configuration**: The presence of both `db.js` and `db.ts` (and similarly `server.js` and `server.mjs`) indicates duplication that could lead to confusion.

### Refactoring Opportunities
1. **Clean Up Dead Code**: Remove or archive the dead code in the backend root directory. If any of these files are still needed (e.g., for reference), move them to a dedicated `./backend/scripts` or `./backend/archive` directory.
2. **Consolidate Fix Scripts**: Review the fix scripts, retain only the necessary ones, and move them to a dedicated directory (e.g., `./scripts/database-fixes`). Document their purpose and usage.
3. **Remove Duplicate Configuration**: Keep only one version of each configuration file (preferably the TypeScript version if the application is transitioning to TypeScript).
4. **Fix Root Package Definition**: Rename `package.son` to `package.json` and define the workspace structure properly, including all workspaces (shared, backend, frontend) and their dependencies.
5. **Unify Shared Package Consumption**: Standardize how the shared package is consumed by both frontend and backend. Options include:
   - Publishing the shared package to a local registry (e.g., using `verdaccio` or `npm pack`).
   - Using npm workspaces for both frontend and backend (ensuring both have a `"dependencies": { "@wyshcare/shared": "workspace:*" }` entry).
   - Continuing with the current dual mechanism but ensuring consistency (e.g., by always building the shared package before building the frontend or backend).
6. **Prevent Accidental Secret Commitment**: Implement a pre-commit hook (e.g., using `husky` and `lint-staged`) to check for `.env` files containing real secrets and block commits if found. Alternatively, use a tool like `git-secrets` in CI/CD pipelines.
7. **Implement Code Ownership**: Clearly define ownership for each component to reduce confusion and improve maintainability.

## Recommendations

1. **Immediate Actions**:
   - Rename `package.son` to `package.json` and define the workspace structure properly.
   - Remove dead code from the backend root directory (or move to an archive).
   - Review and consolidate fix scripts and configuration files.
2. **Short-Term Actions**:
   - Standardize the shared package consumption mechanism.
   - Add pre-commit hooks to prevent secret leakage.
   - Document the purpose of each script and configuration file.
3. **Long-Term Actions**:
   - Consider adopting a monorepo management tool (e.g., Nx, TurboRepo) to improve build performance and dependency management.
   - Implement automated dependency updates (e.g., using Renovate or Dependabot).
   - Regularly conduct security audits and dependency vulnerability scans.

## Conclusion

The WyshCare application is a well-structured monorepo with clear separation of concerns between the backend, frontend, shared packages, infrastructure, and mobile client. Addressing the identified issues—particularly the dead code, duplicate functionality, and configuration inconsistencies—will improve maintainability, reduce technical debt, and enhance security. The recommendations provided aim to streamline development workflows and ensure the application remains robust and secure as it evolves.
