import os

def find_and_replace_in_files(files_to_modify):
    for filename in files_to_modify:
        with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        new_content = []
        for line in content.splitlines():
            if '<summary class="h4">' in line and 'complaint' not in line.lower():
                new_content.append(line.replace('<summary class="h4">', '<summary class="h3">'))
            else:
                new_content.append(line)

        with open(filename, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_content))

if __name__ == "__main__":
    files_to_modify = [
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
    find_and_replace_in_files(files_to_modify)
    print("Files modified successfully.")
