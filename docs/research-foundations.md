# SplitLab: Research Foundations

This document summarizes the sports-science literature that informed SplitLab's feature decisions, specifically pacing shape classification, RPE logging, the Volume × Pace Quadrant, and the deferred/ruled-out features. It's meant to give any future contributor (including future me) the "why" behind the product's data model, not just the "what."

Five papers were reviewed. None of them are about app design. They're exercise-physiology and sports-medicine studies on pacing, fatigue, and injury risk in runners. SplitLab translates their findings into a reflection tool, not a training-prescription tool, which is a deliberate scope choice explained below.

## Core product implication

The literature converges on one theme that matches SplitLab's "reflection over prescription" philosophy: pacing and fatigue are driven by a mix of perceptual (how effort feels) and physiological/biomechanical (what the body is actually doing) factors, and which one dominates shifts across a run. That's a strong argument against a single prescriptive rule ("always negative split," "never fade") and a strong argument for showing runners their own pattern and letting them draw conclusions.

---

## The five sources

| # | Citation (short) | Type | Population | What it studied |
|---|---|---|---|---|
| 1 | Bertuzzi et al., 2014, *J Strength Cond Res* | Original research | 28 male long-distance recreational runners | Perceptual, physiological, and muscular predictors of pacing across the 3 phases of a 10-km time trial |
| 2 | Fernández et al. (systematic review), *Int J Exerc Sci*, 2024 | Systematic review | Multiple studies, ~7-34 runners each | Effect of fatigue on running kinematics during marathon/ultramarathon efforts |
| 3 | Apte et al., *Frontiers in Physiology*, 2021 | Systematic review | 68 studies | Lower-extremity biomechanical response to acute fatigue, and how to measure it with wearables |
| 4 | Ramskov et al., 2022, *Journal of Athletic Training* | Secondary analysis of RCT (Run Clever trial) | 586 recreational runners, Denmark | Interaction between weekly changes in running volume and running pace, and injury occurrence |
| 5 | Gao et al., 2023, *Applied Bionics and Biomechanics* | Original research (ML) | 30 amateur runners | CNN/ConvLSTM detection of fatigue gait from plantar pressure (pedobarography) data |

Full citations are at the bottom.

---

## 1. Pacing strategy determinants (Bertuzzi et al., 2014)

**What they found:** During a 10-km time trial, runners produce a U-shaped speed curve: fast start, slower middle, faster finish. But the *cause* of that shape changes across the run:

- **Start phase (first 400m):** RPE alone explained 72% of pacing variance. Effort perception, not physiology, drives the opening pace.
- **Middle phase (400m-9.6km):** Peak treadmill speed explained 52%, with VO2max and max strength adding 23% and 5%. This is where physiological ceiling takes over.
- **End phase (last 400m):** Peak treadmill speed alone explained 66% of the finishing kick. Anaerobic capacity dominates the endspurt.

**Where this shows up in SplitLab:** This is the direct source for the pacing-shape classification system (Even, Negative Split, Positive Split, Late Fade, Erratic). It's also the reason the PRD explicitly scopes the "sprint-finish" or endspurt pattern to race efforts rather than treating it as a universal training-run classification. The paper's U-shape and endspurt findings are about competitive time trials with a defined finish line to race toward, which doesn't describe most training runs.

**Caveats to keep in mind:** n=28, all male, all trained recreational-to-competitive long-distance runners performing a maximal-effort time trial on an outdoor track. This is not a casual phone-tracked jog. The regression equations (which convert lab-measured VO2max, treadmill speed, and 1RM into predicted pace) aren't usable by SplitLab at all, since none of those inputs exist in Strava data. Only the *conceptual* framework (perceptual vs. physiological drivers, phase-dependent causes) transfers, not the specific numbers.

---

## 2. Fatigue and running kinematics in marathon/ultramarathon (systematic review, 2024)

**What they found:** Across the reviewed studies, fatigue's effect on running mechanics is inconsistent and protocol-dependent. Stride length tends to decrease with fatigue, though the timing varies (one study found most of the drop happens in the first hour). Contact time tends to increase. Stride frequency findings conflict between studies, some show it decreasing, others show slight increases as a possible strategy to reduce ground-impact forces. One study on slow starts in a 6-hour ultramarathon found that starting slower reduced perceived exertion and fatigue but didn't change overall finishing performance.

**Where this shows up in SplitLab:** This is supporting evidence (alongside the Bertuzzi paper) that a "slow start" isn't inherently a bad pacing outcome worth flagging or correcting, which reinforces the reflection-not-prescription stance on the pacing-shape card.

**Caveats to keep in mind:** These are marathon/ultramarathon-distance, largely lab- or track-based kinematic studies (motion capture, force plates, treadmills) on trained/experienced runners. SplitLab has none of that instrumentation; it only has GPS-derived pace per split. The kinematic-level findings (stride length, contact time) aren't measurable from Strava data at all and shouldn't be implied by any SplitLab copy.

---

## 3. Running biomechanics under acute fatigue (Apte et al., 2021)

**What they found:** Across 68 studies, a small set of biomechanical parameters showed a *consistent* trend under fatigue: contact time and flight time increase, while cadence, vertical stiffness, leg stiffness, and max ground reaction force decrease. Most of this research (78%) was done in a lab with stationary equipment (motion capture, instrumented treadmills), not in the field. The authors explicitly call for more wearable-sensor-based field studies and propose a 3-4 sensor IMU setup as a starting point.

**Where this shows up in SplitLab:** This paper is the clearest evidence for *why* SplitLab defers effort-adjusted pace and rules out anything resembling biomechanical fatigue detection. The metrics that reliably indicate fatigue (contact time, vertical stiffness, GRF) require IMU-based wearables. Reuben runs with a phone only, and the PRD is explicitly scoped around that constraint. There's no accurate substitute for these signals from GPS pace data alone, so SplitLab correctly doesn't attempt to infer biomechanical fatigue and instead relies on self-reported RPE.

**Caveats to keep in mind:** The review itself flags that field validation of these trends (as opposed to lab treadmill-to-exhaustion protocols) is sparse. Even the "consistent" parameters aren't validated at typical recreational training paces, which is the actual SplitLab use case.

---

## 4. Volume/pace interaction and injury risk (Ramskov et al., 2022)

**What they found:** Using data from 586 recreational runners over 24 weeks (the Run Clever trial), the authors tested whether progressing *both* weekly running volume and weekly running pace at the same time is more injurious than progressing either one alone. The honest result: **no statistically significant interaction was found**, for either relative or absolute weekly changes. A runner progressing both volume >10% and pace showed a 12.4% higher injury rate than the reference group, but the interaction term itself (the "combined effect exceeds the sum of parts" test) wasn't significant (p=.36 for relative change, p=.55 for absolute change).

**Where this shows up in SplitLab:** This is the direct source for the Volume × Pace Quadrant chart, which plots weekly volume against weekly pace per the PRD. But it's important to be precise about what the paper actually supports: it validates volume and pace as two variables worth tracking together, since that combination is a live question in the injury literature, not that SplitLab's chart is validated as an injury-risk predictor. The paper's own conclusion is that this interaction *should be studied further*, not that it's a confirmed risk multiplier.

**Caveats to keep in mind:** This is the single most important caveat in the whole document. **Do not let SplitLab's copy imply that the Volume × Pace Quadrant predicts or flags injury risk.** The source study found a non-significant result on that exact question. The chart should be framed purely descriptively (what did volume and pace do this week), consistent with the reflection-over-prescription principle, not as a risk indicator. This also lines up with why RPE-adjusted axes are deferred until logging is more established, since RPE wasn't even the exposure variable in this particular study; volume and pace were.

---

## 5. Fatigue detection from plantar pressure (Gao et al., 2023)

**What they found:** Using a CNN and ConvLSTM model trained on pedobarographic (plantar force plate) data from 30 amateur runners, the authors could detect fatigued vs. non-fatigued gait with up to 86.7% accuracy (ConvLSTM). Fatigue produced measurable shifts in midfoot/heel force distribution and timing of peak forces, with asymmetries between dominant and non-dominant limbs.

**Where this shows up in SplitLab:** Mostly as a reference point for how far outside SplitLab's reach true fatigue detection is. This method requires a force plate and a trained ML model on lab-collected pressure data; it has no bearing on what's derivable from Strava's GPS/pace exports. It reinforces the same conclusion as the Apte review: fatigue detection belongs to instrumented lab or wearable-sensor contexts, not to a phone-only running app.

**Caveats to keep in mind:** 30 amateur runners, single controlled fatigue protocol, no external validation cohort. Cite only as evidence that fatigue detection is a hard, instrumentation-heavy problem, not as evidence for any specific SplitLab feature.

---

## Where the research does and doesn't apply

**What transfers to SplitLab:**
- The conceptual model that pacing has phase-dependent causes (perceptual early, physiological/anaerobic later) supports classifying pacing *shape* descriptively rather than grading it against one ideal curve.
- The volume/pace interaction question is a legitimate, open area of running-injury research, which justifies surfacing volume and pace together in the Weekly Load Snapshot and quadrant chart.
- Consistent findings that fatigue is genuinely hard to detect without dedicated sensors justify SplitLab's decision to rely on self-reported RPE rather than inferring effort or fatigue from pace/GPS data alone.

**What doesn't transfer, and shouldn't be implied by app copy or features:**
- None of the specific regression equations, thresholds, or ML models in these papers are usable inputs. SplitLab has no VO2max, no 1RM, no force-plate data, no IMU data.
- The injury-interaction study (#4) returned a non-significant result. SplitLab should never frame its load chart as injury-predictive.
- Most study populations are trained, competitive, or lab-monitored runners performing maximal-effort protocols. SplitLab's actual user (a recreational, phone-only runner on a normal training run) is a different context, and conclusions should be treated as directional inspiration, not applied science.

---

## References

1. Bertuzzi, R., Lima-Silva, A. E., Pires, F. O., Damasceno, M. V., Bueno, S., Pasqua, L. A., & Bishop, D. J. (2014). Pacing strategy determinants during a 10-km running time trial: Contributions of perceived effort, physiological, and muscular parameters. *Journal of Strength and Conditioning Research, 28*(6), 1688-1696.

2. [Systematic review authors per publication]. (2024). Influence of fatigue on running kinematics during marathon and ultramarathon events: A systematic review. *International Journal of Exercise Science, 17*(1), 1377-1391.

3. Apte, S., et al. (2021). Biomechanical response of the lower extremity to running-induced acute fatigue: A systematic review. *Frontiers in Physiology, 12*, 646042.

4. Ramskov, D., Rasmussen, S., Sørensen, H., Parner, E. T., Lind, M., & Nielsen, R. (2022). Interactions between running volume and running pace and injury occurrence in recreational runners: A secondary analysis. *Journal of Athletic Training, 57*(6), 557-563.

5. Gao, Z., Xiang, L., Fekete, G., Baker, J. S., Mao, Z., & Gu, Y. (2023). A data-driven approach for fatigue detection during running using pedobarographic measurements. *Applied Bionics and Biomechanics, 2023*, Article ID 7022513.

*Full PDFs of all five sources are retained in the project knowledge base for reference.*
