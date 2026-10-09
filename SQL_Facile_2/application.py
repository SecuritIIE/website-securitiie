import sqlite3
from flask import Flask, request, render_template

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    success = None
    debug_query = None
    banlist = ["-"]
    
    honeypot = request.form.get('website_url', '')        
    if honeypot != "":
        return render_template("login.html", error="Access denied, bot detected.")
        
    if request.method == "POST":
        username = request.form.get('username', '')
        password = request.form.get('password', '')        
        
        delete = [i for i in banlist if (i in username) or (i in password)]
        if delete != []:
            error = "Input blocked before query execution."
        else:
            conn = sqlite3.connect('ctf.db')
            cursor = conn.cursor()
            
            query = f"SELECT * FROM users WHERE users.username = '{username}' AND users.password = '{password}'"
            
            try:
                cursor.execute(query)
                user = cursor.fetchone()
                
                if user:
                    success = f"Welcome {username}! Here is the flag: CTF_Flag"
                else:
                    error = "Invalid credentials. Access denied."
            except Exception as e:
                error = f"SQL Error: {e}"
            finally:
                conn.close()

    return render_template("login.html", error=error, success=success, debug_query=debug_query)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
    
    
