from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import random
import os

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

supabase: Client = create_client(os.getenv('supabase_api_url'), os.getenv('supabase_api_key'))

@app.route('/create_group', methods=['POST'])
def create_group():
    data = request.get_json()
    username = data.get('username')

    result = supabase.table('auth').select("id").eq("Username", username).execute()

    if not result.data:
        return jsonify({"error": "User not found"}), 404
    
    random_number = random.randint(10000, 99999)
    user_id = result.data[0]['id']
    res = supabase.table("groups").insert({"user_ids": [user_id],"Party Code": random_number}).execute()
    
    if len(res.data) == 0:
        return jsonify({"error": "Failed to create group"}), 500
    return jsonify({"message": "Group created successfully"}), 201

@app.route('/join_group', methods=['POST'])
def join_group():
    data = request.get_json()
    username = data.get('username')
    party_code = data.get('party_code')

    result = supabase.table('auth').select("id").eq("Username", username).execute()
    if not result.data:
        return jsonify({"error": "User not found"}), 404
    user_id = result.data[0]['id']

    group_result = supabase.table('groups').select("user_ids").eq("Party Code", party_code).execute()
    if not group_result.data:
        return jsonify({"error": "Group not found"}), 404

    user_ids = group_result.data[0]['user_ids']
    if user_id in user_ids:
        return jsonify({"message": "User already in group"}), 200

    user_ids.append(user_id)

    update_result = supabase.table('groups').update({"user_ids": user_ids}).eq("Party Code", party_code).execute()
    if update_result.error is not None:
        return jsonify({"error": "Failed to join group"}), 500
    return jsonify({"message": "Joined group successfully"}), 200

    
if __name__ == "__main__":
    app.run(debug=True, port=5001)
