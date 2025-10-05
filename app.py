from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import json
import numpy as np
import joblib
import sqlite3
import os

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///personality_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# -------------------------------------------
# Database Models
# -------------------------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    personality_tests = db.relationship('PersonalityTest', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'test_count': len(self.personality_tests)
        }

class PersonalityTest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    features = db.Column(db.Text, nullable=False)  # JSON string of feature values
    prediction = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    probabilities = db.Column(db.Text, nullable=False)  # JSON string of all probabilities
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'features': json.loads(self.features),
            'prediction': self.prediction,
            'confidence': self.confidence,
            'probabilities': json.loads(self.probabilities),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# -------------------------------------------
# Load feature names and ML models
# -------------------------------------------
with open("features.json") as f:
    feature_names = json.load(f)["features"]

model = joblib.load("joblib/final_gnb_personality_model.joblib")
le = joblib.load("joblib/personality_label_encoder.joblib")

# -------------------------------------------
# Personality advice system
# -------------------------------------------
PERSONALITY_ADVICE = {
    "Introvert": {
        "description": "You tend to be more reserved and prefer smaller social circles. You recharge through solitude and often think before you speak.",
        "strengths": ["Deep thinking", "Good listening skills", "Strong focus", "Meaningful relationships"],
        "advice": [
            "Schedule regular alone time to recharge your energy",
            "Practice speaking up in small groups before larger ones",
            "Use your listening skills to build deeper connections",
            "Find quiet spaces for focused work and creativity"
        ],
        "career_suggestions": ["Writer", "Researcher", "Programmer", "Counselor", "Artist"]
    },
    "Extrovert": {
        "description": "You are energized by social interaction and tend to be outgoing and talkative. You often think out loud and enjoy being around people.",
        "strengths": ["Strong communication", "Natural leadership", "Networking ability", "High energy"],
        "advice": [
            "Channel your energy into leadership opportunities",
            "Use your networking skills to build professional relationships",
            "Practice active listening to balance your communication style",
            "Find roles that involve teamwork and collaboration"
        ],
        "career_suggestions": ["Sales", "Teaching", "Marketing", "Event Planning", "Management"]
    },
    "Ambivert": {
        "description": "You exhibit both introverted and extroverted tendencies, adapting your behavior based on the situation and your energy levels.",
        "strengths": ["Adaptability", "Balanced perspective", "Situational awareness", "Versatile communication"],
        "advice": [
            "Learn to recognize when you need social time vs. alone time",
            "Use your adaptability as a strength in various situations",
            "Practice balancing your energy between social and solitary activities",
            "Leverage your ability to understand both introverts and extroverts"
        ],
        "career_suggestions": ["Project Manager", "Consultant", "Human Resources", "Therapist", "Entrepreneur"]
    }
}

# -------------------------------------------
# Authentication Routes
# -------------------------------------------
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        # Validation
        if not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'All fields are required'}), 400
        
        if len(data['password']) < 6:
            return jsonify({'message': 'Password must be at least 6 characters long'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'].lower()
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Account created successfully',
            'token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email'].lower()).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/verify', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'message': 'Token valid',
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify(user.to_dict())
        
    except Exception as e:
        print(f"Profile error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        if data.get('name'):
            user.name = data['name']
        
        if data.get('email'):
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email'].lower()).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'message': 'Email already taken'}), 400
            user.email = data['email'].lower()
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

# -------------------------------------------
# Personality Test Routes
# -------------------------------------------
@app.route('/api/predict', methods=['POST'])
@jwt_required()
def predict():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        print(f"Received data: {data}")
        
        if not data:
            return jsonify({'message': 'No data received'}), 400
        
        # Collect features from request
        features = []
        feature_dict = {}
        
        for f in feature_names:
            if f not in data:
                print(f"Warning: Feature {f} not found in request data")
            value = float(data.get(f, 5.0))  # default to 5.0 (middle value)
            features.append(value)
            feature_dict[f] = value
        
        print(f"Features array: {features}")
        print(f"Feature dict: {feature_dict}")
        
        # Convert to array for model
        features_array = np.array(features).reshape(1, -1)
        
        # Get prediction and probabilities
        pred_encoded = model.predict(features_array)[0]
        probabilities = model.predict_proba(features_array)[0]
        
        # Convert to original personality string
        prediction = le.inverse_transform([pred_encoded])[0]
        confidence = float(max(probabilities))
        
        # Get all class probabilities
        all_classes = le.classes_
        prob_dict = {}
        for i, prob in enumerate(probabilities):
            prob_dict[all_classes[i]] = float(prob)
        
        # Save test result to database
        test_result = PersonalityTest(
            user_id=current_user_id,
            features=json.dumps(feature_dict),
            prediction=prediction,
            confidence=confidence,
            probabilities=json.dumps(prob_dict)
        )
        
        db.session.add(test_result)
        db.session.commit()
        
        # Get personality advice
        advice = PERSONALITY_ADVICE.get(prediction, {})
        
        return jsonify({
            'test_id': test_result.id,
            'prediction': prediction,
            'confidence': confidence,
            'probabilities': prob_dict,
            'advice': advice,
            'created_at': test_result.created_at.isoformat()
        })
        
    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    try:
        print("History endpoint called")
        current_user_id = int(get_jwt_identity())
        print(f"User ID: {current_user_id}")
        
        tests = PersonalityTest.query.filter_by(user_id=current_user_id)\
                                   .order_by(PersonalityTest.created_at.desc())\
                                   .all()
        
        print(f"Found {len(tests)} tests for user")
        
        history = []
        for test in tests:
            test_dict = test.to_dict()
            test_dict['advice'] = PERSONALITY_ADVICE.get(test.prediction, {})
            history.append(test_dict)
        
        return jsonify({
            'history': history,
            'total_tests': len(history)
        })
        
    except Exception as e:
        print(f"History error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500

@app.route('/api/test/<int:test_id>', methods=['GET'])
@jwt_required()
def get_test_result(test_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        test = PersonalityTest.query.filter_by(id=test_id, user_id=current_user_id).first()
        
        if not test:
            return jsonify({'message': 'Test not found'}), 404
        
        result = test.to_dict()
        result['advice'] = PERSONALITY_ADVICE.get(test.prediction, {})
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'FDM Personality Test API',
        'status': 'running',
        'version': '1.0'
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/features', methods=['GET'])
def get_features():
    return jsonify({'features': feature_names})

@app.route('/api/test-auth', methods=['GET'])
@jwt_required()
def test_auth():
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        return jsonify({
            'user_id': current_user_id,
            'user_name': user.name if user else 'Unknown'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------------------------------
# Initialize database
# -------------------------------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
