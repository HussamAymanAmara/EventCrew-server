# 🤝 EventCrew Backend (Express + PostgreSQL)

This is the backend server for the **EventCrew** volunteer management platform. It provides REST API endpoints for authentication, volunteers, organizations, opportunities, applications, skills, categories, opportunity images, and required skills.

## 🏗️ Technologies

The EventCrew backend uses the following technologies:

- **Node.js** — runs the backend JavaScript application
- **Express.js** — creates the REST API and handles HTTP requests
- **PostgreSQL** — stores EventCrew application data
- **pg** — connects Node.js to PostgreSQL
- **dotenv** — loads environment variables from the `.env` file
- **cors** — allows the React frontend to communicate with the backend
- **morgan** — logs HTTP requests in the terminal
- **nodemon** — can be used during development to restart the server automatically
- **JavaScript ES Modules** — uses `import` and `export`
- **REST API** — communication between the frontend and backend

---

## 🚀 Getting Started

Follow these steps to run the EventCrew backend locally.

### 1. Clone the repository

```bash
git clone https://github.com/HussamAymanAmara/EventCrew-server.git
cd EventCrew-server
```

---

### 2. Install the backend dependencies

Run:

```bash
npm install
```

This installs all dependencies listed in `package.json`, including:

- Express
- pg
- dotenv
- cors
- morgan
- nodemon

There is no need to install these packages separately.

---

### 3. Set up the PostgreSQL database

Create a PostgreSQL database for EventCrew and make sure the required database schema and tables are added.

The main database tables include:

- `users`
- `volunteer_profiles`
- `organization_profiles`
- `organization_types`
- `categories`
- `skills`
- `volunteer_skills`
- `opportunities`
- `opportunity_skills`
- `opportunity_images`
- `applications`

Make sure PostgreSQL is running before starting the backend.

---

### 4. Create the environment file

Create a `.env` file in the root of the project.

Add:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/EventCrew
```

Replace `username` and `password` with your PostgreSQL credentials.

A `.env.sample` file is also included in the repository as an example.

---

### 5. Start the backend

Run:

```bash
npm start
```

The backend should run on:

```text
http://localhost:5000
```

To confirm that the server is running, open:

```text
http://localhost:5000
```

You should receive:

```text
EventCrew API is running
```

---

### 6. Run the frontend

The EventCrew frontend runs separately and communicates with this backend.

Frontend repository:

```text
https://github.com/HussamAymanAmara/EventCrew-client
```

The frontend normally runs on:

```text
http://localhost:5173
```

while the backend runs on:

```text
http://localhost:5000
```

Both should be running to use the complete EventCrew application.

## 🗂️ Project Structure

```text
EventCrew-server/
│
├── db/
│   └── db.js
│       # PostgreSQL database connection
│
├── middleware/
│   ├── organizationAuth.js
│   │   # Protects organization-only routes
│   │
│   └── volunteerAuth.js
│       # Protects volunteer-only routes
│
├── routes/
│   ├── applications.js
│   │   # Volunteer applications and application status
│   │
│   ├── auth.js
│   │   # Signup and login
│   │
│   ├── categories.js
│   │   # Opportunity categories
│   │
│   ├── opportunities.js
│   │   # Opportunity CRUD and filtering
│   │
│   ├── opportunityDetails.js
│   │   # Opportunity skills and images
│   │
│   ├── organizations.js
│   │   # Organization profiles
│   │
│   ├── skills.js
│   │   # Available skills
│   │
│   ├── volunteerDetails.js
│   │   # Volunteer skills
│   │
│   └── volunteers.js
│       # Volunteer profiles
│
├── .env
│   # Local environment variables - not pushed to GitHub
│
├── .env.sample
│   # Example environment configuration
│
├── .gitignore
│   # Files ignored by Git
│
├── package.json
│   # Dependencies and npm scripts
│
├── package-lock.json
│   # Exact installed package versions
│
├── README.md
│   # Backend documentation
│
└── server.js
    # Main Express server
```

---

## 📡 API Endpoints

The EventCrew API runs on:

```text
http://localhost:5000
```

---

## 🔐 Auth routes

**Base URL:**

```text
/api/auth
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register a volunteer or organization |
| POST | `/login` | Log in to an existing account |

### POST `/api/auth/signup`

Creates a new EventCrew account.

The role can be:

```text
volunteer
organization
```

The request also contains the profile information required for the selected account type.

Example:

```json
{
  "email": "volunteer@example.com",
  "password": "123456",
  "role": "volunteer"
}
```

### POST `/api/auth/login`

Logs in an existing user.

Example:

```json
{
  "email": "volunteer@example.com",
  "password": "123456"
}
```

---

## 📂 Category routes

**Base URL:**

```text
/api/categories
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all opportunity categories |

### GET `/api/categories`

Returns all available opportunity categories.

Example categories include:

```text
Environment
Education
Health & Care
Food & Hunger
Animals
Community
Arts & Culture
Sports & Youth
```

---

## 🛠️ Skill routes

**Base URL:**

```text
/api/skills
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all available skills |

### GET `/api/skills`

Returns the skills that can be selected by volunteers and organizations.

---

## 🙋 Volunteer routes

**Base URL:**

```text
/api/volunteers
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/:id` | Get volunteer profile |
| PUT | `/:id` | Update volunteer profile |
| DELETE | `/:id` | Delete volunteer account |
| GET | `/:id/skills` | Get volunteer skills |
| PUT | `/:id/skills` | Update volunteer skills |

Volunteer-protected requests include:

```text
x-role: volunteer
```

### GET `/api/volunteers/:id`

Example:

```text
GET /api/volunteers/3
```

Returns the profile information for the selected volunteer.

### PUT `/api/volunteers/:id`

Updates volunteer profile information.

Example:

```json
{
  "first_name": "Hussam",
  "last_name": "Amara",
  "phone": "0790000000",
  "city": "Amman",
  "area": "Amman",
  "about_me": "Interested in volunteering."
}
```

### DELETE `/api/volunteers/:id`

Deletes the volunteer account and related profile.

No request body is required.

### GET `/api/volunteers/:id/skills`

Example:

```text
GET /api/volunteers/3/skills
```

Returns the skills selected by the volunteer.

### PUT `/api/volunteers/:id/skills`

Updates the volunteer's selected skills.

Example:

```json
{
  "skill_ids": [1, 2, 4]
}
```

---

## 🏢 Organization routes

**Base URL:**

```text
/api/organizations
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get organizations |
| GET | `/:id` | Get organization profile |
| PUT | `/:id` | Update organization profile |
| DELETE | `/:id` | Delete organization account |

Organization-protected requests include:

```text
x-role: organization
organization: ORGANIZATION_ID
```

Example:

```text
x-role: organization
organization: 4
```

### GET `/api/organizations/:id`

Example:

```text
GET /api/organizations/4
```

Returns the organization's profile information.

### PUT `/api/organizations/:id`

Updates an organization profile.

Example information includes:

```json
{
  "organization_name": "Community Helpers",
  "tagline": "Helping our community",
  "organization_size": "11-50",
  "about_organization": "Community volunteer organization",
  "contact_person": "John Doe",
  "contact_email": "contact@example.com",
  "phone": "0790000000",
  "office_city": "Amman"
}
```

### DELETE `/api/organizations/:id`

Deletes an organization account and its profile.

---

## 📅 Opportunity routes

**Base URL:**

```text
/api/opportunities
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get opportunities |
| GET | `/:id` | Get opportunity by ID |
| POST | `/` | Create an opportunity |
| PUT | `/:id` | Update an opportunity |
| DELETE | `/:id` | Delete an opportunity |

### GET `/api/opportunities`

Returns available opportunities.

The endpoint supports filters through query parameters.

Available filters include:

```text
search
category_id
city
status
compensation
date
sort
organization_id
```

Example:

```text
GET /api/opportunities?status=open&sort=newest
```

Example with filters:

```text
GET /api/opportunities?category_id=2&city=Amman&compensation=unpaid
```

Example for one organization:

```text
GET /api/opportunities?organization_id=4
```

### GET `/api/opportunities/:id`

Example:

```text
GET /api/opportunities/10
```

Returns one opportunity and its related information.

### POST `/api/opportunities`

Creates a new opportunity.

🔐 Organization authentication is required.

Example headers:

```text
x-role: organization
organization: 4
```

Example request:

```json
{
  "organization_id": 4,
  "category_id": 1,
  "title": "Community Cleanup",
  "description": "Help clean a local community area.",
  "opportunity_type": "one-time",
  "compensation_type": "unpaid",
  "compensation_amount": null,
  "payment_schedule": null,
  "event_date": "2026-10-20",
  "start_time": "09:00",
  "end_time": "13:00",
  "application_deadline": "2026-10-18",
  "venue_name": "Community Park",
  "street_address": "Main Street",
  "building_number": "10",
  "city": "Amman",
  "transport_notes": null,
  "volunteers_needed": 20,
  "minimum_age": 18,
  "additional_requirements": null,
  "listing_status": "open"
}
```

Supported opportunity types:

```text
one-time
recurring
ongoing
```

Supported compensation types:

```text
paid
unpaid
```

Supported listing statuses:

```text
draft
open
completed
cancelled
```

### PUT `/api/opportunities/:id`

Updates an existing opportunity.

🔐 Organization authentication is required.

Example:

```text
PUT /api/opportunities/10
```

### DELETE `/api/opportunities/:id`

Deletes an opportunity.

🔐 Organization authentication is required.

Example:

```text
DELETE /api/opportunities/10
```

---

## 🧩 Opportunity skill routes

**Base URL:**

```text
/api/opportunities
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/:id/skills` | Get skills for an opportunity |
| PUT | `/:id/skills` | Update skills for an opportunity |

### GET `/api/opportunities/:id/skills`

Example:

```text
GET /api/opportunities/10/skills
```

Returns the skills required by the opportunity.

### PUT `/api/opportunities/:id/skills`

🔐 Organization authentication is required.

Example:

```json
{
  "skills": [
    {
      "skill_id": 1,
      "is_required": true
    },
    {
      "skill_id": 3,
      "is_required": true
    }
  ]
}
```

---

## 🖼️ Opportunity image routes

**Base URL:**

```text
/api/opportunities
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/:id/images` | Get opportunity images |
| POST | `/:id/images` | Add an opportunity image |
| DELETE | `/:id/images` | Delete an opportunity image |

### GET `/api/opportunities/:id/images`

Example:

```text
GET /api/opportunities/10/images
```

Returns the images for the opportunity.

### POST `/api/opportunities/:id/images`

🔐 Organization authentication is required.

Example:

```json
{
  "image_url": "https://example.com/opportunity.jpg",
  "is_primary": true,
  "display_order": 1
}
```

### DELETE `/api/opportunities/:id/images`

🔐 Organization authentication is required.

Example request body:

```json
{
  "image_url": "https://example.com/opportunity.jpg"
}
```

---

## 📝 Application routes

**Base URL:**

```text
/api/applications
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Apply for an opportunity |
| GET | `/volunteer/:volunteerId` | Get volunteer applications |
| GET | `/opportunity/:opportunityId` | Get applications for an opportunity |
| PUT | `/:volunteerId/:opportunityId/status` | Update application status |
| PUT | `/:volunteerId/:opportunityId/withdraw` | Withdraw an application |

### POST `/api/applications`

Allows a volunteer to apply for an opportunity.

🔐 Volunteer authentication is required.

Example headers:

```text
x-role: volunteer
```

Example:

```json
{
  "volunteer_id": 3,
  "opportunity_id": 10,
  "application_message": "I would like to help with this opportunity."
}
```

### GET `/api/applications/volunteer/:volunteerId`

Example:

```text
GET /api/applications/volunteer/3
```

Returns applications submitted by the volunteer.

This endpoint is used by the volunteer home page, dashboard, and history.

### GET `/api/applications/opportunity/:opportunityId`

Example:

```text
GET /api/applications/opportunity/10
```

Returns the volunteers who applied for an organization's opportunity.

🔐 Organization authentication is required.

### PUT `/api/applications/:volunteerId/:opportunityId/status`

Allows an organization to approve or reject an application.

Example:

```text
PUT /api/applications/3/10/status
```

Example request:

```json
{
  "status": "approved"
}
```

The organization can also use:

```json
{
  "status": "rejected"
}
```

### PUT `/api/applications/:volunteerId/:opportunityId/withdraw`

Allows a volunteer to withdraw an application.

Example:

```text
PUT /api/applications/3/10/withdraw
```

🔐 Volunteer authentication is required.

---

## 🔒 Role-based route protection

EventCrew uses simple middleware to protect role-specific routes.

### Volunteer requests

Volunteer-only endpoints use:

```text
x-role: volunteer
```

### Organization requests

Organization-only endpoints use:

```text
x-role: organization
organization: ORGANIZATION_ID
```

Example:

```text
x-role: organization
organization: 4
```

The middleware files responsible for these checks are:

```text
middleware/volunteerAuth.js
middleware/organizationAuth.js
```