import os
from pathlib import Path

# --- KONFIGURASI ---
# Sesuaikan target directory dengan path lokal Anda
TARGET_DIRECTORY = r"C:\Users\PC\Documents\Dev\SANTIKA\santika-fe"
OUTPUT_FILE = r"C:\Users\PC\Documents\Dev\SANTIKA\santika-fe\santika-fe-hybrid.txt"

# 1. Folder yang HARAM hukumnya (Blacklist)
FORBIDDEN_DIRS = {
    "node_modules", ".git", "dist", "build", "__pycache__", ".vscode", ".idea", 
    "coverage", "assets", "public"
}

# 2. Folder yang BOLEH diambil (Whitelist)
# Project React Vite menempatkan source codenya di 'src'
ALLOWED_DIRS = {"src"}

# 3. File ROOT yang krusial untuk arsitektur (Penambahan Logika)
# Ini memastikan file konfigurasi di luar 'src' tetap ter-capture
ALLOWED_ROOT_FILES = {
    "package.json", "vite.config.ts", "tailwind.config.js", 
    "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json", 
    "eslint.config.js", "postcss.config.js", "index.html"
}

# 4. Ekstensi yang diinginkan saja (Disesuaikan untuk Vite/React/TS)
INCLUDE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".html"}

def is_binary(file_path: Path) -> bool:
    try:
        with open(file_path, 'rb') as f:
            return b'\x00' in f.read(512)
    except Exception:
        return True

def main():
    target_path = Path(TARGET_DIRECTORY)
    if not target_path.is_dir():
        print(f"Error: Folder '{TARGET_DIRECTORY}' tidak ditemukan.")
        return

    files_to_process = []
    
    print("Memproses file (Hybrid Mode)...")
    for file_path in target_path.rglob("*"):
        # Filter 1: Abaikan jika ada di folder terlarang
        if any(part in FORBIDDEN_DIRS for part in file_path.parts):
            continue
            
        # Filter 2: Cek validitas lokasi file
        is_in_allowed_dir = any(part in ALLOWED_DIRS for part in file_path.parts)
        is_important_root_file = (file_path.parent == target_path) and (file_path.name in ALLOWED_ROOT_FILES)

        # Jika bukan bagian dari folder yang diizinkan ATAU bukan file root penting, lewati.
        if not (is_in_allowed_dir or is_important_root_file):
            continue

        # Filter 3: Ekstensi dan bukan binary
        if file_path.is_file() and file_path.suffix in INCLUDE_EXTENSIONS:
            if not is_binary(file_path):
                files_to_process.append(file_path)

    # Tulis hasil kompilasi
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("=== STRUKTUR & ISI KODE SANTIKA-FE (HYBRID MODE) ===\n\n")
        for file_path in sorted(files_to_process):
            relative_path = file_path.relative_to(target_path)
            try:
                content = file_path.read_text("utf-8", errors="ignore")
                f.write(f"\n--- FILE: {relative_path} ---\n")
                f.write(content)
                f.write("\n")
                print(f"-> Menyalin: {relative_path}")
            except Exception as e:
                print(f"-> Gagal baca {relative_path}: {e}")

    print(f"\nSelesai! File hybrid tersimpan di: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()