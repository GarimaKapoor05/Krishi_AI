# Krishi AI Frontend

## Run locally

From this folder:

```bash
npm install
npm run dev
```

Vite serves the app at <http://localhost:5173> by default. The existing landing page remains at `/`; farmer onboarding is available at `/onboarding`.

## Phase 1 onboarding

The onboarding flow collects account, farm, and crop details, supports active-crop and planning branches, preserves non-sensitive drafts in browser storage, and lets farmers review or edit their answers before completion.

Registration uses the existing Flask `POST /auth/register` endpoint. When the backend cannot be reached in development, the form labels the session as a preview and does not claim an account was created. Passwords are excluded from browser drafts and completed farm-profile storage.

The full farm profile is saved in the current browser because the backend does not yet have an endpoint for it. Crop recommendations and the farmer dashboard remain out of scope for this onboarding phase.
