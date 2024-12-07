class DiseaseUI {
    constructor() {
        this.symptoms = new Set();
        this.symptomCategories = {
            'Fever Symptoms': [
                'fever', 'high_fever', 'prolonged_fever'
            ],
            'Respiratory': [
                'cough', 'shortness_of_breath', 'sore_throat',
                'congestion_runny_nose', 'loss_taste_smell'
            ],
            'Body Pain': [
                'muscle_aches', 'muscle_pain', 'joint_muscle_pain',
                'severe_headache', 'headache', 'pain_behind_eyes'
            ],
            'Digestive': [
                'nausea_vomiting', 'diarrhea', 'constipation',
                'abdominal_pain'
            ],
            'Other': [
                'fatigue', 'weakness_fatigue', 'skin_rash',
                'mild_bleeding', 'chills', 'sweats', 'rose_spots'
            ]
        };
        this.initializeUI();
    }

    initializeUI() {
        const container = document.getElementById('symptom-container');

        Object.entries(this.symptomCategories).forEach(([category, symptoms]) => {
            const section = this.createCategorySection(category, symptoms);
            container.appendChild(section);
        });

        const analyzeButton = this.createAnalyzeButton();
        container.appendChild(analyzeButton);
    }

    createCategorySection(category, symptoms) {
        const section = document.createElement('div');
        section.className = 'symptom-category';

        const heading = document.createElement('h3');
        heading.textContent = category;
        section.appendChild(heading);

        symptoms.forEach(symptom => {
            const item = this.createSymptomItem(symptom);
            section.appendChild(item);
        });

        return section;
    }

    createSymptomItem(symptom) {
        const wrapper = document.createElement('div');
        wrapper.className = 'symptom-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = symptom;
        checkbox.addEventListener('change', () => this.updateSymptoms(symptom));

        const label = document.createElement('label');
        label.htmlFor = symptom;
        label.textContent = this.formatSymptomLabel(symptom);

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        return wrapper;
    }

    createAnalyzeButton() {
        const button = document.createElement('button');
        button.textContent = 'Analyze Symptoms';
        button.className = 'analyze-button';
        button.onclick = () => this.analyzeDisease();
        return button;
    }

    formatSymptomLabel(symptom) {
        return symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    updateSymptoms(symptom) {
        if (this.symptoms.has(symptom)) {
            this.symptoms.delete(symptom);
        } else {
            this.symptoms.add(symptom);
        }
    }

    // Method to analyze disease
    analyzeDisease = async () => {
        if (this.symptoms.size === 0) {
            this.showMessage('Please select at least one symptom');
            return;
        }

        try {
            const response = await fetch('/api/diagnose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    symptoms: Array.from(this.symptoms)
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const results = await response.json();
            this.displayResults(results);
        } catch (error) {
            this.showMessage('Error analyzing symptoms. Please try again.');
            console.error('Analysis error:', error);
        }
    }

    // Method to display results
    displayResults(results) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        const heading = document.createElement('h3');
        heading.textContent = 'Diagnosis Results';
        resultsDiv.appendChild(heading);

        console.log('API Response:', results);

        // Handle the nested results structure
        const diagnosisResults = results.results || results;

        diagnosisResults.forEach(([disease, confidence]) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
            <strong>${disease}</strong>: 
            ${confidence.toFixed(2)}% confidence
        `;
            resultsDiv.appendChild(resultItem);
        });
    }

}

document.addEventListener('DOMContentLoaded', () => {
    new DiseaseUI();
});
