from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np
import tensorflow as tf
import io

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Load the TensorFlow Lite model
interpreter = tf.lite.Interpreter(model_path="age_prediction_model.tflite")
interpreter.allocate_tensors()

# Get input and output details for the TFLite model
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

def preprocess_image(img):
    # Preprocess the image to match the model's input shape and scale
    img = img.convert('RGB')
    img = img.resize((128, 128))
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_age(img_array):
    # Set the input tensor
    interpreter.set_tensor(input_details[0]['index'], img_array)

    # Run the inference
    interpreter.invoke()

    # Get the output tensor (predicted normalized age)
    predicted_age_normalized = interpreter.get_tensor(output_details[0]['index'])[0][0]
    return predicted_age_normalized

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Read image from the file
        img = Image.open(io.BytesIO(file.read()))
        img_array = preprocess_image(img)

        # Predict the age
        predicted_age_normalized = predict_age(img_array)

        # Denormalize the predicted age
        age_min = 0  # Replace with actual min age
        age_max = 100  # Replace with actual max age
        predicted_age = predicted_age_normalized * (age_max - age_min) + age_min

        return jsonify({'predicted_age': float(predicted_age)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
