import numpy as np

class DiseaseAnalyzer:
    def __init__(self):
        # Complete symptom mapping
        self.symptom_map = {
            'fever': 'F',
            'high_fever': 'HF',
            'prolonged_fever': 'PF',
            'cough': 'C',
            'shortness_of_breath': 'S',
            'fatigue': 'FT',
            'weakness_fatigue': 'WF',
            'muscle_aches': 'MA',
            'muscle_pain': 'MP',
            'loss_taste_smell': 'LTS',
            'sore_throat': 'ST',
            'congestion_runny_nose': 'CRN',
            'nausea_vomiting': 'NV',
            'diarrhea': 'D',
            'constipation': 'DC',
            'severe_headache': 'SH',
            'headache': 'H',
            'pain_behind_eyes': 'PBE',
            'joint_muscle_pain': 'JMP',
            'skin_rash': 'SR',
            'mild_bleeding': 'MB',
            'chills': 'CH',
            'sweats': 'SW',
            'abdominal_pain': 'APD',
            'rose_spots': 'RF'
        }
        
        # Disease patterns with complete symptom sequences
        self.disease_database = {
            'covid19': 'F-C-S-FT-MA-LTS-ST-CRN-NV-D',
            'dengue': 'HF-SH-PBE-JMP-FT-NV-SR-MB',
            'malaria': 'F-CH-SW-H-NV-FT-MP',
            'typhoid': 'PF-WF-H-NV-APD-DC-RF'
        }
    
    def needleman_wunsch(self, seq1, seq2):
        match_score = 2
        mismatch_score = -1
        gap_penalty = -2
        
        m, n = len(seq1), len(seq2)
        score_matrix = np.zeros((m + 1, n + 1))
        
        # Initialize matrix
        for i in range(m + 1):
            score_matrix[i][0] = gap_penalty * i
        for j in range(n + 1):
            score_matrix[0][j] = gap_penalty * j
            
        # Fill score matrix
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                match = score_matrix[i-1][j-1] + (match_score if seq1[i-1] == seq2[j-1] else mismatch_score)
                delete = score_matrix[i-1][j] + gap_penalty
                insert = score_matrix[i][j-1] + gap_penalty
                score_matrix[i][j] = max(match, delete, insert)
        
        return score_matrix[m][n]
    
    def map_symptoms(self, symptoms):
        mapped = [self.symptom_map.get(s.lower(), '') for s in symptoms]
        return '-'.join(filter(None, mapped))
    
    def diagnose(self, symptoms):
        patient_sequence = self.map_symptoms(symptoms)
        results = {}
        
        for disease, sequence in self.disease_database.items():
            alignment_score = self.needleman_wunsch(patient_sequence.split('-'), sequence.split('-'))
            # Enhanced scoring system
            sequence_length = len(sequence.split('-'))
            base_score = 50  # Starting base score
            match_bonus = (alignment_score / (2 * sequence_length)) * 50  # Scaled bonus for matches
            
            # Calculate final confidence with minimum threshold
            confidence = base_score + match_bonus
            results[disease] = max(20, min(100, confidence))  # Keep scores between 20-100%
        
        return sorted(results.items(), key=lambda x: x[1], reverse=True)
