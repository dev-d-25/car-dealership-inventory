# Car Dealership Inventory System - Architecture Decisions

## Context

This kata project requires building a full-stack car dealership inventory system with user authentication, vehicle CRUD, search/filter, role-based access (admin/user), and image management. The deadline is Thursday 10pm.

## Decisions

### Tech Stack
- **Backend**: Node.js + TypeScript, Express, Zod validation, Better Auth (with admin plugin)
- **Frontend**: Vite + React, shadcn/ui, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM (generate + migrate)
- **Image Hosting**: ImageKit + Multer
- **Hosting**: Backend on Railway, Frontend on Vercel

### Domain Model
- **Vehicle**: id, maker, model, category, price, quantity, description, imageUrl, createdAt, updatedAt
- **Category**: Hatchback, Sedan, SUV, Truck, Coupe (enum/predefined)
- **User**: Managed by Better Auth with role field (user/admin)

### Authentication & Authorization
- Better Auth with admin plugin for role management
- Default role: "user" for all registrations
- Admin promotion via Better Auth's `setRole` endpoint (admin-only operation)
- No self-selection of admin during registration

### API Design
- RESTful endpoints with pagination support
- Response format: `{ success, data, pagination: { currentPage, total, limit, totalPages } }`
- Error format: `{ success: false, error: { code, message } }`
- Search via query params: `?maker=X&category=Y&minPrice=Z&maxPrice=W`

### Project Structure
- Separate `server/` and `client/` directories
- Backend follows modular pattern: modules/{feature}/{controller,service,route,dto}
- Frontend: components/, pages/, hooks/, services/

### Testing
- Vitest for backend unit tests (against real DB)
- TDD approach: RED → GREEN → REFACTOR
- Frontend: manual testing

### Code Quality
- ESLint + Prettier for linting and formatting
- Winston for logging
- Conventional commits with TDD context: feat:, fix:, test:, refactor:, chore:

## Consequences

- Better Auth handles auth complexity, reducing custom code
- ImageKit adds external dependency but simplifies image management
- PostgreSQL on Railway is production-grade but requires connection pooling awareness
