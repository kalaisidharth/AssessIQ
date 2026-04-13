# AssessIQ — AI-Powered Interview Assessment Platform

A full-stack interview assessment platform with automatic AI question generation, multi-round testing with knockout logic, and separate admin/candidate dashboards.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React + Vite + Tailwind CSS         |
| Backend   | FastAPI (Python)                    |
| Database  | MongoDB (via Motor async driver)    |
| AI        | Anthropic Claude (question gen)     |
| Auth      | JWT (Bearer tokens)                 |

---

## Features

### Admin
- Create assessments with 1–6 configurable rounds
- AI auto-generates MCQ questions per round (topic, difficulty, count)
- Set per-round minimum pass scores (editable anytime)
- Assign assessments to specific users
- Re-generate questions on demand
- View all candidates and their detailed results
- Dashboard with live stats

### Candidate (User)
- Register and see assigned assessments
- Take timed, round-by-round assessments
- Automatic knockout: fail a round → assessment ends immediately
- Full answer review with explanations after each round
- Personal dashboard with score history

---

## Project Structure

```
interview-assessment/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   └── schemas.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── admin.py
│   │   ├── user.py
│   │   └── assessment.py
│   └── services/
│       └── ai_service.py
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── utils/
        │   └── api.js
        ├── components/shared/
        │   ├── Sidebar.jsx
        │   ├── PageLayout.jsx
        │   ├── StatCard.jsx
        │   └── StatusBadge.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── admin/
            │   ├── AdminDashboard.jsx
            │   ├── AdminUsers.jsx
            │   ├── AdminUserDetail.jsx
            │   ├── AdminAssessments.jsx
            │   ├── AdminResults.jsx
            │   └── CreateAssessment.jsx
            └── user/
                ├── UserDashboard.jsx
                ├── UserAssessments.jsx
                ├── TakeAssessment.jsx
                ├── UserResults.jsx
                └── ResultDetail.jsx
```

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running locally (or Atlas URI)
- Anthropic API key

---

### Backend

```bash
cd backend

# Copy and configure env
cp .env.example .env
# Edit .env: set ANTHROPIC_API_KEY and MONGODB_URL

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

### Create Your First Admin

Use the API directly (Swagger UI or curl):

```bash
curl -X POST http://localhost:8000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "email": "admin@example.com", "password": "yourpassword"}'
```

> **Note:** In production, protect the `/api/auth/admin/register` endpoint (add a secret key check or remove it after setup).

---

## Workflow

1. **Admin** creates an assessment with 4 rounds, sets topics + difficulty + min scores
2. **Admin** assigns it to registered users
3. **User** logs in → sees assigned assessment → clicks "Start Test"
4. Each round: AI-generated MCQs + countdown timer
5. Submit round → instant scoring → if score < minimum → **assessment ends**
6. Pass all 4 rounds → **completed** with full breakdown
7. **Admin** views all results, drill into per-user per-round details

---

## Environment Variables

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=interview_assessment
SECRET_KEY=change-this-to-a-random-64-char-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Free Hugging Face token — sign up at huggingface.co, then:
# Profile → Settings → Access Tokens → New token (Read access is enough)
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Generate a secure SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### AI Model Used
The platform uses **Mistral-7B-Instruct-v0.3** via the Hugging Face free Inference API. No credit card required — just a free HF account and a Read token.

If you want to swap to a different model, change `HF_API_URL` in `backend/services/ai_service.py`. Good alternatives:
- `HuggingFaceH4/zephyr-7b-beta` — similar quality
- `meta-llama/Llama-3.2-3B-Instruct` — faster, needs HF Pro for some variants
- `google/flan-t5-xxl` — smaller, may need prompt tuning

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/admin/register` | Register admin |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/{id}/results` | User's results |
| POST | `/api/admin/assessments` | Create assessment (AI generates questions) |
| GET | `/api/admin/assessments` | List assessments |
| PUT | `/api/admin/assessments/{id}/assign` | Assign users |
| PUT | `/api/admin/assessments/{id}/min-scores` | Update min scores |
| DELETE | `/api/admin/assessments/{id}` | Delete |
| POST | `/api/admin/regenerate-questions/{id}` | Regenerate AI questions |
| GET | `/api/admin/results` | All results |

### Assessment (User)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assessment/{id}/start` | Start or resume |
| GET | `/api/assessment/{id}/round/{n}/questions` | Get round questions |
| POST | `/api/assessment/{id}/round/{n}/submit` | Submit answers |

---

## Customization

- **Rounds**: Default is 4, configurable up to 6 per assessment
- **Questions**: 3–20 per round
- **Difficulty**: easy / medium / hard (changes AI prompt)
- **Time limits**: 5–120 minutes per round
- **Min score**: 0–100% per round (admin can change anytime)
