// Copyright (c) 2026 Mustafa Uzumeri. All rights reserved.

'use strict';

/* ============================================================
   TAB NAVIGATION
   ============================================================ */
const initTabs = () => {
  const tabs = document.querySelectorAll('.tab-btn:not(:disabled)');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(`panel-${target}`).classList.add('active');
    });
  });
};

/* ============================================================
   NUMBER ANIMATION
   ============================================================ */
/**
 * Animate a numeric value change with a brief scale-bump.
 * @param {HTMLElement} el
 * @param {string} newText
 */
const animateValue = (el, newText) => {
  if (el.textContent === newText) return;
  el.textContent = newText;
  el.classList.remove('bump');
  // Force reflow so the animation re-triggers
  void el.offsetWidth;
  el.classList.add('bump');
  setTimeout(() => el.classList.remove('bump'), 200);
};

/* ============================================================
   FORMATTING HELPERS
   ============================================================ */
/**
 * Format a decimal number as hours with one decimal place.
 * @param {number} hrs
 * @returns {string}
 */
const fmtHrs = (hrs) => {
  if (hrs < 1) return `${Math.round(hrs * 60)} min`;
  return `${hrs.toFixed(1)} hrs`;
};

/**
 * Format hours as "X hrs (Y min)" for small totals.
 * @param {number} hrs
 * @returns {string}
 */
const fmtHrsFull = (hrs) =>
  hrs >= 1 ? `${hrs.toFixed(1)} hrs` : `${Math.round(hrs * 60)} min`;

/* ============================================================
   CALCULATOR 1 — ASYMMETRY PROBLEM
   ============================================================ */
const initAsymmetryCalc = () => {
  const inputs = {
    classSize:    document.getElementById('class-size'),
    extraMins:    document.getElementById('extra-minutes'),
    schoolDays:   document.getElementById('school-days'),
    teacherHours: document.getElementById('teacher-hours'),
  };
  const outputs = {
    classSizeLabel:   document.getElementById('class-size-out'),
    extraMinsLabel:   document.getElementById('extra-minutes-out'),
    schoolDaysLabel:  document.getElementById('school-days-out'),
    teacherHoursLabel:document.getElementById('teacher-hours-out'),
    perStudent:       document.getElementById('cost-per-student'),
    perDay:           document.getElementById('cost-per-day'),
    perWeek:          document.getElementById('cost-per-week'),
    perYear:          document.getElementById('cost-per-year'),
    equivWeeks:       document.getElementById('equiv-weeks'),
    equivExplanation: document.getElementById('equiv-explanation'),
    insight:          document.getElementById('asymmetry-insight'),
  };

  const update = () => {
    const n    = +inputs.classSize.value;
    const m    = +inputs.extraMins.value;
    const days = +inputs.schoolDays.value;
    const hrs  = +inputs.teacherHours.value;

    // Slider labels
    outputs.classSizeLabel.textContent    = `${n} students`;
    outputs.extraMinsLabel.textContent    = `${m} min`;
    outputs.schoolDaysLabel.textContent   = `${days} days`;
    outputs.teacherHoursLabel.textContent = `${hrs} hrs`;

    // Core math
    const perDayMins  = n * m;                        // total teacher-minutes/day
    const perWeekHrs  = (perDayMins * 5) / 60;        // 5-day week
    const perYearHrs  = (perDayMins * days) / 60;      // annual

    // Teacher work-year for equivalence
    const workYearHrs = days * hrs;                    // hours in a school year
    const ftePercent  = (perYearHrs / workYearHrs * 100).toFixed(0);
    const equivWeeks  = (perYearHrs / (hrs * 5)).toFixed(1);

    animateValue(outputs.perStudent, `${m} min`);
    animateValue(outputs.perDay,   perDayMins >= 60
      ? `${(perDayMins/60).toFixed(1)} hrs`
      : `${perDayMins} min`);
    animateValue(outputs.perWeek,  fmtHrs(perWeekHrs));
    animateValue(outputs.perYear,  `${Math.round(perYearHrs)} hrs`);
    animateValue(outputs.equivWeeks, `${equivWeeks} extra weeks`);

    outputs.equivExplanation.textContent =
      `That's ${ftePercent}% of a full school year of teacher time — every year — for one method change.`;

    // Contextual insight
    let insight = '';
    if (perYearHrs < 50)
      insight = `${Math.round(perYearHrs)} hours a year is manageable — but only for one change. Stack two or three new methods and this doubles or triples.`;
    else if (perYearHrs < 150)
      insight = `${Math.round(perYearHrs)} hours a year is the equivalent of roughly ${Math.round(perYearHrs/hrs)} extra working days — unpaid, on top of everything else.`;
    else
      insight = `${Math.round(perYearHrs)} hours a year. The teacher doesn't get more hours. Something else gets cut — usually sleep, weekends, and the very methods this time was for.`;

    outputs.insight.textContent = insight;
  };

  Object.values(inputs).forEach(input => {
    input.addEventListener('input', update);
  });

  update(); // Initialize
};

/* ============================================================
   CALCULATOR 2 — OBSERVATION BURDEN
   ============================================================ */
const initObservationCalc = () => {
  const inputs = {
    students:      document.getElementById('obs-students'),
    goalsPerStu:   document.getElementById('goals-per-student'),
    obsPerGoal:    document.getElementById('obs-per-goal'),
    batchTime:     document.getElementById('batch-obs-time'),
    microTime:     document.getElementById('micro-obs-time'),
  };
  const outputs = {
    studentsLabel:    document.getElementById('obs-students-out'),
    goalsLabel:       document.getElementById('goals-per-student-out'),
    obsPerGoalLabel:  document.getElementById('obs-per-goal-out'),
    batchTimeLabel:   document.getElementById('batch-obs-time-out'),
    microTimeLabel:   document.getElementById('micro-obs-time-out'),
    totalObs:         document.getElementById('total-obs'),
    batchHrsWeek:     document.getElementById('batch-hrs-week'),
    microHrsWeek:     document.getElementById('micro-hrs-week'),
    batchHrsMonth:    document.getElementById('batch-hrs-month'),
    microHrsMonth:    document.getElementById('micro-hrs-month'),
    batchHrsYear:     document.getElementById('batch-hrs-year'),
    microHrsYear:     document.getElementById('micro-hrs-year'),
    hoursSaved:       document.getElementById('hours-saved'),
    daysSaved:        document.getElementById('days-saved'),
    insight:          document.getElementById('obs-insight'),
  };

  const update = () => {
    const students    = +inputs.students.value;
    const goals       = +inputs.goalsPerStu.value;
    const obsPerGoal  = +inputs.obsPerGoal.value;
    const batchMin    = +inputs.batchTime.value;
    const microMin    = +inputs.microTime.value;

    // Labels
    outputs.studentsLabel.textContent   = `${students} students`;
    outputs.goalsLabel.textContent      = `${goals} goals`;
    outputs.obsPerGoalLabel.textContent = `${obsPerGoal} observations`;
    outputs.batchTimeLabel.textContent  = `${batchMin} min`;
    outputs.microTimeLabel.textContent  = `${microMin} min`;

    // Core math
    const totalObsWeek  = students * goals * obsPerGoal;
    const batchHrsWeek  = (totalObsWeek * batchMin) / 60;
    const microHrsWeek  = (totalObsWeek * microMin) / 60;

    const batchHrsMonth = batchHrsWeek * 4;
    const microHrsMonth = microHrsWeek * 4;

    // School year ≈ 36 weeks
    const batchHrsYear  = batchHrsWeek * 36;
    const microHrsYear  = microHrsWeek * 36;

    const savedYear     = batchHrsYear - microHrsYear;
    // Assume 7.5-hour working day
    const savedDays     = savedYear / 7.5;

    animateValue(outputs.totalObs,      `${totalObsWeek}`);
    animateValue(outputs.batchHrsWeek,  fmtHrsFull(batchHrsWeek));
    animateValue(outputs.microHrsWeek,  fmtHrsFull(microHrsWeek));
    animateValue(outputs.batchHrsMonth, fmtHrsFull(batchHrsMonth));
    animateValue(outputs.microHrsMonth, fmtHrsFull(microHrsMonth));
    animateValue(outputs.batchHrsYear,  `${Math.round(batchHrsYear)} hrs`);
    animateValue(outputs.microHrsYear,  `${Math.round(microHrsYear)} hrs`);
    animateValue(outputs.hoursSaved,    `${Math.round(savedYear)} hours / year`);

    outputs.daysSaved.textContent =
      `That's roughly ${savedDays.toFixed(1)} full working days returned to teaching.`;

    // Contextual insight
    let insight = '';
    const pct = batchHrsWeek > 0
      ? Math.round((1 - microHrsWeek / batchHrsWeek) * 100)
      : 0;

    if (savedYear < 20)
      insight = `A ${pct}% reduction in documentation time. Small in absolute terms, but it compounds: the observations actually happen when the cost is low.`;
    else if (savedYear < 80)
      insight = `${Math.round(savedYear)} hours recovered — time that used to be stolen from evenings and weekends and applied to paperwork instead of students.`;
    else
      insight = `${Math.round(savedYear)} hours. The difference between documentation being done during natural teaching moments versus it simply not being done at all.`;

    outputs.insight.textContent = insight;
  };

  Object.values(inputs).forEach(input => {
    input.addEventListener('input', update);
  });

  update(); // Initialize
};

/* ============================================================
   CALCULATOR 3 — PREP OVERHEAD
   ============================================================ */
const initPrepCalc = () => {
  const inputs = {
    topics:        document.getElementById('topics'),
    batchPrepHrs:  document.getElementById('batch-prep-hrs'),
    batchRefresh:  document.getElementById('batch-refresh'),
    microPerTopic: document.getElementById('micro-per-topic'),
    microCreateHrs:document.getElementById('micro-create-hrs'),
    libraryShare:  document.getElementById('library-share'),
    microRefresh:  document.getElementById('micro-refresh'),
  };
  const outputs = {
    topicsOut:        document.getElementById('topics-out'),
    batchPrepHrsOut:  document.getElementById('batch-prep-hrs-out'),
    batchRefreshOut:  document.getElementById('batch-refresh-out'),
    microPerTopicOut: document.getElementById('micro-per-topic-out'),
    microCreateHrsOut:document.getElementById('micro-create-hrs-out'),
    libraryShareOut:  document.getElementById('library-share-out'),
    microRefreshOut:  document.getElementById('micro-refresh-out'),
    batchTotal:       document.getElementById('prep-batch-total'),
    microTotal:       document.getElementById('prep-micro-total'),
    batchScratch:     document.getElementById('prep-batch-scratch'),
    microScratch:     document.getElementById('prep-micro-scratch'),
    batchShared:      document.getElementById('prep-batch-shared'),
    microShared:      document.getElementById('prep-micro-shared'),
    breakEven:        document.getElementById('prep-breakeven'),
    breakEvenSub:     document.getElementById('prep-breakeven-sub'),
    verdictLabel:     document.getElementById('prep-verdict-label'),
    delta:            document.getElementById('prep-delta'),
    deltaSub:         document.getElementById('prep-delta-sub'),
    insight:          document.getElementById('prep-insight'),
    microTotalCell:   document.getElementById('prep-micro-total'),
    savingsBlock:     document.getElementById('prep-savings-block'),
  };

  let activeYear = 1;

  // Year toggle buttons
  document.querySelectorAll('.prep-year-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.prep-year-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeYear = +btn.dataset.year;
      update();
    });
  });

  const update = () => {
    const topics        = +inputs.topics.value;
    const batchHrs      = +inputs.batchPrepHrs.value;
    const batchRefPct   = +inputs.batchRefresh.value / 100;
    const microPerTopic = +inputs.microPerTopic.value;
    const microHrs      = +inputs.microCreateHrs.value;
    const shareRate     = +inputs.libraryShare.value / 100;
    const microRefPct   = +inputs.microRefresh.value / 100;

    // Labels
    outputs.topicsOut.textContent        = `${topics} topics`;
    outputs.batchPrepHrsOut.textContent  = `${batchHrs} hrs`;
    outputs.batchRefreshOut.textContent  = `${+inputs.batchRefresh.value}%`;
    outputs.microPerTopicOut.textContent = `${microPerTopic} units`;
    outputs.microCreateHrsOut.textContent= `${microHrs} hrs`;
    outputs.libraryShareOut.textContent  = `${+inputs.libraryShare.value}%`;
    outputs.microRefreshOut.textContent  = `${+inputs.microRefresh.value}%`;

    const totalMicro = topics * microPerTopic; // total micro-units in course

    let batchTotal, batchScratch, batchShared;
    let microTotal, microScratch, microShared;

    if (activeYear === 1) {
      // YEAR 1 — build everything new (batch), some sourced from library (micro)
      batchScratch = topics * batchHrs;
      batchShared  = 0;  // batch year 1 — no sharing, just build it
      batchTotal   = batchScratch;

      microScratch = totalMicro * (1 - shareRate) * microHrs;
      microShared  = totalMicro * shareRate * microHrs; // time saved by using library
      microTotal   = microScratch; // actual cost (shared units are free to use)
    } else {
      // YEAR 2+ — batch refreshes a % of slides; micro refreshes a % of units
      // For refreshed micro-units, the teacher can still pull from the library
      batchScratch = topics * batchHrs * batchRefPct;
      batchShared  = topics * batchHrs * (1 - batchRefPct); // reused from last year
      batchTotal   = batchScratch;

      const refreshedUnits = totalMicro * microRefPct;
      microScratch = refreshedUnits * (1 - shareRate) * microHrs; // refreshed, built from scratch
      microShared  = refreshedUnits * shareRate * microHrs;       // refreshed, sourced from library
      microTotal   = microScratch;
    }

    // Break-even: at what library share rate does micro year-1 cost = batch year-1?
    // microScratch = totalMicro * (1 - breakEven) * microHrs = batchTotal
    // => (1 - breakEven) = batchTotal / (totalMicro * microHrs)
    // => breakEven = 1 - batchTotal / (totalMicro * microHrs)
    const batchY1 = topics * batchHrs;
    const denominator = totalMicro * microHrs;
    const beRate = denominator > 0
      ? Math.max(0, Math.min(100, (1 - batchY1 / denominator) * 100))
      : 0;

    animateValue(outputs.batchTotal,   `${batchTotal.toFixed(1)} hrs`);
    animateValue(outputs.microTotal,   `${microTotal.toFixed(1)} hrs`);
    animateValue(outputs.batchScratch, `${batchScratch.toFixed(1)} hrs`);
    animateValue(outputs.microScratch, `${microScratch.toFixed(1)} hrs`);
    animateValue(outputs.batchShared,  batchShared > 0 ? `${batchShared.toFixed(1)} hrs reused` : '—');
    animateValue(outputs.microShared,  microShared > 0 ? `${microShared.toFixed(1)} hrs saved` : '—');
    animateValue(outputs.breakEven,    beRate < 0
      ? 'Always cheaper'
      : beRate > 95
      ? 'Library unavailable'
      : `${beRate.toFixed(0)}% from library`);

    if (beRate <= 0) {
      outputs.breakEvenSub.textContent = 'Even with no library, micro-process prep is cheaper at these rates.';
    } else if (beRate > 90) {
      outputs.breakEvenSub.textContent = `At current rates, micro-process only becomes cheaper with a very mature (${beRate.toFixed(0)}%+) shared library.`;
    } else {
      outputs.breakEvenSub.textContent = `Source ${beRate.toFixed(0)}% of micro-units from a shared library and Year 1 prep costs equal batch. Above that — it's cheaper.`;
    }

    // Delta block: micro vs batch
    const delta = batchTotal - microTotal;
    const cheaper = delta > 0; // batch is more expensive (micro is cheaper)
    outputs.microTotalCell.className = `col-micro ${cheaper ? 'cheaper' : 'pricier'}`;

    const label = activeYear === 1
      ? (cheaper ? 'Micro-process saves (Year 1)' : 'Micro-process costs extra (Year 1)')
      : (cheaper ? 'Micro-process saves (Year 2+)' : 'Micro-process costs extra (Year 2+)');

    outputs.verdictLabel.textContent = label;
    animateValue(outputs.delta, `${Math.abs(delta).toFixed(1)} hrs`);
    outputs.deltaSub.textContent = cheaper
      ? `At ${+inputs.libraryShare.value}% library share, micro-process uses ${Math.abs(delta).toFixed(1)} fewer prep hours.`
      : `Source ${Math.max(0, beRate).toFixed(0)}%+ from a shared library to reach break-even.`;

    outputs.savingsBlock.style.borderColor = cheaper
      ? 'rgba(20,184,166,0.25)'
      : 'rgba(249,115,22,0.25)';
    outputs.savingsBlock.style.background = cheaper
      ? 'var(--save-dim)'
      : 'var(--burden-dim)';
    outputs.delta.style.color = cheaper ? 'var(--save)' : 'var(--burden)';

    // Contextual insight
    let insight = '';
    if (activeYear === 1 && !cheaper) {
      insight = `Year 1 is the transition year. Micro-process costs ${Math.abs(delta).toFixed(1)} extra hours — the price of moving from a batch library (publisher decks) to a micro library (still being built). This is a one-time investment, not an ongoing cost.`;
    } else if (activeYear === 1 && cheaper) {
      insight = `With ${+inputs.libraryShare.value}% of units sourced from a shared library, even Year 1 micro-process prep is cheaper than building batch lectures from scratch.`;
    } else if (activeYear === 2 && cheaper) {
      insight = `Year 2+ and the library is earning its keep. ${Math.abs(delta).toFixed(1)} hours saved versus refreshing batch slides — and the micro-units are more precise learning interactions, not slides.`;
    } else {
      insight = `Year 2+ micro-process prep is still higher than batch refresh at current settings. Increase the library share rate or reduce per-unit creation time to close the gap.`;
    }
    outputs.insight.textContent = insight;
  };

  Object.values(inputs).forEach(input => {
    input.addEventListener('input', update);
  });

  update();
};

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAsymmetryCalc();
  initObservationCalc();
  initPrepCalc();
});
