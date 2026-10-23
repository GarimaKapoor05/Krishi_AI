# KrishiAI backend setup

## Local setup (Windows PowerShell)

From the `Backend` folder:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace the example values. Add your data.gov.in key on the backend only:

```env
DATA_GOV_API_KEY=your_data_gov_in_key
MARKET_DATA_MODE=live
```

Do not commit or share `.env`. It is ignored by Git. Start Flask from this folder with `python app.py`; it listens on `http://127.0.0.1:5000` by default. The Vite frontend uses this local backend automatically in development.

Check key configuration at `http://127.0.0.1:5000/api/market-intel/health`. To verify that the key can retrieve nationwide records, open `http://127.0.0.1:5000/api/market-intel/markets?commodity=Wheat&state=All%20India` and confirm the response has market rows and `data_source.is_live: true`.

## Contact form email and marketplace enquiries

The Contact Us page is `/contact`. `POST /contact` saves each submission to the database and emails `amitmehta0716@gmail.com` when backend SMTP settings are configured. Until then, the form clearly reports that it was saved but not emailed; direct email and phone links remain available on the Contact Us page.

Set these values in `Backend/.env` for local use, or in the backend host's environment/secrets for deployment. Never put SMTP credentials in frontend variables or commit them:

```env
CONTACT_TO_EMAIL=amitmehta0716@gmail.com
CONTACT_FROM_EMAIL=your-sending-address@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-sending-address@gmail.com
SMTP_PASSWORD=your-16-character-google-app-password
SMTP_USE_TLS=true
```

For Gmail, enable 2-Step Verification and create an App Password for the sending account. Use the generated App Password as `SMTP_PASSWORD`; do not use the account's normal password. Other providers should use their SMTP host, port and TLS settings. Restart the backend after changing environment values. A successful HTTP response includes `email_sent: true` only after SMTP accepts the message.

Marketplace enquiries require a signed-in account and are saved through `POST /api/listings/<listing_id>/inquiries`; the listing owner sees them in the seller dashboard. For a deployed frontend on a different domain, set `CORS_ALLOWED_ORIGINS` in the backend environment and set `VITE_API_URL` in the frontend environment to the backend's public origin.

See [DEPLOYMENT.md](DEPLOYMENT.md) for production database, uploads, AGMARKNET, and admin listing setup.
