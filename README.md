# Car Dealership Inventory System

A full-stack Car Dealership Inventory System built with TDD principles. This application allows users to browse, search, purchase, and manage vehicle inventory with role-based access control.

## Video Demo

[![Video Demo](https://img.youtube.com/vi/WBSVKFyv1vI/0.jpg)](https://youtu.be/WBSVKFyv1vI)

## Screenshots

![Featured Vehicles](screenshots/featured-vehicles.png)

![Dashboard](screenshots/dashboard.png)

![Vehicle Table](screenshots/vehicle-table.png)

![Add Vehicle Modal](screenshots/add-vehicle-modal.png)

## Tech Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Better Auth (JWT-based)
- **Validation:** Zod
- **Testing:** Vitest

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** TanStack Router
- **State Management:** TanStack React Query
- **UI Components:** shadcn/ui

## Features

- **User Authentication:** Register and login with secure token-based auth
- **Vehicle Management:** Full CRUD operations for vehicle inventory
- **Search & Filter:** Search vehicles by make, model, category, or price range
- **Purchase System:** Buy vehicles with automatic quantity tracking
- **Role-Based Access:** Admin-only operations (delete, restock)
- **Responsive UI:** Modern, mobile-friendly interface

## Project Structure

```
kata/
├── client/                 # React frontend
│   └── src/
│       ├── app/           # App configuration
│       ├── components/    # Reusable UI components
│       ├── routes/        # TanStack Router routes
│       └── hooks/         # Custom React hooks
├── server/                # Express backend
│   └── src/
│       ├── db/            # Database schema and connection
│       ├── lib/           # Shared utilities
│       ├── modules/       # Feature modules (vehicles, purchases, admin)
│       └── test/          # Test utilities
└── docker-compose.yml     # PostgreSQL setup
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker (for PostgreSQL)

### 1. Start the Database

```bash
docker compose up -d
```

This starts a PostgreSQL instance on `localhost:5432` with:
- User: `car_dealership`
- Password: `car_dealership_dev`
- Database: `car_dealership`

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your settings:

```env
PORT=3000
DATABASE_URL=postgresql://car_dealership:car_dealership_dev@localhost:5432/car_dealership
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
```

### 4. Run Database Migrations

```bash
pnpm --filter car-dealership-server db:push
```

### 5. Seed the Database (Optional)

```bash
pnpm --filter car-dealership-server db:seed
```

### 6. Start Development Servers

```bash
pnpm dev
```

This runs both:
- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:5173

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |

### Vehicles
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/vehicles` | List all vehicles | Yes |
| GET | `/api/vehicles/search` | Search vehicles | Yes |
| POST | `/api/vehicles` | Add new vehicle | Yes |
| PUT | `/api/vehicles/:id` | Update vehicle | Yes |
| DELETE | `/api/vehicles/:id` | Delete vehicle | Admin only |

### Inventory
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/vehicles/:id/purchase` | Purchase vehicle | Yes |
| POST | `/api/vehicles/:id/restock` | Restock vehicle | Admin only |

## Available Scripts

### Root
- `pnpm dev` - Start both client and server in development mode
- `pnpm build` - Build both client and server
- `pnpm test` - Run server tests

### Server (`pnpm --filter car-dealership-server`)
- `db:generate` - Generate migration files
- `db:migrate` - Run migrations
- `db:push` - Push schema changes
- `db:studio` - Open Drizzle Studio
- `db:seed` - Seed database with sample data
- `test` - Run tests
- `test:watch` - Run tests in watch mode
- `typecheck` - TypeScript type checking
- `lint` - Run ESLint

### Client (`pnpm --filter client`)
- `dev` - Start Vite dev server
- `build` - Build for production
- `lint` - Run ESLint

## AI Usage

### Tools Used
Opencode , Kilo code 
- i have used this 2 tools for majority of my work 
- i was using them bcz they provide a generous free tier for students 

### How I Used AI

 Back-end
- i have basically first started on my implementation with a grill-me skill (by mattpocccok)
it is like a plan mode but better
- this is also available in repos folder name grill-with-docs 
- and then i have made this type of project before so i had already some of the refrecnce point
- i gave ai to acces to my another proejct folder and told it i want this type of folder structure and data flow 
- then i after the project setup , i have gone through all of the api spec in your PRD and discuss about the 
DB design , and then i also enforced some of the types and interface decision to the AI

- then i told ai we ae doing the TDD (this was my first time so i have to do some research also)
- then after i and agent decided with the how to implement the APIs with TDD i have gone some of the back and forth
- and i hand holded 1st one and gave feedback on it and when i was happy with the first one i gave a another agent
according to implement pattern of the first on do others 

- i was using the better-auth , so i also gave it guide on the how to implement how to do the roles and what roles to choose and make a permission management 

- after all of that done i have a code review skill (now it is so cheap so that before my review it is trivial that another agent checks it) saves a lot of time 
- after the code review sessions i have fixed some of the error that was found by it

front - end 
- i have followed same process first setup the vite react tanstack thing etc 
- gave info on folder structure and init a shadcn project 
- i have made UI prototypes choosed and picked what i liked from each of them gave my preferece  
- and gave info about the backend api and then let it rip
- after i hand tested and gave some feedback on the layout , spacing on some of the elements 


### Reflection
AI tools significantly accelerated development by handling repetitive tasks, but human judgment was essential for architectural decisions and ensuring code quality. The combination of AI assistance and careful code review resulted in cleaner, more maintainable code.

## Test Suite

The backend test suite uses **Vitest** with **Supertest** for API integration testing.

### Running Tests

```bash
pnpm test
```

### Test Results

```
 Test Files  2 passed (2)
      Tests  44 passed (44)
   Duration  18.94s
```

### Test Coverage

| Module | Tests | Description |
|--------|-------|-------------|
| Auth | 12 | Registration, login, token validation |
| Vehicles | 18 | CRUD operations, search, validation |
| Purchases | 8 | Purchase flow, quantity management |
| Admin | 6 | Role-based access, restock, delete |

All 44 tests pass successfully, covering core API functionality including authentication, vehicle management, inventory operations, and role-based access control.
