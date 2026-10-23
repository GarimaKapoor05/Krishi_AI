# Production data and listing persistence

Marketplace offers are created by authenticated farmers through `POST /api/listings`. The listing row is stored in the configured SQL database and its farmer-uploaded crop photo is stored under `UPLOAD_DIR`. The buyer feed reads active rows from that same API; the frontend does not publish a generated catalogue.

## Local AGMARKNET setup

1. Copy `Backend/.env.example` to `Backend/.env` (the real `.env` is git-ignored).
2. Set `DATA_GOV_API_KEY` to the API key created for the AGMARKNET resource on data.gov.in. Keep the value in the backend environment only; never put it in a `VITE_*` variable or commit it.
3. Set `MARKET_DATA_MODE=live` so the market service will not fill missing current quotes with bundled sample history.
4. Restart the Flask backend and check `GET /api/market-intel/health`; `sources.agmarknet.configured` should be `true`. Query `GET /api/market-intel/markets?commodity=Wheat&state=All%20India` for the latest available nationwide quote rows.

The AGMARKNET resource is updated daily. The endpoint returns the latest available daily quotes (including minimum, maximum, and modal price), not intraday streaming prices.

For the Windows local setup, see [Backend/README.md](README.md). It includes PowerShell copy commands and both API URLs to check.

## Admin-published farmer offers

The admin listing screen uses `POST /api/admin/listings` and `GET /api/admin/listings`. To authorize an existing account, promote it directly in the configured database after verifying the account owner:

```sql
UPDATE "user" SET role = 'admin' WHERE lower(email) = lower('admin@example.org');
```

Sign out and back in after promotion. Registration and the public role-switch endpoint cannot grant administrator access. The admin form requires the farmer's actual crop photo, confirmed quantity and asking price, location, phone number, and consent to publish those details. Admin-created records remain normal marketplace records; AGMARKNET prices are market references and are not converted into seller offers.

For a production deployment, configure:

- `APP_ENV=production`
- unique `SECRET_KEY` and `JWT_SECRET_KEY` values in the host's secret manager
- `DATABASE_URL` pointing to a managed PostgreSQL database
- `UPLOAD_DIR` pointing to a persistent writable disk mounted to the backend service
- `MARKET_SNAPSHOT_PATH` on that persistent disk if market history should survive restarts
- `DATA_GOV_API_KEY` in the backend's secret manager for live nationwide AGMARKNET quotes
- `MARKET_DATA_MODE=live` to disable fallback to bundled sample data
- Promote an approved admin account in the production database using the SQL above

The frontend deployment must set `VITE_API_URL` to the public backend origin. The backend CORS allowlist must include the deployed frontend origin.

Set `CORS_ALLOWED_ORIGINS` to a comma-separated list of deployed frontend origins (for example `https://your-app.example`) so contact form and marketplace requests are accepted by the backend.

Deploying the frontend alone does not deploy the backend or provision its database and persistent photo storage. Confirm that both services share the production database and that uploaded image URLs remain available after a backend restart before opening the marketplace to farmers.
