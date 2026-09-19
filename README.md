
# LifeKeeper

## You live. We remember.

LifeKeeper is a smart personal reminder and memory system that helps people remember important dates, actions, renewals, services, documents, and everyday responsibilities.

Instead of manually creating reminders one by one, LifeKeeper can understand information from **text, voice, and documents**, extract important dates and actions, and turn them into actionable reminders.

---

## 🌟 Why LifeKeeper?

Important information is scattered everywhere:

- Warranty cards
- Bills and invoices
- Insurance documents
- Vehicle documents
- Service records
- Subscription details
- Appointments
- Important personal notes
- Screenshots and letters

The problem is not always a lack of information.

The problem is **remembering what needs to be done and when**.

LifeKeeper helps convert that information into a structured timeline of actions and reminders.

### Example

Instead of manually entering:

> AC service on December 10

You can simply type or speak:

> Remind me about AC service on December 10.

LifeKeeper extracts the important information and creates a reminder.

---

# ✨ Features

## 🧠 AI Reminder Parsing

Enter reminders using natural language instead of filling complicated forms.

Example:

```text
Renew my vehicle insurance on November 20
````

LifeKeeper uses AI to extract important information such as:

* Title
* Date
* Action
* Reminder details

---

## 📷 Document Intelligence

Upload documents such as:

* Warranty cards
* Bills
* Invoices
* Insurance documents
* Service documents
* Important letters
* Screenshots

The document processing pipeline is:

```text
Document
   ↓
Image preprocessing
   ↓
OCR
   ↓
Extracted text
   ↓
AI analysis
   ↓
Structured reminder
```

OCR is handled using **Tesseract.js**, while the extracted text is processed by the AI layer.

---

## 🎤 Voice Input

LifeKeeper supports browser-based speech input.

Users can speak reminders instead of typing them.

Example:

```text
Remind me to service the AC on December 10.
```

The spoken input is converted into text and processed by the reminder system.

Multilingual speech can also be used depending on browser speech recognition support.

---

## 📅 Smart Reminder Timeline

LifeKeeper organizes reminders into useful categories:

* Overdue
* Today
* Upcoming
* Completed

Each reminder can be:

* Created
* Edited
* Completed
* Cancelled
* Deleted

---

## 🔔 Notifications

LifeKeeper includes browser notification support for reminders.

The application checks for due notifications while the application is active and can display reminder alerts through the browser.

---

## 👤 Secure User Accounts

Each user has a private account.

Authentication uses:

* JWT
* bcrypt password hashing
* Protected API routes
* User-specific reminder ownership

User data is isolated using the authenticated user's ID on the backend.

---

# 🏗️ System Architecture

```text
                  ┌─────────────────────┐
                  │       User          │
                  └──────────┬──────────┘
                             │
                 ┌───────────┼───────────┐
                 │           │           │
                 ▼           ▼           ▼
              Text        Voice       Document
                 │           │           │
                 │           ▼           ▼
                 │     Speech API      OCR
                 │           │           │
                 └───────────┴──────┬────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │   AI Processing │
                           │      Groq       │
                           └────────┬────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │ Structured Data │
                           └────────┬────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │    Express API  │
                           └────────┬────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │  MongoDB Atlas  │
                           └────────┬────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │ Timeline &      │
                           │ Notifications   │
                           └─────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* React Router
* Lucide React

## Backend

* Node.js
* Express.js
* JavaScript

## Database

* MongoDB Atlas
* Mongoose

## AI

* Groq API
* `openai/gpt-oss-120b`

## OCR

* Tesseract.js
* Sharp

## Authentication

* JWT
* bcryptjs

## Voice

* Web Speech API

## Email

* Nodemailer
* Gmail SMTP

## Deployment

* Vercel — Frontend
* Render — Backend
* MongoDB Atlas — Database

---

# 📁 Project Structure

```text
LifeKeeper/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* MongoDB Atlas account
* Groq API key

---

# 1. Clone the Repository

```bash
git clone https://github.com/rjamuna/lifekeeper.git
cd lifekeeper
```

---

# 2. Backend Setup

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

GROQ_API_KEY=your_groq_api_key

JWT_SECRET=your_strong_jwt_secret

EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

Start the backend:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

# 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

Never commit real API keys, passwords, tokens, or database credentials.

The project uses environment variables for sensitive configuration.

Example:

```env
GROQ_API_KEY=your_key
MONGODB_URI=your_database_url
JWT_SECRET=your_secret
EMAIL_PASS=your_app_password
```

The frontend only receives the backend API URL:

```env
VITE_API_URL=https://your-backend-url
```

AI and database credentials remain on the backend.

---

# 🔒 Security

LifeKeeper was designed with several security considerations:

* Password hashing using bcrypt
* JWT-based authentication
* Protected backend routes
* User-specific data access
* Backend-controlled user identity
* Environment variables for secrets
* CORS configuration
* File upload handling
* Backend-only AI API access
* MongoDB credentials kept server-side

User IDs are taken from the authenticated JWT rather than trusting a user ID supplied by the frontend.

---

# 🔄 Main Workflow

```text
User Input
    │
    ├── Text
    │
    ├── Voice
    │
    └── Document
          │
          ▼
     Processing
          │
          ▼
    Important Information
          │
          ▼
       AI Parsing
          │
          ▼
    Reminder Confirmation
          │
          ▼
      MongoDB Storage
          │
          ▼
     Timeline / Alerts
```

---

# 💡 Example Use Cases

## Home Maintenance

```text
AC service on December 10
```

## Vehicle

```text
Vehicle insurance expires on November 20
```

## Subscription

```text
Netflix subscription renews on October 15
```

## Documents

Upload an insurance or warranty document and extract relevant information.

## Personal Tasks

```text
Doctor appointment on October 8 at 10 AM
```

The goal is to make remembering important things easier without requiring users to manually organize every detail.

---

# 📱 User Flow

```text
Login / Register
       ↓
    Dashboard
       ↓
 ┌─────┼───────────────┐
 │     │               │
Text  Voice        Document
 │     │               │
 └─────┼───────────────┘
       ↓
    AI / OCR
       ↓
 Reminder Details
       ↓
    Save Reminder
       ↓
    Timeline
       ↓
 Notification
```

---

# 🌐 Live Demo

### Frontend

[https://lifekeeper-delta.vercel.app](https://lifekeeper-delta.vercel.app)

### Backend Health Check

[https://lifekeeper-backend.onrender.com/api/health](https://lifekeeper-backend.onrender.com/api/health)

---

# 📊 Project Goals

LifeKeeper focuses on making reminder management more natural and useful by combining:

* Natural language
* Voice input
* Document OCR
* AI extraction
* Personal timelines
* Notifications
* Secure user accounts

Instead of asking users to remember everything themselves, LifeKeeper helps turn scattered information into actionable reminders.

---

# 🔮 Future Improvements

Possible future improvements include:

* Progressive Web App support
* Web Push notifications
* Offline support
* Calendar integration
* Gmail integration
* WhatsApp integration
* Family/household shared reminders
* Recurring maintenance schedules
* Better multilingual NLP
* Automatic reminder suggestions
* Document history and version tracking

---

# 🏆 Hackathon Project

**LifeKeeper** was developed as an open-innovation software project focused on solving an everyday problem through AI, automation, and secure web application architecture.

### Core Idea

> **You live. We remember.**

---

# 👩‍💻 Developer

**Jamuna R**

B.E. Computer Science and Engineering — Cyber Security

Sri Eshwar College of Engineering

GitHub: [https://github.com/rjamuna](https://github.com/rjamuna)

---

# 📄 License

This project is intended for educational, hackathon, and portfolio purposes.

```

### One small recommendation

For the GitHub repository, set the description to:

> **LifeKeeper — A smart personal reminder system that turns important documents, notes, and voice input into actionable reminders and timelines.**

And add these repository topics:

```text
react
nodejs
express
mongodb
ai
groq
ocr
tesseract
reminder
productivity
hackathon
javascript
vite
tailwindcss

```
