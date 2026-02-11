# Cloudflare Registration Form

A simple registration form built with Cloudflare Pages, Workers, and KV storage.

## Features

- ✅ Name and email registration
- ✅ Email validation
- ✅ Duplicate email detection
- ✅ Data persistence with Cloudflare KV
- ✅ Serverless architecture
- ✅ Modern, responsive UI

## Project Structure

```
.
├── index.html                      # Main registration page
├── functions/
│   └── api/
│       └── [[path]].js            # Cloudflare Worker Functions
├── package.json
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- Node.js installed (v16 or later)
- A Cloudflare account
- Git installed

### 2. Clone or Create Repository

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create a repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 3. Install Wrangler CLI

```bash
npm install -g wrangler
# or
npm install
```

### 4. Login to Cloudflare

```bash
wrangler login
```

### 5. Create KV Namespace

```bash
# Create production KV namespace
wrangler kv:namespace create REGISTRATIONS

# Create preview KV namespace (for development)
wrangler kv:namespace create REGISTRATIONS --preview
```

This will output namespace IDs. Save them for the next step.

### 6. Deploy to Cloudflare Pages

#### Option A: Using Wrangler CLI

```bash
# Deploy the project
wrangler pages deploy . --project-name=registration-form

# After deployment, bind KV namespace
wrangler pages deployment tail
```

#### Option B: Using Cloudflare Dashboard (Recommended)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Connect your GitHub repository
4. Configure build settings:
   - **Framework preset**: None
   - **Build command**: (leave empty)
   - **Build output directory**: `/`
5. Click **Save and Deploy**

### 7. Bind KV Namespace

After deployment:

1. Go to your Pages project in Cloudflare Dashboard
2. Navigate to **Settings** → **Functions**
3. Scroll to **KV namespace bindings**
4. Add binding:
   - **Variable name**: `REGISTRATIONS`
   - **KV namespace**: Select the namespace you created
5. Save changes

### 8. Redeploy

After binding KV, trigger a new deployment:
- Push a new commit to your repository, or
- Use the "Retry deployment" button in the dashboard

## Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

The local dev server will be available at `http://localhost:8788`

For local development with KV:

1. Create a `.dev.vars` file (not committed to git):
```
# Not needed if using wrangler.toml bindings
```

2. Configure `wrangler.toml` (optional):
```toml
name = "registration-form"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "REGISTRATIONS"
id = "YOUR_PREVIEW_KV_ID"
```

## API Endpoints

### POST /api/register

Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful!",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "registeredAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Email already registered"
}
```

### GET /api/registrations

Retrieve all registrations.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "registrations": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "registeredAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Testing

### Test Registration Form

1. Visit your deployed URL: `https://YOUR_PROJECT.pages.dev`
2. Fill in name and email
3. Click "Register"
4. Check for success message

### Test API Directly

```bash
# Register a user
curl -X POST https://YOUR_PROJECT.pages.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Get all registrations
curl https://YOUR_PROJECT.pages.dev/api/registrations
```

## Troubleshooting

### KV Not Working

- Ensure KV namespace is properly bound in Pages settings
- Check that the binding name is exactly `REGISTRATIONS`
- Verify namespace ID is correct

### 500 Errors

- Check Cloudflare Pages logs in the dashboard
- Ensure Worker Functions are in the correct directory: `functions/api/`

### CORS Errors

- The Worker includes CORS headers, but if you face issues, check browser console
- Ensure you're not mixing HTTP/HTTPS

## Security Considerations

- This is a basic example. For production:
  - Add rate limiting
  - Implement CAPTCHA
  - Add email verification
  - Use environment variables for sensitive data
  - Implement authentication for viewing registrations

## License

MIT
