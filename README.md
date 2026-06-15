# Snip - Premium URL Shortener

A production-grade, full-stack URL shortening platform with click analytics, Redis caching, IP-level rate limiting, and a premium Glassmorphism Frontend UI.

## Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (Single Page Application)
- **Backend API**: Node.js 20, TypeScript, Express.js
- **Database**: PostgreSQL 15 via Prisma ORM
- **Cache & Rate Limiting**: Redis 7
- **Containerization**: Docker + Docker Compose

---

## 🚀 Live Deployment Guide (GitHub & Render)

To make your project live on the internet so anyone can use it (e.g., `https://my-snip.onrender.com`), follow these exact steps:

### Step 1: Upload to GitHub
1. Open a terminal in your project folder (`url-shortener`).
2. Initialize Git and commit your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of full-stack URL shortener"
   ```
3. Go to [GitHub.com](https://github.com/) and create a new empty repository (e.g., `snip-url-shortener`).
4. Follow the instructions on GitHub to push your existing repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/snip-url-shortener.git
   git push -u origin main
   ```

### Step 2: Deploy to Render for FREE
Render natively supports Docker Compose, making deployment incredibly easy.
1. Go to [Render.com](https://render.com/) and sign up with GitHub.
2. Click **New +** and select **Web Service**.
3. Connect your `snip-url-shortener` GitHub repository.
4. **Environment Setup**:
   Render will automatically detect your `Dockerfile`.
   You will need to add two *Add-ons* in Render (or use a free tier equivalent like Supabase for Postgres and Upstash for Redis):
   - Provide a `DATABASE_URL` environment variable pointing to a live PostgreSQL database.
   - Provide `REDIS_HOST` and `REDIS_PORT` pointing to a live Redis instance.
5. Click **Deploy Web Service**. Render will automatically build your Docker container, run your migrations (`npx prisma db push`), and give you a live HTTPS domain!

---

## 💻 Local Development (Docker)

To test the full app locally on your machine, simply run:

```bash
docker-compose up --build
```

Then, open your web browser and visit: **http://localhost:3000/**

You will see the premium Frontend UI where you can create links, and access the Analytics Dashboard!

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/shorten` | Creates a new short URL. |
| `GET` | `/:shortCode` | Redirects to the original URL and tracks the click asynchronously. |
| `GET` | `/api/v1/analytics/:shortCode` | Returns click analytics for a given short URL. |
| `GET` | `/api/v1/health` | Health check endpoint verifying DB and Redis connections. |
