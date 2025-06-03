from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import random
load_dotenv()
BASE_URL = "https://api.themoviedb.org/3"
api_key = os.getenv('movies_api_key')

app = Flask(__name__)
CORS(app,supports_credentials=True)

@app.route('/get_random', methods=['GET'])
def get_random_movies_route():
    try:
        random_page = random.randint(1, 500)
        discover_params = {
            'api_key': api_key,
            'language': 'en-US',
            'sort_by': 'popularity.desc', 
            'include_adult': 'false',
            'include_video': 'false',
            'page': random_page,
            'vote_count.gte': 100 
        }

        # 3. Make the API request
        discover_url = f"{BASE_URL}/discover/movie"
        response = requests.get(discover_url, params=discover_params)
        response.raise_for_status()  
        
        data = response.json()
        results = data.get('results', [])

        if not results:
            print(f"Page {random_page} had no results. Trying another random page.")
            random_page_2 = random.randint(1, 500)
            while random_page_2 == random_page:
                 random_page_2 = random.randint(1, 500)
            discover_params['page'] = random_page_2
            response = requests.get(discover_url, params=discover_params)
            response.raise_for_status()
            data = response.json()
            results = data.get('results', [])

            if not results:
                 return jsonify({"error": "Could not fetch enough movies after retries."}), 500


        num_movies_to_select = min(10, len(results))
        if len(results) > 0:
            selected_movies = random.sample(results, num_movies_to_select)
        else:
            selected_movies = []
            
        if not selected_movies and num_movies_to_select > 0 :
             return jsonify({"error": "No movies found on the selected random pages."}), 404


        return jsonify(selected_movies), 200

    except requests.exceptions.RequestException as e:
        print(f"Request Exception: {e}")
        return jsonify({"error": "Failed to connect to TMDB API", "details": str(e)}), 503 # Service Unavailable
    except ValueError as e: 
        print(f"Value Error: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5002)