# backend/database.py

import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv
import pathlib

# --- Explicitly load .env from the same directory as this file ---
current_dir = pathlib.Path(__file__).parent
env_path = current_dir / '.env'
load_dotenv(dotenv_path=env_path)
print(f"Attempting to load .env from: {env_path}")


# Database configuration from environment variables
db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "port": os.getenv("DB_PORT", 3306) # Default port if not specified
}

# Optional: Print loaded config for debugging (can be removed later)
print("--- Database Config Loaded ---")
print(f"Host: {db_config.get('host')}")
print(f"User: {db_config.get('user')}")
print(f"Password: {'*' * len(db_config.get('password')) if db_config.get('password') else None}")
print(f"Database: {db_config.get('database')}")
print(f"Port: {db_config.get('port')}")
print("-----------------------------")

# Initialize connection pool as None
connection_pool = None
try:
    # Create a connection pool
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="crm_pool",
        pool_size=5, # Adjust pool size as needed
        **db_config
    )
    print("✅ Successfully created database connection pool.")

except mysql.connector.Error as err:
    print(f"❌ Error creating connection pool: {err}")
    # connection_pool remains None

# Function to get a connection from the pool
def get_db_connection():
    if connection_pool:
        try:
            # Get a connection; this might wait if pool is exhausted
            conn = connection_pool.get_connection()
            if conn.is_connected():
                return conn
            else:
                # Should not happen with pooled connections unless pool timed out/invalidated
                print("Warning: Got a non-connected connection from pool.")
                return None
        except mysql.connector.Error as err:
            # Handle errors like PoolError (pool exhausted)
            print(f"Error getting connection from pool: {err}")
            return None
    else:
        print("Connection pool is not available.")
        return None

# Optional: Example usage block (keep commented out for main app)
# if __name__ == "__main__":
#     # ... (test code) ...
