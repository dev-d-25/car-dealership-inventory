# Car Dealership Inventory System

A full-stack application for managing vehicle inventory with user authentication, role-based access control, and image management.

## Tech Stack

- **Backend**: Node.js + TypeScript, Express, Zod, Better Auth
- **Frontend**: Vite + React + shadcn/ui + Tailwind
- **Database**: PostgreSQL
- **Image Hosting**: ImageKit + Multer
- **Backend Hosting**: Railway
- **Frontend Hosting**: Vercel
- **Structure**: Monorepo
- **Testing**: Vitest (backend tests against real DB)
- **Frontend Testing**: Manual
- **Linting**: ESLint + Prettier
- **Logging**: Winston
- **Git**: Conventional commits (feat:, fix:, test:, refactor:, chore:)
- **DB Migrations**: Drizzle Kit generate + migrate

## Language

**Vehicle**:
A car available in the dealership inventory. Has make, model, category, price, quantity, description, and image.
_Auto_: Automobile, car

**Maker**:
The manufacturer/brand of a vehicle (e.g., Toyota, Honda, Ford).
_Auto_: Make, brand, manufacturer

**Model**:
The specific model name of a vehicle within a make (e.g., Camry, Civic, F-150).
_Auto_: Model name, variant

**Category**:
The vehicle type classification. Values: Hatchback, Sedan, SUV, Truck, Coupe.
_Auto_: Type, class

**Quantity**:
The number of units in stock for a vehicle. When zero, vehicle is "Out of Stock".
_Auto_: Stock, inventory count

**Admin**:
A user with elevated privileges who can delete vehicles, restock inventory, and promote other users to admin.
_Auto_: Administrator, superuser

**Purchase**:
An action that decreases vehicle quantity by 1. Rejects if quantity is 0.
_Auto_: Buy, order

**Restock**:
An action that increases vehicle quantity. Admin-only operation.
_Auto_: Replenish, restock inventory
