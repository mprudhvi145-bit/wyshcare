# Software Bill of Materials

**Generated:** 2026-06-12
**Product:** WyshCare Healthcare Operating System

---

## Backend (NestJS)

### Framework / Runtime
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @nestjs/common | ^11.1.8 | MIT | Production | NestJS common utilities & decorators |
| @nestjs/core | ^11.1.8 | MIT | Production | NestJS core framework |
| @nestjs/config | ^4.0.2 | MIT | Production | Environment configuration module |
| @nestjs/platform-express | ^11.1.8 | MIT | Production | Express HTTP adapter |
| @nestjs/swagger | ^11.2.1 | MIT | Production | OpenAPI/Swagger documentation |
| reflect-metadata | ^0.2.2 | Apache-2.0 | Production | Metadata reflection API |
| rxjs | ^7.8.2 | Apache-2.0 | Production | Reactive extensions |
| dotenv | ^16.6.1 | BSD-2-Clause | Production | Environment variable loader |
| nestjs-pino | ^4.4.1 | MIT | Production | Structured logging (Pino) |
| @nestjs/cli | ^11.0.10 | MIT | Development | NestJS CLI tooling |
| @nestjs/schematics | ^11.0.7 | MIT | Development | NestJS code generation schematics |
| ts-node | ^10.9.2 | MIT | Development | TypeScript execution for Node.js |
| typescript | ^5.9.3 | Apache-2.0 | Development | TypeScript compiler |

### Database / ORM
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @prisma/client | ^6.19.1 | Apache-2.0 | Production | Prisma ORM client |
| prisma | ^6.19.1 | Apache-2.0 | Production | Prisma CLI & schema management |

### AI / ML
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @google/generative-ai | ^0.24.1 | Apache-2.0 | Production | Google Gemini AI SDK |

### Security / Auth
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @nestjs/jwt | ^11.0.1 | MIT | Production | JWT token management |
| @nestjs/passport | ^11.0.5 | MIT | Production | Passport authentication integration |
| argon2 | ^0.44.0 | MIT | Production | Argon2 password hashing |
| bcryptjs | ^3.0.3 | MIT | Production | bcrypt password hashing |
| class-transformer | ^0.5.1 | MIT | Production | Object serialization/deserialization |
| class-validator | ^0.14.2 | MIT | Production | Declarative validation |
| cookie-parser | ^1.4.7 | MIT | Production | HTTP cookie parsing |
| cors | ^2.8.6 | MIT | Production | Cross-Origin Resource Sharing |
| helmet | ^8.1.0 | MIT | Production | Security headers middleware |
| jsonwebtoken | ^9.0.3 | MIT | Production | JWT encoding & decoding |
| passport | ^0.7.0 | MIT | Production | Authentication middleware |
| passport-jwt | ^4.0.1 | MIT | Production | JWT strategy for Passport |
| zod | ^4.1.12 | MIT | Production | Schema validation |

### API / GraphQL
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @apollo/server | ^5.1.0 | MIT | Production | Apollo GraphQL server |
| @as-integrations/express5 | ^1.1.2 | MIT | Production | Apollo Server Express 5 integration |
| @nestjs/apollo | ^13.2.1 | MIT | Production | NestJS Apollo GraphQL integration |
| @nestjs/graphql | ^13.2.0 | MIT | Production | NestJS GraphQL module |
| graphql | ^16.12.0 | MIT | Production | GraphQL query language engine |

### Messaging / Events
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @golevelup/nestjs-rabbitmq | ^5.7.0 | MIT | Production | RabbitMQ message broker integration |
| @nestjs/event-emitter | ^3.1.0 | MIT | Production | Event-driven architecture support |
| @nestjs/platform-socket.io | ^11.1.8 | MIT | Production | WebSocket transport (Socket.IO) |
| @nestjs/websockets | ^11.1.8 | MIT | Production | WebSocket gateway framework |
| ioredis | ^5.8.2 | MIT | Production | Redis client for messaging & caching |

### Storage / Cache
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @aws-sdk/client-s3 | ^3.901.0 | Apache-2.0 | Production | AWS S3 object storage |
| @aws-sdk/s3-request-presigner | ^3.901.0 | Apache-2.0 | Production | S3 pre-signed URL generation |

### Payments
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| razorpay | ^2.9.6 | MIT | Production | Razorpay payment gateway |

### Observability
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @opentelemetry/api | ^1.9.0 | Apache-2.0 | Production | OpenTelemetry distributed tracing |
| @sentry/node | ^10.49.0 | MIT | Production | Error tracking & performance monitoring |

### Other (Production)
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| livekit-server-sdk | ^2.13.1 | Apache-2.0 | Production | Real-time video/audio SDK |
| qrcode | ^1.5.4 | MIT | Production | QR code generation |
| uuid | ^13.0.0 | MIT | Production | UUID v4 generation |

### Testing
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @nestjs/testing | ^11.1.8 | MIT | Development | NestJS test utilities |

### Development / Tooling
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @types/cookie-parser | ^1.4.9 | MIT | Development | Type definitions |
| @types/express | ^5.0.5 | MIT | Development | Type definitions |
| @types/jsonwebtoken | ^9.0.10 | MIT | Development | Type definitions |
| @types/node | ^24.10.1 | MIT | Development | Type definitions |
| @types/passport-jwt | ^4.0.1 | MIT | Development | Type definitions |
| @types/qrcode | ^1.5.5 | MIT | Development | Type definitions |
| @types/uuid | ^10.0.0 | MIT | Development | Type definitions |
| eslint | ^9.39.2 | MIT | Development | JavaScript/TypeScript linter |
| eslint-config-prettier | ^10.1.8 | MIT | Development | ESLint + Prettier compatibility |
| eslint-plugin-import | ^2.32.0 | MIT | Development | Import/export linting rules |
| prettier | ^3.6.2 | MIT | Development | Code formatter |
| typescript-eslint | ^8.46.3 | MIT | Development | TypeScript ESLint configuration |

---

## Frontend (Next.js)

### Framework / Runtime
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| next | 15.5.18 | MIT | Production | Next.js React framework |
| react | 19.2.3 | MIT | Production | React UI library |
| react-dom | 19.2.3 | MIT | Production | React DOM renderer |
| zustand | ^5.0.8 | MIT | Production | Lightweight state management |
| @tanstack/react-query | ^5.90.5 | MIT | Production | Server state & data fetching |
| react-hook-form | ^7.66.1 | MIT | Production | Performant form management |
| @hookform/resolvers | ^5.2.2 | MIT | Production | Zod/yup resolver integration |
| framer-motion | ^12.23.24 | MIT | Production | Animation library |
| zod | ^4.1.12 | MIT | Production | Schema validation |

### UI / Components
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @radix-ui/react-avatar | ^1.1.11 | MIT | Production | Accessible avatar component |
| @radix-ui/react-dialog | ^1.1.15 | MIT | Production | Accessible modal dialog |
| @radix-ui/react-label | ^2.1.7 | MIT | Production | Accessible label component |
| @radix-ui/react-progress | ^1.1.7 | MIT | Production | Accessible progress bar |
| @radix-ui/react-scroll-area | ^1.2.10 | MIT | Production | Accessible scroll area |
| @radix-ui/react-select | ^2.2.6 | MIT | Production | Accessible select menu |
| @radix-ui/react-slot | ^1.2.3 | MIT | Production | Polymorphic component slot |
| class-variance-authority | ^0.7.1 | MIT | Production | CSS variant management |
| clsx | ^2.1.1 | MIT | Production | Conditional classname utility |
| lucide-react | ^0.554.0 | ISC | Production | SVG icon library |
| tailwind-merge | ^3.4.0 | MIT | Production | Tailwind class merge utility |

### Shared Workspace
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @wyshcare/shared | file:../shared | Proprietary | Production | Shared types, schemas & utilities |

### Development / Tooling
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @tailwindcss/postcss | ^4 | MIT | Development | Tailwind CSS PostCSS plugin |
| tailwindcss | ^4 | MIT | Development | Utility-first CSS framework |
| typescript | ^5 | Apache-2.0 | Development | TypeScript compiler |
| @types/node | ^20 | MIT | Development | Type definitions |
| @types/react | ^19 | MIT | Development | Type definitions |
| @types/react-dom | ^19 | MIT | Development | Type definitions |
| eslint | ^9 | MIT | Development | JavaScript/TypeScript linter |
| eslint-config-next | 15.5.18 | MIT | Development | Next.js ESLint configuration |
| @typescript-eslint/eslint-plugin | ^8.50.0 | MIT | Development | TypeScript ESLint rules |
| @typescript-eslint/parser | ^8.50.0 | MIT | Development | TypeScript ESLint parser |
| eslint-plugin-jsx-a11y | ^6.10.2 | MIT | Development | Accessibility linting rules |
| eslint-plugin-react | ^7.37.5 | MIT | Development | React-specific linting rules |
| eslint-plugin-react-hooks | ^7.0.1 | MIT | Development | React Hooks linting rules |
| babel-plugin-react-compiler | 1.0.0 | MIT | Development | React compiler babel plugin |

---

## Shared (`@wyshcare/shared`)

### Framework / Runtime
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| zod | ^4.1.12 | MIT | Production | Schema validation & type inference |
| typescript | ^5.9.3 | Apache-2.0 | Development | TypeScript compiler |

### Development / Tooling
| Package | Version | License | Type | Purpose |
|---------|---------|---------|------|---------|
| @types/node | ^24.10.1 | MIT | Development | Type definitions |
| eslint | ^9.39.2 | MIT | Development | JavaScript/TypeScript linter |
| typescript-eslint | ^8.46.3 | MIT | Development | TypeScript ESLint configuration |

---

## Summary

| Workspace | Production Dependencies | Dev Dependencies | Total |
|-----------|------------------------:|-----------------:|------:|
| Backend   | 42                      | 17               | 59    |
| Frontend  | 21                      | 14               | 35    |
| Shared    | 1                       | 4                | 5     |
| **Total** | **64**                  | **35**           | **99** |

### License Distribution

| License       | Count | Risk Level |
|---------------|------:|------------|
| MIT           | 75   | Low        |
| Apache-2.0    | 11   | Low        |
| ISC           | 1    | Low        |
| BSD-2-Clause  | 1    | Low        |
| Proprietary   | 1    | Low        |
| **Total**     | **89 unique packages** | — |
