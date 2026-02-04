// app/components/tasks/magnitudeComparisonTimeline.ts

import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import {
  COMPARISON_TRIALS,
  randomizeSides,
  type ComparisonTrial,
} from "@/app/data/protocolStimuli";
import { renderValueHTML } from "@/app/components/renderValue";

// --- Styling (same vibe as your current jsPsych cards) ---
const cardStyle = `
  border: 4px solid black; padding: 40px; border-radius: 20px;
  background: white; box-shadow: 8px 8px 0px rgba(0,0,0,0.2);
  min-width: 220px; height: 280px; display: flex;
  align-items: center; justify-content: center;
`;

const instructionStyle =
  "margin-top: 20px; font-size: 20px; font-weight: bold; color: #333;";

const buttonsCSS = `
  <style>
    .jspsych-btn {
      font-family: "Courier New", monospace !important;
      font-weight: 900 !important;
      font-size: 22px !important;
      padding: 14px 22px !important;
      border: 4px solid #111 !important;
      border-radius: 16px !important;
      background: #fff !important;
      box-shadow: 6px 6px 0px rgba(0,0,0,0.18) !important;
      color: #111 !important;
      cursor: pointer !important;
      transition: transform 0.12s ease-in-out, box-shadow 0.12s ease-in-out !important;
      margin: 0 10px !important;
      min-width: 140px !important;
    }
    .jspsych-btn:hover {
      transform: rotate(-1deg) scale(1.03) !important;
      box-shadow: 8px 8px 0px rgba(0,0,0,0.18) !important;
    }
    .jspsych-btn:active {
      transform: translateY(2px) !important;
      box-shadow: 4px 4px 0px rgba(0,0,0,0.18) !important;
    }

    .mc-title {
      font-size: clamp(28px, 6.5vw, 40px);
      font-weight: 900;
      color: #2563eb;
      margin-bottom: 10px;
      line-height: 1.15;
      letter-spacing: 2px;
      text-align: center;
    }

    .mc-question {
      font-size: clamp(24px, 6vw, 36px);
      font-weight: 900;
      color: #2563eb;
      margin-bottom: 22px;
      text-align: center;
      line-height: 1.15;
      letter-spacing: 1px;
    }

    .mc-cards {
      display: flex;
      gap: 40px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
    }

    @media (max-width: 640px) {
      .mc-cards {
        gap: 12px;
      }

      .mc-card {
        min-width: 44vw !important;
        height: 200px !important;
        padding: 18px !important;
      }

      .mc-value {
        transform: scale(0.85);
        transform-origin: center;
      }
    }
  </style>
`;

type BuildOptions = {
  // If you want to run only one block for debugging: "Pre-Instruction" or "Post-Instruction"
  block?: ComparisonTrial["block"];
  // Optional: cap number of trials for quick tests
  limit?: number;

  // NEW: tag trials as "pre" | "post" | "monster" (or any string you want)
  phase?: string;

  // NEW: optionally hide the intro screen (useful when chaining many sections)
  showIntro?: boolean;

  // NEW: customize the title on the intro screen
  introTitle?: string;

  // NEW: deterministic order/side randomization
  orderSeed?: string | number;
};

export function buildMagnitudeComparisonTimeline(options: BuildOptions = {}) {
  const {
    block,
    limit,
    phase = "magnitude_compare",
    showIntro = true,
    introTitle = "MAGNITUDE COMPARISON",
    orderSeed,
  } = options;

  const createRng = (seedInput?: string | number): (() => number) => {
    if (seedInput === undefined || seedInput === null) return Math.random;
    const seedStr = String(seedInput);
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i += 1) {
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    let state = h >>> 0;
    return () => {
      state += 0x6d2b79f5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const rng = createRng(orderSeed);

  const shuffle = <T,>(arr: T[], rng: () => number = Math.random): T[] => {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  // 1) Start from Protocol trials (cross + within)
  let trials = COMPARISON_TRIALS.slice();

  // 2) Optional block filter
  if (block) trials = trials.filter((t) => t.block === block);

  // 3) Shuffle order so each run is randomized
  trials = shuffle(trials, rng);

  // 4) Optional limit for quick tests
  if (typeof limit === "number") trials = trials.slice(0, limit);

  // 5) Randomize left/right *per trial*
  const randomized = trials.map((t) => randomizeSides(t, rng));

  // 5) Build jsPsych timeline
  const timeline: any[] = [];

  // Intro screen (BUTTON instead of "press any key" for tablet/mobile)
  if (showIntro) {
    timeline.push({
      type: HtmlButtonResponsePlugin,
      stimulus: `
        ${buttonsCSS}
        <div style="padding: 30px; text-align: center;">
          <h2 class="mc-title">${introTitle}</h2>
          <p style="font-size: 22px; color: #333;">Pick which value is larger.</p>
          <p style="font-size: 16px; color: #666; margin-top: 8px;">Tap a button to begin.</p>
        </div>
      `,
      choices: ["BEGIN"],
      data: { task: "magnitude_compare_intro", phase },
    });
  }

  randomized.forEach((t, idx) => {
    const correctIndex = t.correctSide === "left" ? 0 : 1;

    // Small fixation between trials
    timeline.push({
      type: HtmlKeyboardResponsePlugin,
      stimulus:
        '<div style="font-size: 90px; font-weight: 900; color: black;">+</div>',
      choices: "NO_KEYS",
      trial_duration: 350,
      data: { task: "fixation", phase },
    });

    timeline.push({
      type: HtmlButtonResponsePlugin,
      stimulus: `
        ${buttonsCSS}

        <h2 class="mc-question">WHICH ONE IS LARGER?</h2>

        <div class="mc-cards">
          <div class="mc-card" style="${cardStyle}"><div class="mc-value">${renderValueHTML(t.left)}</div></div>
          <!-- Removed "VS" per Schiller request -->
          <div class="mc-card" style="${cardStyle}"><div class="mc-value">${renderValueHTML(t.right)}</div></div>
        </div>

        <p style="${instructionStyle}; text-align:center;">
          Tap <strong>LEFT</strong> or <strong>RIGHT</strong>
        </p>

        <p style="margin-top: 10px; color: #999; text-align:center;">
          Trial ${idx + 1} / ${randomized.length}
        </p>
      `,
      choices: ["LEFT", "RIGHT"],
      data: {
        task: "magnitude_compare",
        phase,

        trial_id: t.id,
        block: t.block,
        distance: t.distance,
        relation: t.relation,
        left: t.left,
        right: t.right,
        left_value: t.leftVal,
        right_value: t.rightVal,
        correct_side: t.correctSide,
        correct_choice_index: correctIndex,
        wnb_consistent: t.meta?.wnbConsistent ?? null,
        decimal_digits: t.meta?.decimalDigits ?? null,
        source: t.meta?.source ?? null,
      },
      on_finish: (data: any) => {
        // HtmlButtonResponsePlugin stores button index in data.response (0/1)
        data.chosen_side = data.response === 0 ? "left" : "right";
        data.correct = data.response === correctIndex;
      },
    });
  });

  return timeline;
}
