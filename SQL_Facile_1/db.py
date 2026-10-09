import sqlite3

def init_database():
    conn = sqlite3.connect('ctf.db')
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS users")

    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstname TEXT NOT NULL,
            lastname TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    ''')


    users_data = [
        ('Alice', 'Dupont', 'alice.dupont', 'cfdhe#21841d', 'user'),
        ('Bob', 'Martin', 'bob.martin', 'fhdie541-4', 'user'),
        ('Baptiste', 'Admin', 'admin', 'jg54(gjàr', 'admin')
    ]

    cursor.executemany('''
        INSERT INTO users (firstname, lastname, username, password, role)
        VALUES (?, ?, ?, ?, ?)
    ''', users_data)

    # On sauvegarde les changements et on ferme la connexion
    conn.commit()
    conn.close()
    print("La base de données 'ctf.db' a été créée et initialisée avec succès !")

if __name__ == "__main__":
    init_database()

