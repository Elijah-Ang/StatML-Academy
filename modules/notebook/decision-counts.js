// One source of truth for the explicitly illustrative 10,000-case rate model.
export function illustrativeCounts(prevalence,threshold,n=10000) {
  const positives=Math.round(n*prevalence/100),negatives=n-positives;
  const sensitivity=(1-threshold)**(Math.log(.9)/Math.log(.5));
  const falsePositiveRate=(1-threshold)**(Math.log(.05)/Math.log(.5));
  const tp=Math.round(positives*sensitivity),fp=Math.round(negatives*falsePositiveRate);
  return {tp,fn:positives-tp,fp,tn:negatives-fp};
}
