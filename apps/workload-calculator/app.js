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
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAsymmetryCalc();
  initObservationCalc();
});
