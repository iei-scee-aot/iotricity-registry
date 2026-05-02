# Iotricity Registry

Event user registration backend and frontend built with TypeScript, Express, and MongoDB.

## Project Structure

- `server/` — Express API with Better Auth, Razorpay payments, and Swagger docs
- `client/` — Frontend application
- `admin/` — Admin dashboard

---

## Server Setup

### Prerequisites: Install Bun

Bun is a fast JavaScript runtime, package manager, and bundler. Install it based on your OS:

#### macOS / Linux

```bash
curl -fsSL https://bun.sh/install | bash
```

#### Windows (PowerShell)

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### Homebrew (macOS / Linux)

```bash
brew install oven-sh/bun/bun
```

#### npm

```bash
npm install -g bun
```

After installation, verify it's working:

```bash
bun --version
```

### Installation

1. Navigate to the server directory:

```bash
cd server
```

2. Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGO_URI` — MongoDB connection string
- `BETTER_AUTH_URL` — Base URL for Better Auth
- `BETTER_AUTH_SECRET` — Secret key for authentication
- `CLIENT_ORIGIN` — Frontend URL (e.g., `http://localhost:5173`)
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `RAZORPAY_KEY_ID` — Razorpay payment key ID
- `RAZORPAY_KEY_SECRET` — Razorpay payment key secret
- `PORT` — Server port (defaults to `4000`)

3. Install dependencies:

```bash
bun install
```

### Development

Start the development server with hot-reload:

```bash
bun run dev
```

The server will start on `http://localhost:4000` (or the port specified in `.env`).

### Build for Production

```bash
bun run build
```

### Start Production Server

```bash
bun run start
```

### Type Checking

```bash
bun run check
```

### Test Scripts

```bash
bun run test:health    # Test health endpoint
bun run test:auth      # Test authentication flow
bun run test:payment   # Test payment integration
```

---

## API Documentation (Swagger)

Once the server is running, access the interactive Swagger UI at:

```
http://localhost:4000/api-docs
```

The documentation is auto-generated from JSDoc `@openapi` comments in the route files. You can:

- Browse all available API endpoints organized by tags
- View request/response schemas
- Test endpoints directly from the browser using the "Try it out" button
- See authentication requirements for each endpoint

---

## Client & Admin Setup

### Client

```bash
cd client
cp .env.example .env
bun install
bun run dev
```

### Admin

```bash
cd admin
bun install
bun run dev
```
