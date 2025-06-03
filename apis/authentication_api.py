from flask import Flask,request
from supabase import Client, create_client
from dotenv import load_dotenv
import os
from flask_cors import CORS
load_dotenv()
app = Flask(__name__)
CORS(app)
supabase: Client = create_client(os.getenv('supabase_api_url'), os.getenv('supabase_api_key'))


@app.route('/')
def index():
    return "Connection established with supbase"

@app.route('/check_username_exists',methods=['POST'])
def check_existance():
    data = request.get_json()
    username = data.get('username')
    if not username:
        return {"error": "Username is required"}, 400
    #supabase.table("auth").delete().eq("Username" , "testuser").execute()
    list_usernames = supabase.table("auth").select("Username").execute()
   
    usernames = [user['Username'] for user in list_usernames.data]
    if username in usernames:
        print('Username exists')
        return {"exists": True}, 200
    else:
        print('Username doesnt exists')
        return {"exists": False}, 200

@app.route('/register', methods = ['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # if username is None or password is None:
    #     return {"error": "Username and password are required"}, 400

    if username == password:
        return {"error": "Username and password cannot be the same"}, 400
    
    res = supabase.table("auth").insert({"Username": username, "Password":password}).execute()
    if len(res.data) == 0:
        return {"error": "Failed to register user"}, 500
    return {"message": "User registered successfully"}, 201


@app.route('/login',methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    res = supabase.table("auth").select("*").eq("Username",username).eq("Password",password).execute()

    if len(res.data) == 0:
        return {"error": "Invalid username or password"}, 401
    
    return {'message' : 'Login successful', 'user': res.data[0]}, 200
            





if __name__ == '__main__':
    app.run(debug=True)



