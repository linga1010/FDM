import pandas as pd
import numpy as np
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import joblib
import json

print("Creating a simple personality model compatible with your current environment...")

# Create sample training data (you can replace this with your actual training data)
# For now, I'll create synthetic data based on your features
with open("features.json") as f:
    feature_names = json.load(f)["features"]

print(f"Features: {feature_names}")

# Generate sample training data
np.random.seed(42)
n_samples = 1000

data = {}
for feature in feature_names:
    data[feature] = np.random.uniform(0, 10, n_samples)

# Create personality labels based on feature combinations
personality_labels = []
for i in range(n_samples):
    # Simple logic to assign personality types based on features
    social_score = (data['party_liking'][i] + data['public_speaking_comfort'][i] + 
                   data['social_energy'][i] + data['talkativeness'][i] + 
                   data['group_comfort'][i]) / 5
    
    alone_score = (data['alone_time_preference'][i] + data['reading_habit'][i]) / 2
    
    if social_score > 6.5:
        personality_labels.append('Extrovert')
    elif alone_score > 6.5:
        personality_labels.append('Introvert')
    else:
        personality_labels.append('Ambivert')

# Create DataFrame
df = pd.DataFrame(data)
df['personality'] = personality_labels

print(f"Created dataset with {len(df)} samples")
print(f"Personality distribution: {df['personality'].value_counts().to_dict()}")

# Prepare data for training
X = df[feature_names].values
y = df['personality'].values

# Create and fit label encoder first
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Split data (now with encoded labels)
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# Train model with encoded labels
print("Training Gaussian Naive Bayes model...")
model = GaussianNB()
model.fit(X_train, y_train)

# Test accuracy
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy:.2f}")

# Save models
print("Saving models...")
joblib.dump(model, "joblib/final_gnb_personality_model.joblib")
joblib.dump(le, "joblib/personality_label_encoder.joblib")

print("✅ Model training complete!")
print("✅ Models saved successfully!")
print("Now you can run 'python app.py' without any NumPy errors!")
