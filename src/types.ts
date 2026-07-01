export interface Condition {
  condition: string;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  basicAdvice: string;
  whenToSeeDoctor: string;
}
