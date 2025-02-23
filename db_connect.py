import psycopg2

conn = psycopg2.connect(
    dbname="academic_management",
    user="postgres",
    password="postgres",
    host="localhost",
    port="5432"
)

print("Database connected successfully!")
conn.close()
