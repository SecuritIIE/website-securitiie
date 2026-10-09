import sqlite3
from flask import Flask, request, render_template

app = Flask(__name__)

@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    success = None
    debug_query = None

    if request.method == "POST":
        username = request.form.get('username', '')
        password = request.form.get('password', '')        
       
        conn = sqlite3.connect('ctf.db')
        cursor = conn.cursor()
        
        query = f"SELECT * FROM users WHERE users.username = '{username}' AND users.password = '{password}'"
        
        try:
            cursor.execute(query)
            user = cursor.fetchone()
            
            if user:
                success = f"Bienvenue {user[1]} ! Voici le flag : {user[4]}"
            else:
                error = "Identifiants incorrects. Accès refusé."
        except Exception as e:
            error = f"Erreur SQL : {e}"
        finally:
            conn.close()
    return render_template("login.html", error=error, success=success, debug_query=debug_query)
if __name__ == "__main__":
    app.run(port=5000, debug=True)