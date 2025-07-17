
  document.addEventListener('DOMContentLoaded', () => {

      // --- CONFIGURATION ---

      // 1. MASTER ORDER: This array is now COMPLETE and controls the exact order of the bars.
      // You can drag and drop these lines to change the visual order.
      const SYSTEM_ORDER = [
          'cvs',
          'respiratory',
          'git',
          'cns',
          'rheumatic',
          'oncology',
          'hematology',
          'infectious',
          'endocrine',
          'nephro',
          'derma',
          'psychiatric',
          'emergency',
          'surgery',
          'gynob',
          'obstetric',
          'gynaecology',
          'ortho-specific',
          'ent',
          'ophthalmology'
      ];

      

      var PLACEHOLDER_COLOR = '#f5f5f5';
      

      // 3. COLOR MAP (This remains the same, as it was correct)
      const colorMap = {
          'cvs': 'rgba(0, 221, 203, 0.7)',
          'gynob': 'rgba(0, 196, 121, 0.8)',
          'surgery': 'rgba(218, 123, 236, 0.2)',
          'Nephro': 'hsla(182, 100%, 42%, 0.7)',
          'nephro': 'hsla(182, 100%, 42%, 0.7)',
          'gynaecology': 'rgba(24, 128, 59, 0.2)',
          'ortho-specific': 'rgba(0, 100, 200, 0.1)',
          'ophthalmology': 'rgba(0, 0, 0, 0.2)',
          'oncology': 'rgb(0, 255, 255)',
          'rheumatic': 'rgb(157, 255, 0)',
          'ent': 'rgb(0, 199, 99)',
          'Ent': 'rgb(0, 199, 99)',
          'emergency': 'rgb(255, 0, 0)',
          'psychiatric': 'rgb(255, 115, 0)',
          'git': '#b039e7',
          'Respiratory': '#058a3c',
          'respiratory': '#058a3c',
          'derma': '#378eff',
          'hematology': 'rgba(255, 20, 147, 0.8)',
          'hematologic': 'rgba(255, 20, 147, 0.8)',
          'Endocrine': 'rgb(204, 20, 164)',
          'endocrine': 'rgb(204, 20, 164)',
          'infectious': '#37ffd4',
          'cns': 'rgb(0, 17, 255)',
          'obstetric': 'rgb(0, 190, 165)'
      };

       // --- SCRIPT LOGIC (WITH SPACING FIX) ---
       const listItems = document.querySelectorAll('li');
        const barWidth = 5;
        const barGap = 3;

        // Calculate the total horizontal space the bars will occupy.
        const totalBarOffset = SYSTEM_ORDER.length * (barWidth + barGap);

        listItems.forEach(item => {
            // 2. APPLY THE SPACING FIX
            // A) Create space on the left for the bars using padding.
            item.style.paddingLeft = `${totalBarOffset}px`;
            // B) Pull the text back to the left by the same amount to remove the gap.
            item.style.textIndent = `-${totalBarOffset}px`;

            const shadows = [];
            SYSTEM_ORDER.forEach((systemClass, index) => {
                const offset = (index * (barWidth + barGap)) + barWidth + 2;
                let color = PLACEHOLDER_COLOR;

                if (item.classList.contains(systemClass) || item.classList.contains(systemClass.charAt(0).toUpperCase() + systemClass.slice(1))) {
                    color = colorMap[systemClass.toLowerCase()];
                }
                shadows.push(`-${offset}px 0 0 0 ${color}`);
            });

            if (shadows.length > 0) {
                item.style.boxShadow = shadows.join(', ');
            }
        });
    });
