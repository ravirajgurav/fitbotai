import { NLPWorkflowState, TrainerPersona } from '../types';

export function analyzeNLPInput(
  text: string,
  historyTurns: number,
  persona: TrainerPersona
): Omit<NLPWorkflowState, 'currentStage' | 'latencyMs'> {
  const lower = text.toLowerCase();

  // 1. Subword Tokenizer simulation (approx ~4 chars / token in English, with punctuation splitting)
  const estimatedTokens = Math.max(1, Math.round(text.length / 3.8));

  // 2. Intent Recognition
  let detectedIntent = 'General_Fitness_Query';

  if (/(pain|hurt|injured|injury|doctor|ache|strain)/i.test(lower)) {
    detectedIntent = 'Safety_Pain_Alert (Guardrail Triggered)';
  } else if (/(replace|swap|substitute|alternative|instead of|don't have)/i.test(lower)) {
    detectedIntent = 'Exercise_Entity_Substitution';
  } else if (/(how to|technique|form|posture|explain|cues|proper way)/i.test(lower)) {
    detectedIntent = 'Biomechanical_Form_Explanation';
  } else if (/(workout|routine|plan|program|split|session|chest day|leg day|pull day|push day|full body)/i.test(lower)) {
    detectedIntent = 'Workout_Generation_Request';
  } else if (/(how many sets|how many reps|rest period|tempo|rpe|rir|frequency)/i.test(lower)) {
    detectedIntent = 'Volume_Programming_Inquiry';
  } else if (/(eat|food|diet|protein|pre-workout|post-workout|calories|nutrition|meal)/i.test(lower)) {
    detectedIntent = 'Sports_Nutrition_Inquiry';
  }

  // 3. Entity Extraction & Slot Filling
  const muscles: string[] = [];
  if (/(chest|pec|pecs|incline press|bench)/i.test(lower)) muscles.push('Pectoralis Major / Minor');
  if (/(back|lat|lats|pull-up|row)/i.test(lower)) muscles.push('Latissimus Dorsi / Rhomboids');
  if (/(bicep|biceps|arm|arms|curl)/i.test(lower)) muscles.push('Biceps Brachii');
  if (/(tricep|triceps|pushdown|dip)/i.test(lower)) muscles.push('Triceps Brachii');
  if (/(leg|legs|quad|quads|hamstring|squat|lunge|calf)/i.test(lower)) muscles.push('Quadriceps & Hamstrings');
  if (/(shoulder|shoulders|delt|delts|overhead)/i.test(lower)) muscles.push('Deltoids');
  if (/(abs|core|abdominals|plank)/i.test(lower)) muscles.push('Rectus Abdominis / Core');

  const equipment: string[] = [];
  if (/(dumbbell|dumbbells|db)/i.test(lower)) equipment.push('Dumbbells');
  if (/(barbell|barbells|bb)/i.test(lower)) equipment.push('Barbell');
  if (/(cable|cables|pulley)/i.test(lower)) equipment.push('Cables');
  if (/(machine|machines|smith)/i.test(lower)) equipment.push('Machines');
  if (/(bodyweight|no equipment|home|calisthenics)/i.test(lower)) equipment.push('Bodyweight Only');
  if (/(band|bands|resistance)/i.test(lower)) equipment.push('Resistance Bands');

  // Extract duration (e.g. 15 min, 30 minutes, 45m)
  const durationMatch = text.match(/(\d{1,3})\s*(?:min|mins|minutes|m\b)/i);
  const duration = durationMatch ? `${durationMatch[1]} Minutes` : undefined;

  // Extract experience level
  let level: string | undefined;
  if (/(beginner|starter|new to gym|first time)/i.test(lower)) level = 'Beginner';
  else if (/(intermediate|regular)/i.test(lower)) level = 'Intermediate';
  else if (/(advanced|pro|athlete|heavy)/i.test(lower)) level = 'Advanced';

  return {
    lastInputText: text,
    tokenCount: estimatedTokens,
    detectedIntent,
    extractedEntities: {
      muscles: muscles.length > 0 ? muscles : ['Full Body / Unspecified'],
      equipment: equipment.length > 0 ? equipment : ['Standard Gym Setup'],
      duration,
      level,
    },
    contextTurns: historyTurns,
    activePersona: persona,
  };
}
