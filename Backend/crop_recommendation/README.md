# AgriNova AI — Crop Recommendation Module

Predicts the best crop(s) to grow based on soil & weather conditions
(N, P, K, temperature, humidity, pH, rainfall), and gives fertilizer
advice for the recommended crop.

## What is this, in simple terms?

It is a machine-learning shortlist, not a guarantee of the best crop. It
uses soil test values and climate inputs to rank crops represented in its
training data. Ask a local agricultural expert before making a planting
decision.

**How does it work?**
A model was trained on data from 22 different crops (rice, maize, cotton,
banana, etc.), where each crop has a typical "comfort zone" — its own
ideal range of soil nutrients, temperature, humidity, pH, and rainfall.
It learned the patterns from 2,200 examples, so when you give it new
numbers, it compares them against everything it learned and says "this
looks most like rice" or "this looks most like cotton." The reported test
score is a held-out split of this dataset; it does not measure accuracy on
every farm or prove yield outcomes.

**What does it need as input?** 7 numbers:
1. Nitrogen (N) — soil nutrient
2. Phosphorus (P) — soil nutrient
3. Potassium (K) — soil nutrient
4. Temperature (°C)
5. Humidity (%)
6. Soil pH
7. Rainfall (mm)

**What does it give back?**
- The top 3 best-matching crops, with a confidence % for each
- A fertilizer tip — whether your soil has too much/too little Nitrogen,
  Phosphorus, or Potassium for the recommended crop, and what fertilizer
  to add

**How do you run it?** Two ways — see [Quick start](#quick-start) below
for exact commands:
1. **Quick demo (no typing)** — auto-fills realistic numbers, shows the
   result instantly. Good for showing someone fast.
2. **Manual entry** — asks you for each of the 7 values one by one, then
   gives the recommendation.

**For whoever's building the website (Member 1):** you don't need to run
it from the terminal — just import it straight into the backend code.
See [Using it from your dashboard](#using-it-from-your-dashboard-for-member-1--web-team)
below.

---

## Files

| File                        | Purpose                                                            |
|-----------------------------|---------------------------------------------------------------------|
| `Crop_recommendation.csv`   | Kaggle Crop Recommendation dataset — 2200 rows, 22 crops            |
| `Crop_recommendation_synthetic.csv` | Locally generated example data; not used to train the shipped model |
| `generate_dataset.py`       | Regenerates only the synthetic example dataset                     |
| `train_model.py`            | Trains the Random Forest model, saves it + scaler + encoder       |
| `fertilizer_advisor.py`     | Rule-based N-P-K gap analysis -> fertilizer suggestions            |
| `predict_crop.py`           | Main script — run this for predictions                            |
| `crop_model.joblib`         | Trained model (already trained, ready to use)                     |
| `feature_scaler.joblib`     | StandardScaler fit on training data (needed to scale new inputs)  |
| `label_encoder.joblib`      | Maps crop names <-> model's internal integer labels               |
| `model_report.txt`          | Accuracy + classification report (paste into your pitch deck)     |

## Quick start

```bash
# From the repository root, use the backend environment:
Backend\venv\Scripts\python.exe Backend\crop_recommendation\train_model.py

# Or from this folder, after installing the listed Python packages:
python train_model.py

# Manual prediction (type in soil and climate values)
python predict_crop.py

# Demo prediction (samples a row from the training dataset)
python3 predict_crop.py --demo
```

The training script reads `Crop_recommendation.csv` beside itself and writes
the model, encoders, scaler, and evaluation report to this folder. It does not
read the synthetic example file.

## Using it from your dashboard (for Member 1 / web team)

```python
from predict_crop import predict_crop

result = predict_crop(
    N=90, P=42, K=43,
    temperature=25, humidity=82,
    ph=6.5, rainfall=210
)

print(result["recommended_crop"])     # e.g. "rice"
print(result["confidence"])           # e.g. 78.5
print(result["top_predictions"])      # top 3 crops with confidence %
print(result["fertilizer_advice"])    # dict with suggestions list
```

This returns a plain Python dict — `json.dumps(result)` to send it straight
to a frontend/API layer (Flask/FastAPI endpoint, for example).

## Model details (for your pitch / Q&A with judges)

- **Algorithm:** Random Forest Classifier (200 trees)
- **Test accuracy:** ~99.5%
- **Features used:** N, P, K (soil nutrients, kg/ha), temperature (°C),
  humidity (%), pH, rainfall (mm)
- **Most influential features:** humidity and rainfall, followed by
  potassium — matches real agronomic intuition (water availability and
  soil nutrients are the biggest crop-choice drivers)
- **Why Random Forest:** robust to noisy sensor readings, handles
  non-linear relationships between soil/climate variables well, and
  gives interpretable feature importances — easier to defend to judges
  than a black-box deep model for a 7-feature tabular problem

## Dataset source and limitations

`Crop_recommendation.csv` is the 2,200-row, 22-crop Kaggle dataset by
Atharva Ingle, mirrored in the repository history from a public CSV copy.
The feature columns are `N`, `P`, `K`, `temperature`, `humidity`, `ph`,
`rainfall`, and `label`. Do not run `generate_dataset.py` to replace this
source file; the generator now writes `Crop_recommendation_synthetic.csv`.

The dataset is a small, balanced recommendation dataset. It has no farm,
district, season, yield, or crop-outcome fields; the Kaggle metadata describes
the rainfall feature as rainfall during the season, but does not define a
consistent season length for each row. Its random train/test score is therefore
not measured farm-level accuracy and cannot validate local yield or success.
In onboarding, N-P-K and pH must come from a lab report and remain within the
dataset's observed ranges. The public source does not establish that its N-P-K
values are equivalent to every soil-health-card or laboratory method, so the
UI requires matching kg/ha values and warns farmers to verify units with an
expert; this mapping still needs agronomic confirmation. Temperature, humidity, and rainfall inputs are now
calculated from the selected season's previous ten years of local weather,
rather than the next seven-day forecast. The result is an experimental dataset
similarity shortlist and still needs local agricultural validation. Do not use
the model score as a probability of crop success or yield.

Weather normals are requested from the Open-Meteo Historical Weather API using
the ERA5 model, which provides the required precipitation, temperature, and
humidity inputs together. The crop data is the [Atharva Ingle Kaggle Crop
Recommendation dataset](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset).

## Extending this for the full pitch

- **Crop rotation suggestion** (also in your Module 3 scope): use
  `top_predictions` to suggest a *different* crop each season for the
  same field, to avoid repeating nutrient-depleting crops back to back.
- **Weather Intelligence (Module 4):** feed live weather API data into
  `temperature`, `humidity`, `rainfall` instead of manual/demo values.
- **Crop Calendar (Module 5):** once a crop is recommended, generate
  sowing/irrigation/harvest dates from known crop duration tables.
