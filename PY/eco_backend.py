import mysql.connector
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Jdmm10__",  
    database="eco_david",
    port=3306
)

if conexion.is_connected():
    print("Conexión exitosa a la base de datos")
else:
    print("Error en la conexión")
