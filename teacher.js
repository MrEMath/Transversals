const TEACHER_PASSWORDS = {
  Englade: "englade2026",
  Russell: "russell2026",
  Miller: "miller2026",
  Massengill: "massengill2026",
  Clark: "clark2026"
};

let currentTeacher = null;
let allRecords = [];

function loadData() {
  const raw = localStorage.getItem("reflectionPracticeResults");
  allRecords = raw ? JSON.parse(raw) : [];
}

document.addEventListener("DOMContentLoaded", () => {
  const teacherNameEl = document.getElementById("teacher-name");
  const teacherPasswordEl = document.getElementById("teacher-password");
  const teacherLoginBtn = document.getElementById("teacher-login-btn");
  const teacherLoginError = document.getElementById("teacher-login-error");

  const loginSection = document.getElementById("teacher-login");
  const dashboardSection = document.getElementById("teacher-dashboard");
  const overallStatsEl = document.getElementById("overall-stats");
  const itemAnalysisBody = document.querySelector("#item-analysis-table tbody");
  const studentSelect = document.getElementById("student-select");
  const studentSummaryEl = document.getElementById("student-summary");
  const studentItemBody = document.querySelector("#student-item-table tbody");
  const attemptSelect = document.getElementById("attempt-select");

  loadData();

  teacherLoginBtn.addEventListener("click", () => {
    const name = teacherNameEl.value;
    const pwd = teacherPasswordEl.value.trim();

    if (!name || !pwd) {
      teacherLoginError.textContent = "Select your name and enter password.";
      return;
    }

    if (TEACHER_PASSWORDS[name] !== pwd) {
      teacherLoginError.textContent = "Incorrect password.";
      return;
    }

    teacherLoginError.textContent = "";
    currentTeacher = name;

    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    document.getElementById("dashboard-title").textContent =
      `Teacher Dashboard – ${name}`;

    renderDashboard(
      overallStatsEl,
      itemAnalysisBody,
      studentSelect,
      studentSummaryEl,
      studentItemBody
    );
  });

  studentSelect.addEventListener("change", () => {
    const name = studentSelect.value;
    studentSummaryEl.innerHTML = "";
    studentItemBody.innerHTML = "";
    attemptSelect.innerHTML = '<option value="">Select an attempt</option>';

    if (!name) return;

    renderStudentSummaryAndAttempts(
      name,
      studentSummaryEl,
      attemptSelect
    );
  });

  attemptSelect.addEventListener("change", () => {
    const attemptId = attemptSelect.value;
    const studentName = attemptSelect._studentName;
    if (!attemptId || !studentName) {
      studentItemBody.innerHTML = "";
      return;
    }
    renderStudentAttemptItems(studentName, attemptId, studentItemBody);
  });
});

// ---------- DASHBOARD FUNCTIONS ----------

function renderDashboard(
  overallStatsEl,
  itemAnalysisBody,
  studentSelect,
  studentSummaryEl,
  studentItemBody
) {
  const teacherRecords = allRecords.filter(r => r.teacher === currentTeacher);

  const latestByStudentQuestion = buildLatestByStudentQuestion(teacherRecords);
  buildSbgQuestionCards(teacherRecords, latestByStudentQuestion);

  const studentNames = [...new Set(teacherRecords.map(r => r.studentName))];
  const attemptIds = [...new Set(teacherRecords.map(r => r.timestamp))];
  const correctCount = teacherRecords.filter(r => r.correct).length;
  const percentCorrect = teacherRecords.length
    ? Math.round((correctCount / teacherRecords.length) * 100)
    : 0;

  // build per-student current SBG
  const byStudent = {};
  teacherRecords.forEach(r => {
    if (!byStudent[r.studentName]) byStudent[r.studentName] = [];
    byStudent[r.studentName].push(r);
  });

  const sbgCounts = {};
  Object.keys(byStudent).forEach(name => {
    const level = computeStudentCurrentSbg(byStudent[name]);
    const key = level.toString();
    if (!sbgCounts[key]) sbgCounts[key] = 0;
    sbgCounts[key]++;
  });

  // Build bands for doughnut
  const bands = {
    '0.0–0.5': 0,
    '1.0–1.5': 0,
    '2.0–2.5': 0,
    '3.0': 0
  };

  Object.entries(sbgCounts).forEach(([levelStr, count]) => {
    const level = parseFloat(levelStr);
    if (level <= 0.5) bands['0.0–0.5'] += count;
    else if (level <= 1.5) bands['1.0–1.5'] += count;
    else if (level <= 2.5) bands['2.0–2.5'] += count;
    else bands['3.0'] += count;
  });

  renderSbgDoughnut(bands);

  // SBG summary bar
  const sbgSummaryEl = document.getElementById("sbg-summary");
  let sbgHtml = "";
  Object.keys(sbgCounts)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(key => {
      const count = sbgCounts[key];
      const totalStudents = Object.keys(byStudent).length || 1;
      const pct = Math.round((count / totalStudents) * 100);
      sbgHtml += `
        <div class="sbg-row">
          <span class="sbg-label">Level ${key}</span>
          <div class="sbg-bar">
            <div class="sbg-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="sbg-percent">${pct}%</span>
        </div>
      `;
    });
  sbgSummaryEl.innerHTML = sbgHtml;

  // students by SBG
  const sbgStudents = {};
  Object.keys(byStudent).forEach(name => {
    const level = computeStudentCurrentSbg(byStudent[name]);
    const key = level.toString();
    if (!sbgStudents[key]) sbgStudents[key] = [];
    sbgStudents[key].push({ name, level });
  });

  const bandsEl = document.getElementById("sbg-student-bands");
  if (bandsEl) {
    let bandsHtml = "";
    Object.keys(sbgStudents)
      .sort((a, b) => Number(a) - Number(b))
      .forEach(key => {
        const students = sbgStudents[key].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        bandsHtml += `
          <div class="sbg-band">
            <div class="sbg-band-header">
              <span>Level ${key}</span>
              <span>${students.length} students</span>
            </div>
            <div class="sbg-chip-row">
              ${students
                .map(
                  s => `<span class="sbg-chip">${s.name} – ${s.level}</span>`
                )
                .join("")}
            </div>
          </div>
        `;
      });
    bandsEl.innerHTML = bandsHtml;
  }

  overallStatsEl.innerHTML = `
    <p>Students: <strong>${studentNames.length}</strong></p>
    <p>Total practice attempts: <strong>${attemptIds.length}</strong></p>
    <p>Average accuracy (all items): <strong>${percentCorrect}%</strong></p>
  `;

  renderItemAnalysis(teacherRecords, itemAnalysisBody);
  populateStudentDropdown(studentNames, studentSelect);
  studentSummaryEl.innerHTML = "";
  studentItemBody.innerHTML = "";
}

let sbgDoughnutChart = null;

let sbgDoughnutChart = null;

function renderSbgDoughnut(bands) {
  const ctx = document.getElementById("sbg-doughnut");
  if (!ctx) return;

  const labels = ['SBG 0.0–0.5', 'SBG 1.0–1.5', 'SBG 2.0–2.5', 'SBG 3.0'];
  const data = [
    bands['0.0–0.5'],
    bands['1.0–1.5'],
    bands['2.0–2.5'],
    bands['3.0']
  ];
  const colors = ['#F04923', '#FFBF00', '#00A86B', '#0067A5'];

  const total = data.reduce((sum, v) => sum + v, 0) || 1;

  if (sbgDoughnutChart) {
    sbgDoughnutChart.data.datasets[0].data = data;
    sbgDoughnutChart.update();
    return;
  }

  sbgDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          align: 'center',              // center legend block
          labels: {
            textAlign: 'left',          // left-align each row
            color: '#3d2c2c',
            generateLabels(chart) {
              const ds = chart.data.datasets[0];
              const values = ds.data;
              const totalLocal = values.reduce((s, v) => s + v, 0) || 1;
              return chart.data.labels.map((label, i) => {
                const value = values[i] || 0;
                const pct = ((value / totalLocal) * 100).toFixed(0) + '%';
                return {
                  text: `${label} – ${pct}`,
                  fillStyle: ds.backgroundColor[i],
                  strokeStyle: '#ffffff',
                  lineWidth: 2,
                  hidden: isNaN(value) || value === 0,
                  index: i
                };
              });
            }
          }
        },
        datalabels: {
          color: '#ffffff',
          font: { weight: 'bold' },
          formatter(value, context) {
            const dataset = context.dataset.data;
            const sum = dataset.reduce((a, b) => a + b, 0) || 1;
            const pct = (value / sum) * 100;
            return value ? `${pct.toFixed(0)}%` : '';
          }
        }
      },
      cutout: '60%'
    },
    plugins: [ChartDataLabels]
  });
}

function buildSbgQuestionCards(teacherRecords, latestByStudentQuestion) {
  const container = document.getElementById("sbg-question-cards");
  container.innerHTML = "";

  const sbgGroups = {};

  teacherRecords.forEach(r => {
    const sbgKey = r.sbg.toString();
    const qid = r.questionId;

    if (!sbgGroups[sbgKey]) sbgGroups[sbgKey] = {};
    if (!sbgGroups[sbgKey][qid]) sbgGroups[sbgKey][qid] = [];
    sbgGroups[sbgKey][qid].push(r);
  });

  Object.keys(sbgGroups)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(sbgKey => {
      const questions = sbgGroups[sbgKey];
      const card = document.createElement("div");
      card.className = "sbg-card";

      let inner = `<div class="sbg-card-header">Level ${sbgKey}</div>`;
      inner += `<div class="sbg-card-questions">`;

      Object.keys(questions)
        .sort((a, b) => Number(a) - Number(b))
        .forEach(qid => {
          const qRecords = questions[qid];

          const correct = qRecords.filter(r => r.correct).length;
          const total = qRecords.length;
          const pct = total ? Math.round((correct / total) * 100) : 0;

          const byStudent = {};
          qRecords.forEach(r => {
            const key = `${r.studentName}|${r.questionId}`;
            const latest = latestByStudentQuestion[key];
            if (!latest) return;
            if (!byStudent[latest.studentName]) {
              byStudent[latest.studentName] = latest;
            }
          });

          const students = Object.values(byStudent).sort((a, b) =>
            a.studentName.localeCompare(b.studentName)
          );

          inner += `
            <div class="sbg-question-tile">
              <div class="sbg-question-header">
                <span>Q${qid}</span>
                <span>${pct}% correct</span>
              </div>
              <div class="sbg-question-students">
                ${students
                  .map(
                    r =>
                      `<div class="sbg-question-student">${r.studentName} – ${
                        r.correct ? "✔" : "✘"
                      }</div>`
                  )
                  .join("")}
              </div>
            </div>
          `;
        });

      inner += `</div>`;
      card.innerHTML = inner;
      container.appendChild(card);
    });
}

function renderItemAnalysis(records, itemAnalysisBody) {
  itemAnalysisBody.innerHTML = "";

  const byQuestion = {};
  records.forEach(r => {
    const qid = r.questionId;
    if (!byQuestion[qid]) byQuestion[qid] = [];
    byQuestion[qid].push(r);
  });

  Object.keys(byQuestion)
    .sort((a, b) => a - b)
    .forEach(qid => {
      const group = byQuestion[qid];
      const correct = group.filter(r => r.correct).length;
      const total = group.length;
      const percent = total ? Math.round((correct / total) * 100) : 0;
      const sbgLevel = group[0].sbg;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${qid}</td>
        <td>${sbgLevel}</td>
        <td>${percent}%</td>
      `;
      itemAnalysisBody.appendChild(tr);
    });
}

function populateStudentDropdown(studentNames, studentSelect) {
  studentSelect.innerHTML = '<option value="">Select a student</option>';
  studentNames.sort().forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    studentSelect.appendChild(opt);
  });
}

function buildLatestByStudentQuestion(teacherRecords) {
  const latest = {};

  teacherRecords.forEach(r => {
    const key = `${r.studentName}|${r.questionId}`;
    if (!latest[key]) {
      latest[key] = r;
    } else if (r.timestamp > latest[key].timestamp) {
      latest[key] = r;
    }
  });
  return latest;
}

// ---------- STUDENT DETAIL ----------

function renderStudentSummaryAndAttempts(studentName, studentSummaryEl, attemptSelect) {
  const records = allRecords.filter(r =>
    r.teacher === currentTeacher && r.studentName === studentName
  );
  if (!records.length) {
    studentSummaryEl.textContent = "No data for this student.";
    return;
  }

  const byAttempt = {};
  records.forEach(r => {
    const attemptId = r.timestamp;
    if (!byAttempt[attemptId]) byAttempt[attemptId] = [];
    byAttempt[attemptId].push(r);
  });

  const attemptIds = Object.keys(byAttempt).sort();
  const totalAttempts = attemptIds.length;

  const latestId = attemptIds[attemptIds.length - 1];
  const latest = byAttempt[latestId];
  const correctItems = latest.filter(r => r.correct);
  const currentSbgLevel =
    correctItems.length
      ? (
          correctItems.reduce((sum, r) => sum + (r.sbg || 0), 0) /
          correctItems.length
        ).toFixed(2)
      : "0.0";

  studentSummaryEl.innerHTML = `
    <p>Student: <strong>${studentName}</strong></p>
    <p>Practice attempts: <strong>${totalAttempts}</strong></p>
    <p>Current SBG level: <strong>${currentSbgLevel}</strong></p>
  `;

  attemptSelect.innerHTML = '<option value="">Select an attempt</option>';
  attemptIds.forEach(id => {
    const date = new Date(id);
    const label = date.toLocaleString();
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = label;
    attemptSelect.appendChild(opt);
  });

  attemptSelect._studentName = studentName;
}

function renderStudentAttemptItems(studentName, attemptId, studentItemBody) {
  const records = allRecords.filter(r =>
    r.teacher === currentTeacher &&
    r.studentName === studentName &&
    r.timestamp === attemptId
  );

  studentItemBody.innerHTML = "";
  records
    .sort((a, b) => a.questionId - b.questionId)
    .forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.questionId}</td>
        <td>${r.sbg}</td>
        <td>${r.correct ? "✔" : "✘"}</td>
      `;
      studentItemBody.appendChild(tr);
    });
}

function computeStudentCurrentSbg(recordsForStudent) {
  const byAttempt = {};
  recordsForStudent.forEach(r => {
    const attemptId = r.timestamp;
    if (!byAttempt[attemptId]) byAttempt[attemptId] = [];
    byAttempt[attemptId].push(r);
  });
  const attemptIds = Object.keys(byAttempt).sort();
  const latest = byAttempt[attemptIds[attemptIds.length - 1]];

  const correctItems = latest.filter(r => r.correct);
  if (!correctItems.length) return 0;

  const avgSbg =
    correctItems.reduce((sum, r) => sum + (r.sbg || 0), 0) /
    correctItems.length;

  return Number(avgSbg.toFixed(1));
}
