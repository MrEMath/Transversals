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
    if (!name) {
      studentSummaryEl.innerHTML = "";
      studentItemBody.innerHTML = "";
      return;
    }
    renderStudentDetail(name, studentSummaryEl, studentItemBody);
  });
});


function renderStudentDetail(studentName, studentSummaryEl, studentItemBody) {
  const records = allRecords.filter(r =>
    r.teacher === currentTeacher && r.studentName === studentName
  );

  if (!records.length) {
    studentSummaryEl.textContent = "No data for this student.";
    studentItemBody.innerHTML = "";
    return;
  }

  const attemptsTotal = records.reduce((sum, r) => sum + (r.attempts || 1), 0);
  const correct = records.filter(r => r.correct).length;
  const percentCorrect = Math.round((correct / records.length) * 100);

  studentSummaryEl.innerHTML = `
    <p>Student: <strong>${studentName}</strong></p>
    <p>Items attempted: <strong>${records.length}</strong></p>
    <p>Total attempts: <strong>${attemptsTotal}</strong></p>
    <p>% correct: <strong>${percentCorrect}%</strong></p>
  `;

  studentItemBody.innerHTML = "";
  records
    .sort((a, b) => a.questionId - b.questionId)
    .forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.questionId}</td>
        <td>${r.sbg}</td>
        <td>${r.attempts || 1}</td>
        <td>${r.correct ? "✔" : "✘"}</td>
      `;
      studentItemBody.appendChild(tr);
    });
}
