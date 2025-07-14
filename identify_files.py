import os

def find_files_to_modify():
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    files_to_modify = []
    for filename in html_files:
        with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                if '<summary class="h4">' in line and 'complaint' not in line.lower():
                    files_to_modify.append(filename)
                    break
    return files_to_modify

if __name__ == "__main__":
    files = find_files_to_modify()
    for f in files:
        print(f)
