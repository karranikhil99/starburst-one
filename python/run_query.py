import sys, json
from pystarburst import connect
host, user, password, catalog, schema, query = sys.argv[1:7]
conn = connect(host=host, port=443, http_scheme='https', user=user, password=password, catalog=catalog, schema=schema)
cur = conn.cursor()
cur.execute(query)
rows = cur.fetchall()
print(json.dumps(rows))