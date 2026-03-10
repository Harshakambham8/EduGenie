# 🎓🧞‍♂️ EDUGENIE – Google Gemini Powered Learning Assistant

EduGenie is a premium AI-powered academic assistant built using Flask and Google Gemini.

It helps students:

- 🧠 Ask academic questions
- 📖 Get structured explanations
- 📝 Generate quizzes
- 📄 Summarize study material
- ➗ Solve problems step-by-step

Designed with a modern premium UI featuring Light & Dark modes.

---

## 🚀 Features

- AI-powered answers using Google Gemini API
- Structured concept explanations (Beginner / Intermediate / Advanced)
- Auto-generated quizzes with scoring
- Text summarization
- Step-by-step problem solving
- Premium responsive UI
- Light & Dark theme support
- Smooth animations & transitions
- Secure API key handling via environment variables

---

## 🛠 Tech Stack

### 🔹 Backend
- Python 3.10+
- Flask
- Flask-CORS
- Google Gemini (google-genai SDK)
- python-dotenv

### 🔹 Frontend
- HTML5
- CSS3 (Custom Premium UI)
- Vanilla JavaScript

### 🔹 Tools
- VS Code
- Thunder Client (API testing)
- Git & GitHub

---

## 📂 Project Structure

```
EduGenie/
│
├── backend/
│   ├── app.py
│   ├── ai_service.py
│   ├── config.py
│   ├── routes/
│   │   ├── ask.py
│   │   ├── explain.py
│   │   ├── quiz.py
│   │   ├── summarize.py
│   │   ├── solve.py
│
├── frontend/
│   ├── templates/
│   │   ├── index.html
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   └── app.js
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/EduGenie.git
cd EduGenie
```

---

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

Activate it:

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

---

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

If requirements.txt does not exist, generate it:

```bash
pip freeze > requirements.txt
```

---

### 4️⃣ Create .env File

Inside project root, create a file named:

```
.env
```

Add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

⚠️ Never commit your `.env` file.

---

### 5️⃣ Run the Application

Navigate to backend folder:

```bash
cd backend
```

Run:

```bash
python app.py
```

Open browser:

```
http://127.0.0.1:5000
```

---

## 🔐 Security

- API keys are stored securely in `.env`
- `.env` is excluded via `.gitignore`
- Input validation implemented
- Clean JSON parsing for quiz generation

---

## 🌙 UI Highlights

- Premium Academic Dashboard Design
- Glassmorphism Sidebar
- Gradient Background Layers
- Animated Cards
- Smooth Transitions
- Light & Dark Mode Toggle
- Interactive Quiz Scoring

---

## 📌 Future Improvements

- AI typing animation
- Usage analytics
- User authentication
- Save quiz history
- Deployment on Render / Railway / Cloud Run

---

## 👨‍💻 Developed By

Built as part of a Generative AI Internship Project.

---


