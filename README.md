---
lang: en-US
---

# Webdev Boilerplate

## Table of Content

- [Frameworks](#frameworks)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)

---

## Package manager

- Bun

### Frameworks

1. Vite/React/TS (Frontend)
2. Hono (Backend)
3. Drizzle (ORM)
4. Zod (Validation)
5. Tanstack (Router, Query and Form)
6. Shadcn and Tailwindcss (UI)

### Installation

```bash
 mkdir webapp assets assets/fonts assets/images
 cd webapp
 git clone git@github.com:Felipeazs/bun-hono-react-template.git .

 # Remove git folder
 rm -rf .git

 bun install
```

### Usage

1. Create a postgresql database (Neon in this case).
2. Copy/paste the connection string url into your .env file (see .env.example)
3. Uncomment server.ts lines (29 - 40)
4. Run these commands:

```bash
# Do this every time you make changes in the schemas.
bun drizzle-kit generate
bun migrate.ts
```

- Check build:

```bash
bun run build
```

- Run project in development mode:

```bash
bun dev
```

### Deployment

```bash
railway init -n <name_app>
```

- Copy and paste env variables in your railway project (change NODE_ENV to production)

```bash
railway up --detach
```

- Generate a domain
- Watch your website
