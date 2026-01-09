"use client";

import { useEffect, useRef } from 'react';
import { initJsPsych } from 'jspsych';
import HtmlKeyboardResponsePlugin from '@jspsych/plugin-html-keyboard-response';
import HtmlSliderResponsePlugin from '@jspsych/plugin-html-slider-response';
import 'jspsych/css/jspsych.css'; 
import { TRIALS, TrialData } from '../data/stimuli';

// --- STYLING HELPERS ---
const cardStyle = `
  border: 4px solid black; padding: 40px; border-radius: 20px; 
  background: white; box-shadow: 8px 8px 0px rgba(0,0,0,0.2); 
  min-width: 220px; height: 280px; display: flex; 
  align-items: center; justify-content: center; font-family: 'Courier New', monospace; color: black;
`;

const textStyle = "font-size: 50px; font-weight: 900; color: black;";
const instructionStyle = "margin-top: 30px; font-size: 24px; font-weight: bold; color: #333;";

// Helper: Shuffle
function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

// Helper: Create Round
function createRoundTimeline(trialA: TrialData, trialB: TrialData, benchmarkTrial: TrialData, roundIndex: number) {
    const timeline = [];

    // --- LOGIC: Benchmark Selection ---
    const useLeftForBenchmark = Math.random() > 0.5;
    const benchmarkTarget = useLeftForBenchmark ? benchmarkTrial.left : benchmarkTrial.right;

    // --- STEP 1: Comparison A ---
    timeline.push({
        type: HtmlKeyboardResponsePlugin,
        stimulus: `
            <h2 style="font-size: 36px; font-weight: 900; color: #2563eb; margin-bottom: 30px;">WHICH ONE IS LARGER?</h2>
            <div style="display: flex; gap: 40px; justify-content: center; align-items: center;">
                <div style="${cardStyle}"><span style="${textStyle}">${trialA.left}</span></div>
                <div style="font-size: 60px; font-weight: 900; color: #333;">VS</div>
                <div style="${cardStyle}"><span style="${textStyle}">${trialA.right}</span></div>
            </div>
            <p style="${instructionStyle}">Press <strong>F</strong> (Left) or <strong>J</strong> (Right)</p>
            <p style="margin-top: 10px; color: #999;">Round ${roundIndex + 1}</p>
        `,
        choices: ['f', 'j'],
        data: { 
            task: 'compare', 
            notation_type: trialA.type, // e.g. "Fraction > Decimal"
            correct_response: (trialA.correct_value.toString() === trialA.left) ? 'f' : 'j' // Simplified check
        }
    });

    // --- STEP 2: Comparison B ---
    timeline.push({
        type: HtmlKeyboardResponsePlugin,
        stimulus: `
            <h2 style="font-size: 36px; font-weight: 900; color: #2563eb; margin-bottom: 30px;">WHICH ONE IS LARGER?</h2>
            <div style="display: flex; gap: 40px; justify-content: center; align-items: center;">
                <div style="${cardStyle}"><span style="${textStyle}">${trialB.left}</span></div>
                <div style="font-size: 60px; font-weight: 900; color: #333;">VS</div>
                <div style="${cardStyle}"><span style="${textStyle}">${trialB.right}</span></div>
            </div>
            <p style="${instructionStyle}">Press <strong>F</strong> (Left) or <strong>J</strong> (Right)</p>
            <p style="margin-top: 10px; color: #999;">Round ${roundIndex + 1}</p>
        `,
        choices: ['f', 'j'],
        data: { 
            task: 'compare', 
            notation_type: trialB.type 
        }
    });

    // --- STEP 3: Benchmark ---
    timeline.push({
        type: HtmlSliderResponsePlugin, 
        stimulus: `
            <h2 style="font-size: 36px; font-weight: 900; color: #16a34a; margin-bottom: 30px;">BENCHMARK TASK</h2>
            <div style="${cardStyle}; width: 180px; height: 120px; margin: 0 auto 30px auto;">
               <span style="${textStyle}">${benchmarkTarget}</span>
            </div>
            <p style="font-size: 28px; color: black; font-weight: bold; margin-bottom: 20px;">Where does this go on the line?</p>
        `,
        labels: ['0', '0.5', '1'],
        min: 0,
        max: 100,
        start: 50,
        require_movement: true, 
        button_label: "SUBMIT ANSWER",
        data: { task: 'benchmark' }
    });

    return timeline;
}

type ExperimentProps = {
  onFinish?: (data: any) => void;
};

const JsPsychExperiment: React.FC<ExperimentProps> = ({ onFinish }) => {
  const experimentDivId = "jspsych-target";
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const jsPsych = initJsPsych({
      display_element: experimentDivId,
      on_finish: (data) => {
        // --- MAVERICK CALCULATIONS ---
        const totalTrials = data.filter({task: 'compare'}).count();
        // Mock accuracy (60-100% for demo) until we implement full answer checking logic
        const correctCount = Math.floor(totalTrials * (0.7 + Math.random() * 0.3));
        
        // Mock "Super Power" logic
        const notations = ["Fractions", "Decimals", "Percentages"];
        const best = notations[Math.floor(Math.random() * notations.length)];
        const worst = notations[Math.floor(Math.random() * notations.length)];

        if (onFinish) onFinish({
            raw: data,
            summary: {
                total: totalTrials,
                correct: correctCount,
                superPower: best,
                needsPractice: worst
            }
        });
      }
    });
    
    const timeline = [];

    // 1. Welcome
    timeline.push({
      type: HtmlKeyboardResponsePlugin,
      stimulus: `
        <div class="text-center" style="padding: 40px;">
          <h1 style="font-size: 60px; font-weight: 900; color: #2563eb; margin-bottom: 20px;">MATH CHALLENGE</h1>
          <p style="font-size: 24px; color: #333;">You will play 5 rounds.</p>
          <div style="margin-top: 50px; padding: 20px; background: #2563eb; color: white; display: inline-block; font-weight: bold; font-size: 24px; border-radius: 10px;">
            Press any key to start
          </div>
        </div>
      `,
    });

    // 2. Generate Rounds
    const shuffledTrials = shuffleArray(TRIALS);
    const ROUNDS = 5;
    let trialCursor = 0;

    for (let i = 0; i < ROUNDS; i++) {
        if (trialCursor + 3 > shuffledTrials.length) break;
        
        timeline.push({
            type: HtmlKeyboardResponsePlugin,
            stimulus: '<div style="font-size: 100px; font-weight: bold; color: black;">+</div>',
            choices: "NO_KEYS",
            trial_duration: 500,
        });
        
        const t1 = shuffledTrials[trialCursor];
        const t2 = shuffledTrials[trialCursor + 1];
        const t3 = shuffledTrials[trialCursor + 2];
        trialCursor += 3;

        const roundTrials = createRoundTimeline(t1, t2, t3, i);
        timeline.push(...roundTrials); 
    }

    // 3. Run
    jsPsych.run(timeline);

  }, [onFinish]);

  return (
    <div id={experimentDivId} className="w-full h-full min-h-[600px] flex flex-col items-center justify-center"></div>
  );
};

export default JsPsychExperiment;