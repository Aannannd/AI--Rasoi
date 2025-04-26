from flask import Flask, request, jsonify, render_template
from flask import Flask, render_template

from flask_cors import CORS  # Corrected import
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# In app.py
app = Flask(__name__, static_folder='static')
CORS(app)

# Initialize OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")  # Now reading from .env
)


@app.route('/')
def home():
    return render_template('index.html')
@app.route('/generate_recipe', methods=['POST'])
def generate_recipe():
    data = request.json
    ingredients = data.get('ingredients', '')
    
    if not ingredients:
        return jsonify({"error": "No ingredients provided"}), 400
    
    try:
        response = client.chat.completions.create(
            model="anthropic/claude-3-haiku",
            messages=[
                {"role": "system", "content": "You are a helpful chef that creates recipes based on available ingredients. Provide clear, step-by-step instructions."},
                {"role": "user", "content": f"Create a detailed recipe using only these ingredients: {ingredients}. Include preparation time, cooking time, and step-by-step instructions."}
            ],
            extra_headers={
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "AI Rasoi"
            }
        )
        recipe = response.choices[0].message.content
        return jsonify({"recipe": recipe})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)