from flask import Flask, render_template, request
import json
import numpy as np
import joblib

app = Flask(
    __name__,
    template_folder="frontend",
    static_folder="frontend"
)

# -------------------------------------------
# Load feature names from features.json
# -------------------------------------------
with open("features.json") as f:
    feature_names = json.load(f)["features"]

# -------------------------------------------
# Load trained model & label encoder
# -------------------------------------------
model = joblib.load("joblib/final_gnb_personality_model.joblib")
le = joblib.load("joblib/personality_label_encoder.joblib")

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html', feature_names=feature_names)

@app.route('/predict', methods=['POST'])
def predict():
    # Collect features from form
    features = []
    for f in feature_names:
        value = float(request.form.get(f, 0))  # default 0 if missing
        features.append(value)

    # Convert to array for model
    features_array = np.array(features).reshape(1, -1)

    # Predict encoded label
    pred_encoded = model.predict(features_array)[0]

    # Convert to original personality string
    result = le.inverse_transform([pred_encoded])[0]

    return render_template('index.html', feature_names=feature_names, prediction=result)

if __name__ == '__main__':
    app.run(debug=True)
