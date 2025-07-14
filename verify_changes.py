import os

def verify_changes(files_to_verify):
    all_verified = True
    for filename in files_to_verify:
        with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                if '<summary class="h4">' in line and 'complaint' not in line.lower():
                    print(f"Verification failed for {filename}: Found unmodified h4 tag.")
                    all_verified = False
                    break
                if '<summary class="h3">' in line and 'complaint' in line.lower():
                    print(f"Verification failed for {filename}: Found h3 tag in complaint summary.")
                    all_verified = False
                    break
            else:
                continue
            break

    if all_verified:
        print("All files verified successfully.")

if __name__ == "__main__":
    files_to_verify = [
        "GYNAECOLOGY Obstetrics CASE SHEET.html",
        "PSYCHIATRIC CASE SHEET.html",
        "CASE SHEET.html",
        "Pediatric Paediatric CASE SHEET.html",
        "Resp PEFR & Spacer.html",
        "OPHTHALMOLOGY Eye CASE SHEET.html",
        "ENT Ear nose throat CASE SHEET.html",
        "GIT MEDICINE SURGERY CASE SHEET.html",
        "Diabetic Lower limb CASE SHEET.html",
        "Rheumatology Hematology blood MEDICINE CASE SHEET swelling.html",
        "Sexual History section CASE SHEET.html",
        "DNACPR DNR DNAR Case sheet.html",
        "Testicular Testis CASE SHEET inguinal SWELLING.html",
        "ITCHING_case_sheet_part.html",
        "TEACHING STATION.html",
        "CASE SHEET SWELLING breast.html",
        "RESPIRATORY SYSTEM case sheet.html",
        "ENDOCRINOLOGY CASE SHEET SWELLING thyroid.html",
        "Orthopedics CASE SHEET swelling.html",
        "Nephrology MEDICINE CASE SHEET.html",
        "Neurology CNS CASE SHEET.html",
        "CVS MEDICINE CASE SHEET.html",
        "Dermatology skin CASE SHEET  lymph node SWELLING.html",
        "SKIN_LESION_RASH_CASE_SHEET_PART.html"
    ]
    verify_changes(files_to_verify)
