# PROMPTS.md — AI Chat History for Car Dealership Inventory System

This document contains all prompts used during the development of this project via opencode (AI coding assistant).

---

## Key Decision Points

1. **Category system**: Hatchback, Sedan, SUV, Truck, Coupe (Prompt 2)
2. **Out of stock handling**: Frontend grayed-out button + backend rejection (Prompt 3)
3. **Admin role**: Better Auth with `isAdmin` boolean, promoted via `setRole` endpoint (Prompts 4-7)
4. **Image handling**: ImageKit + Multer for uploads (Prompt 8)
5. **Deployment split**: FE on Vercel, BE on Railway, PostgreSQL (Prompt 10)
6. **Naming**: `make` → `maker`, `page` → `currentPage` (Prompt 11)
7. **Testing**: Vitest backend-only with real DB, manual FE testing (Prompt 13)
8. **DB migrations**: Drizzle generate + migrate (not push) (Prompt 14)
9. **Git workflow**: Conventional commits with TDD context (Prompt 17)
10. **Admin panel**: Separate admin-only page for CRUD operations (Prompt 12)

## Top 10 Most Impactful Prompts

| # | Prompt | Impact |
|---|--------|--------|
| **1** | **Grill session decisions** (Prompts 1-18) | Defined the entire architecture: Express+TypeScript backend, Vite+React+shadcn frontend, PostgreSQL+Drizzle, Better Auth, ImageKit, Railway+Vercel deployment, Vitest testing. Set the project direction. |
| **2** | **"Do the gen and then migrate"** (Prompt 14) | Decided on Drizzle ORM's generate+migrate workflow over push — production-grade schema management. |
| **3** | **"Not monorepo, separate BE/FE"** (Prompt 16) | Changed deployment strategy from monolith to separate services — fundamentally changed project structure. |
| **4** | **API error handling pattern** (Prompts 19-20) | Established consistent error/response format (`{success, error: {code, message}}`) across the entire API. |
| **5** | **Dashboard UI fixes** (Prompts 23-36) | Fixed table alignment, card overflow, pagination, search filters, grid layout — transformed the UI from broken to polished. |
| **6** | **Purchase flow + DB schema** (Prompts 37-42) | Added purchase tracking, transaction support, proper Drizzle schema with relations — critical business logic. |
| **7** | **Architecture deepening** (Prompt 48) | Comprehensive codebase analysis identifying shallow modules, coupling issues, and deepening opportunities. |
| **8** | **Step-by-step bug fixes** (Prompts 49-55) | Fixed purchase button, pagination, chart alignment, Zod validation, React errors — systematic issue resolution. |
| **9** | **README creation** (Prompts 44-46) | Created comprehensive documentation with screenshots, video demo, test report, and AI usage section as required by PRD. |
| **10** | **Subagent exploration** (Prompts 56-67) | Deep codebase analysis for architecture review, standards review, spec compliance, and bug investigation. |

---

## All Prompts (Chronological)

## 1. Project Kickoff & Requirements Gathering

### Session: Kicking off project with documentation

**Prompt 1:**
> There is a project requirement document. I have one recruitment process as a company name Incubyte, which are having the habit of and following the agile practices and test-driven development, and spec-first development like this, so they gave this problem statement to build. Today is Tuesday and deadline is Thursday 10pm, so let's start with the grill with docs skill.

**Prompt 2:**
> The spec does not provide the full information about what should be counted as the category, so probably we could do like the popular ones like hatchback and sedan and trucks, that sounds nice and simple.

**Prompt 3:**
> That should be marked as out of stock and the user should not be able to click that button — that is only frontend-only managed thing. When you get the response from the backend that the quantity is zero, then you mark the button as out of stock and now that button is not clickable, it should look like a grayed button which you are not able to click, you get my point?

**Prompt 4:**
> So let's discuss more on this. I think this is more of a simple model type. Using RBAC is gonna work, right? We don't need the more relational and that type of role managing, right?

**Prompt 5:**
> Then how do we make sure that when in the onboarding process if an admin wants to go to the one board, how should that look like in the form? You are asking each user if they are an admin or not — how do we decide that we get the correct isAdmin value? If we put it into the form then any user can select the default to admin and get the admin access, right?

**Prompt 6:**
> I am showing to some other person and want to give a demo and want to give them admin access, so can we do something like this — we have an endpoint that adds the particular email to the admin list and we can protect it in some way. Also, I am thinking to use Better Auth from a library and they also provide the basic admin and role managed stuff, right?

**Prompt 7:**
> https://better-auth.com/docs/plugins/admin#set-user-role

**Prompt 8:**
> Yeah, we could add the description and image — that is going to require setting up an additional service for image managing like Multer and an image provider like Cloudinary or ImageKit. But created and updated at are both nice, and description is also nice, but let's do it — let's add ImageKit and Multer for images also.

**Prompt 9:**
> For the specific tech, I am picking full stack Node.js and TypeScript for this project. Use Express, Zod, express-rate-limit for backend, cookie-parser, cors, etc., backend-related stuff. Winston logger, proper pagination, proper error handling. And for the FE we are gonna use Vite + React (shadcn for UI elements) and we are gonna deploy it on Vercel — both BE and FE, in a monolith fashion (can we do it? I do not know).

**Prompt 10:**
> Nope nope, let's do this: FE on Vercel and BE on Railway and PostgreSQL as DB.

**Prompt 11:**
> Let's give better naming — instead of "make" let's use "maker", and let's use this pagination, rename "page" to "currentPage". Yeah, params look nice.

**Prompt 12:**
> Decisions regarding login, registration, and all UI elements are gonna be made when we are going to make it, so don't worry about those for now. As for the admin user, I want a separate admin panel/page accessible only to the administrator; they should be able to edit anything — such as adding or removing cars, adjusting quantities, delete, etc.

**Prompt 13:**
> Let's for now do the backend only unit test and use Vitest, and we are gonna use the actual DB. FE is gonna be manually tested.

**Prompt 14:**
> Do the gen and then migrate.

**Prompt 15:**
> Let's start first — do use pnpm and init project and install basic deps, and make a folder structure and do a git commit init. Also, I do not have a git repo for this project, so also make sure to add it — it should be a public repo.

**Prompt 16:**
> Not monorepo — basic MERN app. BE and FE are gonna be separate because backend is going on Railway and FE is going on Vercel.

**Prompt 17:**
> Do as I say — just make an empty folder structure and install deps, and then make git init and gh repo and push it. Remember we are following agile practice, so do micro commits, and use the format given in PRD.md.

**Prompt 18:**
> I want some changes in the context or the grilling — edit the monorepo thing because we are not doing it, and in the git section we are following TDD instead of the traditional thing.

---

## 2. API Error Handling & Response Patterns

### Session: Copying API error and response patterns from oidc-auth

**Prompt 19:**
> I have a separate project structure we are gonna copy its folder structure and error handling format — /repos/oidc-auth is the location. First you go through this and tell me what you have found, if you got anything wrong I am gonna assist you.

**Prompt 20:**
> Yeah, although this is not the FE-heavy codebase, but here is the good structure for it — for the Vite + React + shadcn.

---

## 3. Admin Role Management & UI Fixes

### Session: Promoting user dev to superadmin role

**Prompt 21:**
> If I want to add a user to the superadmin permission group, what do I have to figure out? In the DB I have email/name data — in here I have a user named "dev" and email is dev@email.com, promote its role.

**Prompt 22:**
> You have the access of the MCP DevTools, right? Go through the website and find out why the dashboard is not working. Also, this purchase button is also overflowing.

**Prompt 23:**
> Fix all of these issues. Another agent was working, so check again — if these 3 existing issues were not fixed then fix it. Also add this to todo: table header row not aligned properly, and in the sidebar remove all the unnecessary things which are not wired.

**Prompt 24:**
> Also check for any hardcoded items in the whole FE.

**Prompt 25:**
> Also I want more filter options — based on newer, price low to high, high to low, company, etc.

**Prompt 26:**
> Instead of this I want grid card thing — long long box looks bad.

**Prompt 27:**
> Align this table header.

**Prompt 28:**
> And in the header use "maker" and remove "make".

**Prompt 29:**
> Also add vehicle should be inline with the filter option lines, also add a search in the dashboard.

**Prompt 30:**
> I have updated the quantity and it should auto reflect without refresh, right? And I also want the search filter based on the quantity.

**Prompt 31:**
> Also when I do the next and previous, the table layout is shifting due to some having longer names on car/maker, etc. Make sure that does not happen. Also at 100% zoom it is not responsive properly.

**Prompt 32:**
> Search by model name does not work — give 2 input boxes, one for maker and one for model, and clean them like trim, etc.

**Prompt 33:**
> I also want the model name search in the homepage for user to search also.

**Prompt 34:**
> Fix this — have a breathing space, better spacing, padding, or gap.

**Prompt 35:**
> This header bar in dashboard needs some padding or gap.

**Prompt 36:**
> This card has some issues — like overflow pill, remove all of that like in stock, active, total, etc. And the text below them like "current inventory", etc.

**Prompt 37:**
> Also when I click "Purchase a Car" in the menu, that should be registered, right? Total vehicle and revenue — all should be affected and graph should be visible also. So make a detailed plan first — how we can do all of this.

**Prompt 38:**
> Also I need better wording — like "Total Car Models Available" (1st), "Car Categories", "Out of Stock Car Models", etc.

**Prompt 39:**
> Let's make a Drizzle schema and add proper relations — what data table and relation are needed?

**Prompt 40:**
> Then we also have to make an API surface for managing the purchase also, right? OK, do it.

**Prompt 41:**
> Add a proper schema to the Drizzle DB folder in server and then use Drizzle gen and migrate.

**Prompt 42:**
> Also check if there is proper transaction setup done or not.

**Prompt 43:**
> Files to Modify — client/src/routes/index.tsx: Add page state, update query, add pagination controls. Another agent is working on this file, so for now do not edit this. If you want, then ask me — when I allow you then you can do it.

---

## 4. README & Documentation

### Session: Create README from PRD.md

**Prompt 44:**
> Let's do a readme file and add all the info in there according to the PRD.md.

**Prompt 45:**
> I have edited the readme.md — what I wanted to add. Now what only remains is the test suite info in the README. Add after the reflection section. Do not edit anything that I have edited.

**Prompt 46:**
> https://youtu.be/WBSVKFyv1vI — also add this as a video demo link. Also add these images in the start of the readme file.

---

## 5. Deployment

### Session: Vercel pnpm install deployment error

**Prompt 47:**
> I have deployed to Vercel and I keep getting this error — [pnpm-lock.yaml error]. I have Vercel CLI installed, just figure out for now.

---

## 6. Architecture & Code Review

### Session: Architecture deepening analysis

**Prompt 48:**
> # Improve Codebase Architecture — Surface architectural friction and propose deepening opportunities — refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability. [Full architecture review prompt].

---

## 7. Step-by-Step Bug Fixes

### Session: Fixing issue.html issues step by step

**Prompt 49:**
> http://127.0.0.1:5500/issue.html — let's go through one by one, let's start with the 1st one. For each issue keep me in the loop — first understand the root of the issue and fix it properly.

**Prompt 50:**
> I told you to keep me in the loop — explain the problem statement to me also, because I should know what is going into the codebase.

**Prompt 51:**
> Also get the Zod schema on the frontend side also — because there also need it for validation.

**Prompt 52:**
> Ready for Issue #3: Purchase button missing? Let's go to this.

**Prompt 53:**
> Keep the name "maker". Login bg image is good.

**Prompt 54:**
> See in this — button is going outside the card. "View Details" is not working also. Both of those buttons should be at the bottom to the price.

**Prompt 55:**
> I want pagination to also work on the homepage (/ route for the user also). Make a detailed plan — how to do it. Do not edit for now, another agent is on work.

---

## 8. Explore Subagent Prompts

### Session: Explore kata codebase architecture
**Prompt 56:**
> Thoroughly explore the codebase at /home/dev/repos/kata/server/src. I need you to identify architectural friction and shallow modules. Focus on modules/vehicles/, modules/auth/, common/, lib/, db/, app.ts, server.ts, and drizzle/. For each module note: is the interface shallow? Are there tightly coupled modules? Where is logic duplicated? Which modules would benefit from deeper interfaces? Read every file completely.

### Session: Explore server API structure
**Prompt 57:**
> Very thoroughly explore the server directory. I need to understand all API routes/endpoints, data models/schemas, request/response shapes, validation rules or business logic. Read all route, controller, service, model files.

### Session: Research Tanstack Router file-based
**Prompt 58:**
> Research Tanstack Router file-based routing setup for Vite + React + TypeScript. I need to understand the vite plugin, route file naming conventions, route tree generation, layouts, nested routes, and required packages.

### Session: Research shadcn dark mode setup
**Prompt 59:**
> Research how dark mode/theme switching works with shadcn v4 + Tailwind CSS v4. I need to understand theme toggle implementation, needed packages, CSS variables with .dark class, and component placement.

### Session: Standards review of frontend diff
**Prompt 60:**
> You are the Standards axis of a two-axis code review. Check whether the diff conforms to documented coding standards and flag baseline code smells. [Full review prompt with smell baseline].

### Session: Spec review of frontend diff
**Prompt 61:**
> You are the Spec axis of a two-axis code review. Check whether the diff faithfully implements the originating spec/PRD. [Full review prompt with PRD requirements].

### Session: Find dashboard and purchase code
**Prompt 62:**
> I need to investigate two bugs. Bug 1: Dashboard showing "--" for Total Revenue and Out of Stock. Bug 2: Purchase button overflowing on vehicle cards. DO NOT make any edits, just research and report back.

### Session: Find hardcoded values in FE
**Prompt 63:**
> Search the client/src directory for hardcoded values that should be dynamic — hardcoded numbers, strings, URLs, TODO/FIXME comments, category lists that might not match the database.

### Session: Explore purchase flow
**Prompt 64:**
> I need to understand the "purchase a car" flow. What happens when a user clicks "Purchase"? How vehicles are created/edited? How the dashboard fetches data? How the chart works? Does purchase reduce quantity or track separately?

### Session: Check transaction setup
**Prompt 65:**
> Search this codebase for any use of db.transaction() or tx, how the DB connection is set up, whether the purchase flow uses transactions, any existing transaction patterns.

### Session: Find error rendering in client
**Prompt 66:**
> Search the client codebase for where API error responses are rendered in React components. The error is React error #31: "Objects are not valid as a React child". Look for error boundaries, error display components, toast calls, try/catch blocks.

---

## 9. Tailwind CSS Setup

### Session: Tailwind CSS setup errors

**Prompt 67:**
> [architecture-review-client HTML file] — check from this found by another agent also and make a file named issue.html and use it as a todo list for fixing.
