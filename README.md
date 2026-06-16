<h1 align="center">
  <br>
  ✂️ Snip - Premium URL Shortener
  <br>
</h1>

<h4 align="center">A production-grade, full-stack URL shortening platform with a stunning Glassmorphism UI, advanced caching, and real-time click analytics.</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#live-demo">Live Demo</a> •
  <a href="#architecture--performance">Architecture</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#local-development">Local Setup</a>
</p>

<!-- ![Snip Application Screenshot](https://via.placeholder.com/1200x600.png?text=Snip+URL+Shortener+UI+Screenshot) -->
> **Note**: *Replace this image URL with an actual screenshot of your live Glassmorphism UI!*

---

## 🚀 Live Demo

You can test the fully functional live application here:
**👉 [https://url-shortener-yva7.onrender.com](https://url-shortener-yva7.onrender.com)** *(Replace with your actual Render domain if different)*

---

## 🌟 Key Features

* **Custom Aliases**: Users can generate random 7-character short codes or define their own memorable custom aliases (e.g., `snip.com/my-portfolio`).
* **Real-Time Analytics**: Built-in tracking system that records total clicks, unique IP traffic, and timestamps for every shortened URL.
* **Lightning Fast Redirects**: Achieves sub-millisecond redirect latency by caching high-traffic URLs in Redis, drastically reducing database load.
* **Robust Rate Limiting**: IP-based rate limiting built on Redis Pipelines to prevent API abuse and DDoS attacks.
* **Premium User Interface**: A bespoke, responsive Single Page Application (SPA) designed with a modern "Glassmorphism" aesthetic, ambient background animations, and seamless asynchronous state handling.
* **Fault-Tolerant Architecture**: Implements graceful degradation—if the Redis cache goes offline, the application seamlessly falls back to the primary PostgreSQL database without dropping a single request or crashing.

---

## 💻 Tech Stack

### Frontend (UI)
* **HTML5 & CSS3**: Vanilla, semantic markup with advanced CSS techniques (backdrop-filter, CSS variables, keyframe animations).
* **JavaScript (ES6+)**: Asynchronous fetch API, DOM manipulation, and dynamic component rendering without heavy frameworks.

### Backend (API)
* **Node.js (v20) & Express.js**: High-performance asynchronous REST API.
* **TypeScript**: Strict type-checking for enterprise-grade reliability and self-documenting code.
* **Prisma ORM**: Type-safe database access and automated schema migrations.
* **Zod**: Declarative runtime schema validation for incoming API payloads.

### Infrastructure & DevOps
* **PostgreSQL (v15)**: Primary relational database storing URLs and analytics data securely.
* **Redis (v7)**: In-memory data store used for read-through caching and atomic rate-limiting.
* **Docker & Docker Compose**: Containerized environment ensuring 100% parity between local development and production.

---

## 🏗 Architecture & Performance

### Read-Through Caching Strategy
To ensure maximum redirect performance, the application implements a read-through cache mechanism:
1. When a user navigates to a short link, the Express server first queries **Redis**.
2. If it's a **Cache Hit**, the server redirects the user instantly (avg < 5ms).
3. If it's a **Cache Miss**, the server queries **PostgreSQL**, redirects the user, and asynchronously updates the Redis cache with a TTL (Time-To-Live) of 1 hour to serve subsequent requests.

### Graceful Degradation
To prevent a single point of failure, all Redis operations are wrapped in safe `try/catch` blocks. If the Redis server experiences an outage or network partition, the application **fails open**, skipping the cache and defaulting entirely to the PostgreSQL database until Redis comes back online.

---

## 📖 API Reference

If you prefer to use the API directly (via cURL, Postman, or your own app), here are the available endpoints:

### 1. Shorten a URL
* **Endpoint**: `POST /api/v1/shorten`
* **Headers**: `Content-Type: application/json`
* **Body**:
  ```json
  {
    "url": "https://en.wikipedia.org/wiki/James_Webb_Space_Telescope",
    "customCode": "webb-space" // Optional
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-string",
      "originalUrl": "https://...",
      "shortCode": "webb-space",
      "createdAt": "2024-03-24T12:00:00Z"
    }
  }
  ```

### 2. Get Analytics
* **Endpoint**: `GET /api/v1/analytics/:shortCode`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalClicks": 42,
      "recentClicks": [
        {
          "ipAddress": "192.168.1.1",
          "userAgent": "Mozilla/5.0...",
          "clickedAt": "2024-03-24T12:05:00Z"
        }
      ]
    }
  }
  ```

---

## 🛠 Local Development Setup

To run this application locally, you only need [Docker](https://www.docker.com/) installed on your machine.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/snip-url-shortener.git
   cd snip-url-shortener
   ```

2. **Start the application**:
   ```bash
   # This will automatically build the Node image, pull Postgres and Redis, and sync the database schema.
   docker-compose up --build
   ```

3. **Open the App**:
   Visit `http://localhost:3000` in your web browser.

---

<p align="center">
  Built with ❤️ by an aspiring Full-Stack Developer.
</p>
