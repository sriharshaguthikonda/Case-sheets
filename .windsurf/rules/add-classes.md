---
trigger: always_on
---

add these classes to each of elements in the html 

think of this html as a doctor's protocol to management of a patient with a complaint....it could be for different systems in the body. 

based on that add classes to the html.

each element can have many classes because they might have to be dealt with in another condition of another system from the given classes:


.cvs { background-color: rgba(10, 224, 213, 0.2); } means cardiovascular conditions 


.rheumatic { background-color:rgba(100, 224, 69, 0.2); } for autoimmune conditions 


.psychiatric::before { border-left: 7px solid rgb(255, 133, 77); }
.git::before { background-color: #b039e7; } is for gastrointestinal conditions 

.Respiratory::before, .respiratory::before { border-right: 5px solid #058a3c; }

.derma::after { border-left: 5px solid #378eff; } for skin or dermatological conditions

.hematology::after { background-color: rgba(0, 255, 255); }

.Endocrine::after, .endocrine::after { border-right: 5px solid rgb(204, 20, 164); }

.infectious::after { border-left: 5px solid #37ffd4; }

.gynob { background-color: rgba(0, 196, 121, 0.8); } /* Kept as border-left for variety */
.surgery { background-color: rgba(218, 123, 236, 0.2); } /* Kept as border-left for variety */

.cns { border-right: 5px solid rgb(24, 36, 204); } for central nervous system conditions

.Nephro, .nephro { background-color: hsla(182, 100%, 42%, 0.288); } for nephrology conditions

.obstetric { border-left: 7px solid rgb(0, 190, 165); }
.gynaecology { background-color: rgba(24, 128, 59, 0.2); }
.ortho-specific { background-color: rgba(0, 100, 200, 0.1); }
.ophthalmology { background-color: rgba(0, 0, 0, 0.2); }

.Sexual_history_section {
    background-color: rgba(218, 247, 235, 0.7);
    margin: 35px 0;
    padding: 15px;
}





add class General to the elements which apply to all possible medical or other conditions!
