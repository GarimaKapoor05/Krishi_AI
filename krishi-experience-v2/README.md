# Krishi AI V2 — Phase 1 Onboarding

This standalone frontend contains the farmer onboarding flow only. The existing `Frontend/` and `Backend/` applications are separate and are not changed by this project. The V2 dev server uses port `5174`.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:5174>. To create a production build, run:

```bash
npm run build
```

## Phase 1 flow

1. Create an account or open the returning-user login form.
2. Add location, land, soil, water, and season details.
3. Choose the active-crop or planning-to-start branch.
4. Review answers, edit earlier steps, and complete the profile.
5. View a success state with the dashboard labeled as a later-phase destination.

Answers are retained while navigating. In-progress drafts are stored in browser local storage without passwords. The optional soil image is only a user-provided image; it is not used to infer soil chemistry.

## Integration status

- The existing Flask backend has account registration and login routes; those are used by the account form. When the backend cannot be reached, the UI labels the account session as a development fixture.
- The Flask backend does not provide a full farm-profile endpoint. Completed farm profiles are stored in this browser only under `krishi_farm_profile_v2`; they are not sent to an invented API route.
- Crop recommendations, dashboard, weather, marketplace, and other agricultural features are outside this Phase 1 app flow. No live recommendation or weather data is claimed here.

## Stack

The V2 frontend uses the existing project’s React 18, Vite 8, Tailwind CSS 3, and Lucide React dependencies. No dependencies are required beyond those declared in this folder’s `package.json`.
