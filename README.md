AURA - AI Powered Hotel Booking System
=======================================

Built by Atharv Kulkarni

AURA is a full-stack hotel booking platform powered by multiple AI providers including Google Gemini, Groq, and OpenRouter. Users can search hotels, make bookings, modify or cancel reservations, and interact with a voice-enabled AI assistant that handles everything through natural conversation.

---

WHAT THIS PROJECT DOES
-----------------------

- Users can register and log in securely
- Browse luxury hotels across Mumbai, Delhi, Jaipur, Udaipur, Goa, and Bengaluru
- Book, modify, and cancel hotel reservations through the website
- Chat with AURA, an AI assistant that can search hotels and complete bookings through conversation
- Use voice commands to interact with the AI (say "Hey AURA" to wake it up)
- Receive booking confirmation and cancellation emails automatically
- Admins can manage hotels, view all bookings, and monitor system performance

---

TECH STACK
----------

Frontend
  - React 19
  - TypeScript
  - Vite 8
  - Zustand (state management)
  - Axios (HTTP client)
  - Vanilla CSS

Backend
  - Node.js
  - Express 4
  - TypeScript
  - SQLite (database via better-sqlite3)
  - JWT (authentication)
  - Nodemailer (emails via Gmail SMTP)
  - Redis (caching)

AI Providers (in fallback order)
  - Google Gemini 1.5 Flash (primary)
  - Groq LLaMA 3.3-70b (secondary)
  - OpenRouter LLaMA 3.1-8b (tertiary)

---

REQUIREMENTS BEFORE STARTING
------------------------------

Make sure you have these installed on your computer:

1. Node.js version 18 or higher
   Download from: https://nodejs.org

2. Redis (used for AI response caching)
   Windows: Download from https://github.com/microsoftarchive/redis/releases
   Or use Docker: docker run -d -p 6379:6379 redis:alpine

3. Git (to clone the project)
   Download from: https://git-scm.com

To check if Node.js is installed, open a terminal and run:
   node --version

To check if Redis is installed:
   redis-cli ping
   (it should reply with PONG)

---

STEP 1 - CLONE THE PROJECT
----------------------------

Open a terminal and run:

   git clone https://github.com/AtharvK-creator/AI-Powered-Hotel-Booking-Agent.git

Then go into the project folder:

   cd "AI-Powered-Hotel-Booking-Agent"

---

STEP 2 - SET UP ENVIRONMENT VARIABLES
---------------------------------------

The project needs a .env file in the root folder (the main project folder, not inside server or client).

Create a file called .env in the root of the project and paste the following into it:

   PORT=5000
   NODE_ENV=development

   JWT_SECRET=replace_this_with_any_long_random_string_at_least_32_characters
   JWT_REFRESH_SECRET=replace_this_with_a_different_long_random_string_32_chars
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   EMAIL_ENABLED=false
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_gmail_address
   SMTP_PASS=your_gmail_app_password
   SMTP_FROM=your_gmail_address

   DB_PATH=./database.sqlite

   REDIS_URL=redis://127.0.0.1:6379

Notes about the above values:

  JWT_SECRET and JWT_REFRESH_SECRET:
    These can be any long random text. For example:
    JWT_SECRET=mySuperSecretKeyThatNoOneShouldKnow2024ProjectAura

  GEMINI_API_KEY:
    Get a free key from https://aistudio.google.com/apikey

  GROQ_API_KEY:
    Get a free key from https://console.groq.com

  OPENROUTER_API_KEY:
    Get a free key from https://openrouter.ai

  EMAIL_ENABLED:
    Set to false if you do not want to send real emails.
    Set to true and fill in SMTP details if you want real confirmation emails.

  Gmail App Password (only needed if EMAIL_ENABLED is true):
    Go to your Google Account settings, then Security, then 2-Step Verification,
    then scroll down to App Passwords and generate one for this project.

---

STEP 3 - INSTALL DEPENDENCIES
-------------------------------

You need to install packages for both the server and the client separately.

First, install server dependencies:
   cd server
   npm install

Then go back and install client dependencies:
   cd ..
   cd client
   npm install

Then go back to the root folder:
   cd ..

---

STEP 4 - START THE BACKEND SERVER
-----------------------------------

Open a terminal window (or tab) and run:

   cd server
   npm run dev

You should see output like this:
   Database initialized
   Server running on http://localhost:5000
   Gemini AI: configured

Keep this terminal open. The backend runs on port 5000.

---

STEP 5 - START THE FRONTEND
-----------------------------

Open a second terminal window (or tab) and run:

   cd client
   npm run dev

You should see:
   VITE ready in 255ms
   Local: http://localhost:5173

Keep this terminal open too. The frontend runs on port 5173.

---

STEP 6 - OPEN THE WEBSITE
---------------------------

Open your browser and go to:

   http://localhost:5173

You should see the AURA hotel booking website with a loading splash screen.

---

HOW TO LOG IN FOR THE FIRST TIME
----------------------------------

The system creates a default admin account automatically when it first starts.

Admin account:
  Email: admin@aura.com
  Password: admin123

To create a regular user account, click Register on the website and fill in your details.

---

USING THE AI ASSISTANT
------------------------

Once logged in, you can open the AI chat in two ways:

1. Click the chat icon at the bottom right corner of the screen
2. Say "Hey AURA" out loud if your browser has microphone access

Example things you can say or type:
  - Find me hotels in Goa for next weekend
  - Book the Taj hotel for 2 guests from June 20 to June 25
  - Cancel my latest booking
  - Show me my bookings
  - What hotels are available in Udaipur under 10000 rupees?

---

ADMIN PANEL
------------

Log in with the admin account (admin@aura.com / admin123) and go to:

   http://localhost:5173/admin

From there you can:
  - View all users and bookings
  - Add, edit, or deactivate hotels
  - See AI performance metrics
  - Monitor system health

---

PROJECT FOLDER STRUCTURE
--------------------------

The project has two main folders:

client folder (Frontend)
  src
    pages         - Each page of the website (Login, Hotels, Bookings, etc.)
    components    - Reusable UI pieces (Navbar, AI Assistant, Hotel Cards, etc.)
    store         - App state (login status, user info)
    api           - Functions that talk to the backend
    types         - TypeScript type definitions

server folder (Backend)
  src
    controllers   - Handle each type of request (auth, hotels, bookings, chat)
    routes        - Define API endpoints
    models        - Database read and write logic
    services
      ai          - AI agent, router, caching, memory, analytics
      email       - Email sending logic and templates
      hotel       - Hotel data and seeding
      monitoring  - System health tracking
    middleware    - Security, authentication checks, error handling
    config        - Database setup, environment variables
    utils         - JWT utilities, ID generation

---

RUNNING IN PRODUCTION WITH DOCKER
-----------------------------------

If you want to run the entire project in a single container:

Step 1 - Make sure Docker is installed
  Download from: https://www.docker.com

Step 2 - Build and start everything
   docker compose up --build -d

Step 3 - Open the website at:
   http://localhost:5000

The Docker setup runs the backend and frontend together from a single server.
It also starts a Redis container automatically.

To stop Docker:
   docker compose down

---

COMMON PROBLEMS AND FIXES
---------------------------

Problem: "Cannot connect to Redis"
Fix: Make sure Redis is running. On Windows, start the Redis server from where you installed it.

Problem: "GEMINI_API_KEY is not set" or AI does not respond
Fix: Make sure your .env file has a valid API key for at least one provider (Gemini, Groq, or OpenRouter).

Problem: Port 5000 is already in use
Fix: Change PORT=5000 to PORT=5001 in your .env file, and update the proxy target in client/vite.config.ts from 5000 to 5001.

Problem: Frontend cannot reach the backend
Fix: Make sure both terminals (server and client) are running at the same time.

Problem: Emails are not being sent
Fix: Set EMAIL_ENABLED=false in .env to disable emails. If you want real emails, make sure you are using a Gmail App Password (not your regular Gmail password).

---

API ENDPOINTS REFERENCE
------------------------

Auth
  POST /api/auth/register     - Create a new account
  POST /api/auth/login        - Log in
  POST /api/auth/refresh      - Get a new access token
  POST /api/auth/logout       - Log out
  GET  /api/auth/profile      - Get your profile
  PUT  /api/auth/profile      - Update your profile

Hotels
  GET /api/hotels             - Search hotels with filters
  GET /api/hotels/:id         - Get one hotel by ID

Bookings
  POST   /api/bookings        - Create a booking
  GET    /api/bookings/my     - See your bookings
  PUT    /api/bookings/:id    - Modify a booking
  DELETE /api/bookings/:id    - Cancel a booking

AI Chat
  POST   /api/chat/message    - Send a message to AURA
  GET    /api/chat/history    - Get conversation history
  DELETE /api/chat/history    - Clear conversation

Admin (requires admin login)
  GET  /api/admin/stats       - Dashboard stats
  GET  /api/admin/users       - All users
  GET  /api/admin/bookings    - All bookings
  POST /api/admin/hotels      - Add a hotel
  PUT  /api/admin/hotels/:id  - Edit a hotel

Health Check
  GET /api/health             - Check if server is running

---

Author: Atharv Kulkarni
Project: AURA AI Powered Hotel Booking System
