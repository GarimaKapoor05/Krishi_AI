"""
Generates a crop recommendation dataset modeled on agronomic requirement
ranges (N, P, K, temperature, humidity, ph, rainfall) for 22 common crops.
100 samples per class = 2200 rows total, matching the structure of the
standard public 'Crop_recommendation' dataset format used in most
crop-recommendation hackathon projects.
"""
import os
import numpy as np
import pandas as pd

np.random.seed(42)

# crop: (N_range, P_range, K_range, temp_range(C), humidity_range(%), ph_range, rainfall_range(mm))
crop_profiles = {
    "rice":        ((60, 100), (35, 65),  (35, 45),  (20, 27), (75, 90), (5.5, 7.0), (180, 300)),
    "maize":       ((60, 100), (30, 65),  (15, 25),  (18, 27), (55, 75), (5.5, 7.5), (60, 110)),
    "chickpea":    ((30, 60),  (55, 80),  (75, 95),  (15, 25), (15, 30), (6.0, 8.0), (60, 100)),
    "kidneybeans": ((15, 40),  (55, 80),  (15, 25),  (15, 25), (18, 28), (5.5, 6.5), (60, 150)),
    "pigeonpeas":  ((15, 40),  (55, 80),  (15, 25),  (18, 37), (30, 70), (4.5, 7.5), (90, 200)),
    "mothbeans":   ((10, 40),  (35, 65),  (15, 25),  (24, 32), (30, 60), (3.5, 9.9), (40, 65)),
    "mungbean":    ((10, 40),  (35, 65),  (15, 25),  (27, 32), (75, 90), (6.0, 7.5), (40, 65)),
    "blackgram":   ((20, 60),  (55, 80),  (15, 25),  (25, 35), (60, 70), (6.5, 7.5), (60, 90)),
    "lentil":      ((10, 30),  (55, 80),  (15, 25),  (18, 30), (60, 70), (5.5, 7.0), (40, 80)),
    "pomegranate": ((10, 40),  (10, 40),  (30, 50),  (18, 25), (85, 95), (6.0, 7.0), (100, 140)),
    "banana":      ((80, 120), (70, 100), (45, 55),  (25, 30), (75, 85), (5.5, 6.5), (90, 220)),
    "mango":       ((10, 40),  (15, 40),  (25, 35),  (27, 37), (45, 60), (4.5, 7.0), (60, 100)),
    "grapes":      ((10, 40),  (110, 145),(190, 210),(15, 40), (80, 90), (5.5, 6.5), (60, 80)),
    "watermelon":  ((80, 110), (10, 40),  (45, 55),  (24, 32), (50, 75), (6.0, 7.0), (40, 60)),
    "muskmelon":   ((80, 110), (10, 40),  (45, 55),  (27, 32), (85, 95), (6.0, 7.0), (20, 35)),
    "apple":       ((15, 40),  (120, 145),(190, 210),(20, 25), (90, 95), (5.5, 6.5), (100, 130)),
    "orange":      ((10, 40),  (5, 30),   (5, 30),   (10, 35), (90, 95), (6.0, 8.0), (100, 120)),
    "papaya":      ((35, 70),  (45, 70),  (45, 55),  (23, 44), (90, 95), (6.0, 7.0), (40, 260)),
    "coconut":     ((10, 40),  (5, 30),   (25, 35),  (25, 30), (90, 100),(5.5, 7.0), (130, 230)),
    "cotton":      ((100, 140),(35, 65),  (15, 25),  (22, 27), (75, 85), (5.5, 7.0), (60, 110)),
    "jute":        ((60, 100), (35, 65),  (35, 45),  (23, 28), (70, 90), (6.0, 7.5), (150, 200)),
    "coffee":      ((80, 120), (15, 40),  (25, 35),  (23, 28), (50, 70), (6.0, 7.5), (150, 200)),
}

rows = []
for crop, (N, P, K, T, H, PH, R) in crop_profiles.items():
    for _ in range(100):
        n = np.random.uniform(*N)
        p = np.random.uniform(*P)
        k = np.random.uniform(*K)
        t = np.random.uniform(*T)
        h = np.random.uniform(*H)
        ph = np.random.uniform(*PH)
        r = np.random.uniform(*R)
        rows.append([round(n, 2), round(p, 2), round(k, 2), round(t, 2),
                     round(h, 2), round(ph, 2), round(r, 2), crop])

df = pd.DataFrame(rows, columns=["N", "P", "K", "temperature", "humidity", "ph", "rainfall", "label"])
df = df.sample(frac=1, random_state=42).reset_index(drop=True)  # shuffle
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Crop_recommendation_synthetic.csv")
df.to_csv(output_path, index=False)
print(df.shape)
print(df["label"].value_counts())
