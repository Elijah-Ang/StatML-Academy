// The original neural renderers were retired in the full notebook rollout.
// Keep the established command, exercising the new stages and numeric mechanisms.
process.env.ROLLOUT_SLUGS = "neural-networks,deep-learning";
process.env.ROLLOUT_WIDTHS ||= "1440,768,430,320";
await import("./test-expanded-browser.mjs");
