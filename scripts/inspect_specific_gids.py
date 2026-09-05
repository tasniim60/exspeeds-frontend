import urllib.request

gids = [1846649110, 1278970975, 1325188462]

for gid in gids:
    url = f"https://docs.google.com/spreadsheets/d/1wTLcx6HRR7Rc2uIq83g-DL0qI9uFVG1rgOyrmkIgzRU/export?format=csv&gid={gid}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = response.read().decode('utf-8')
            print(f"=== GID {gid} SUCCESS (Length: {len(data)}) ===")
            lines = data.split('\n')
            for i, line in enumerate(lines[:10]):
                print(f"L{i+1}: {line[:140]}")
    except Exception as e:
        print(f"=== GID {gid} ERROR: {e} ===")
