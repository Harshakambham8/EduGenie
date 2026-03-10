// EduGenie frontend interactions (Vanilla JS)
// Responsible for view switching, form handling, calling backend APIs,
// rendering results, and quiz interactions.

// Utility helpers -------------------------------------------------------
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function setLoading(el, isLoading) {
  if (!el) return;
  if (isLoading) {
    el.dataset.loading = 'true';
    const spinner = document.createElement('div');
    spinner.className = 'loading';
    spinner.textContent = 'Loading...';
    el.innerHTML = '';
    el.appendChild(spinner);
  } else {
    delete el.dataset.loading;
  }
}

function showMessage(container, text, type = 'info') {
  container.innerHTML = '';
  const p = document.createElement('div');
  p.textContent = text;
  p.className = type === 'error' ? 'error' : (type === 'success' ? 'success' : '');
  container.appendChild(p);
}

// Escape user-provided or AI text to avoid raw HTML insertion
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Format AI response text into safe HTML:
// - **bold** -> <strong>
// - double newlines -> paragraphs
// - single newline -> <br>
function formatResponse(text) {
  if (!text && text !== '') return '';
  // Work with string
  let s = String(text);

  // Remove LaTeX dollar markers
  s = s.replace(/\$/g, '');

  // Convert simple \frac{a}{b} to a/b (handles many common cases)
  // Run multiple times to handle repeated occurrences
  s = s.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2');

  // Escape before injecting HTML
  s = escapeHtml(s);

  // Bold **text** -> <strong>
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Split into paragraphs by double newlines
  const parts = s.split(/\n\n+/);
  const htmlParts = parts.map(p => p.replace(/\n/g, '<br>'));
  return htmlParts.map(p => `<p>${p}</p>`).join('');
}

// Loading animation with dots
function startLoading(container, message = '🧠 Generating response') {
  if (!container) return;
  container.innerHTML = '';
  const span = document.createElement('span');
  span.className = 'loading';
  span.textContent = message;
  const dots = document.createElement('span');
  dots.className = 'dots';
  dots.textContent = '';
  span.appendChild(dots);
  container.appendChild(span);

  let i = 0;
  const id = setInterval(() => {
    i = (i + 1) % 4;
    dots.textContent = '.'.repeat(i);
  }, 400);
  container._loadingId = id;
}

function stopLoading(container) {
  if (!container) return;
  if (container._loadingId) {
    clearInterval(container._loadingId);
    delete container._loadingId;
  }
}

function fadeIn(el) {
  if (!el) return;
  // Prefer CSS-driven animation classes
  el.classList.remove('fade-in', 'slide-up');
  // small timeout to ensure reflow
  requestAnimationFrame(() => {
    el.classList.add('fade-in', 'slide-up');
  });
}

function disableElement(el, disabled = true) {
  if (!el) return;
  el.disabled = disabled;
  if (disabled) el.setAttribute('aria-disabled', 'true'); else el.removeAttribute('aria-disabled');
}

// View management -------------------------------------------------------
function activateNav(button) {
  qsa('.nav-btn').forEach(b => b.classList.remove('active'));
  qsa('.nav-btn').forEach(b => b.removeAttribute('aria-current'));
  button.classList.add('active');
  button.setAttribute('aria-current', 'page');
}

function showView(name) {
  qsa('.view').forEach(v => v.classList.add('hidden'));
  const view = qs(`#view-${name}`);
  if (view) view.classList.remove('hidden');
  const title = qs('#main-title');
  if (title) title.textContent = {
    ask: 'Ask Question',
    explain: 'Explain Concept',
    quiz: 'Generate Quiz',
    summarize: 'Summarize',
    solve: 'Step-by-Step Solve'
  }[name] || 'EduGenie';
}

// Theme management ----------------------------------------------------
function applyTheme(theme) {
  const body = document.body;
  if (theme === 'dark') body.classList.add('dark'); else body.classList.remove('dark');
  // update toggle UI if present
  const toggle = qs('#theme-toggle');
  if (toggle) toggle.checked = (theme === 'dark');
  // smooth transition experience
  document.documentElement.style.transition = 'background .32s ease, color .32s ease';
}

function setTheme(theme) {
  applyTheme(theme);
  try { localStorage.setItem('edugenie_theme', theme); } catch (e) {}
}

function toggleTheme() {
  const cur = document.body.classList.contains('dark') ? 'dark' : 'light';
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

// API helpers -----------------------------------------------------------
async function postJSON(path, payload) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text();
    // Return a standardized error shape
    return { success: false, error: `Network error: ${res.status} ${txt}` };
  }

  try {
    const data = await res.json();
    return data;
  } catch (e) {
    return { success: false, error: 'Invalid JSON response from server.' };
  }
}

// Event wiring ----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  qsa('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activateNav(btn);
      showView(btn.dataset.view);
      // subtle fade on view switch
      const view = qs(`#view-${btn.dataset.view}`);
      if (view) fadeIn(view);
    });
  });

  // Theme toggle wiring
  const savedTheme = (function(){ try { return localStorage.getItem('edugenie_theme'); } catch(e){ return null } })() || 'light';
  applyTheme(savedTheme);
  const themeToggle = qs('#theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('change', (ev) => {
      setTheme(ev.target.checked ? 'dark' : 'light');
    });
  }

  // Ask form
  const formAsk = qs('#form-ask');
  const resultAsk = qs('#result-ask');
    formAsk.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const question = formAsk.question.value.trim();
      if (!question) return showMessage(resultAsk, 'Question is required.', 'error');

      // Disable button to prevent spam
      const btnAsk = qs('#btn-ask');
      disableElement(btnAsk, true);
      startLoading(resultAsk, '🧠 Generating response');
      try {
        const res = await postJSON('/api/ask', { question });
        stopLoading(resultAsk);
        if (!res || res.success === false) {
          resultAsk.innerHTML = `<div class='error'>${escapeHtml((res && res.error) || 'Unknown error')}</div>`;
        } else {
          resultAsk.innerHTML = formatResponse(res.data);
          fadeIn(resultAsk);
        }
      } catch (err) {
        stopLoading(resultAsk);
        resultAsk.innerHTML = `<div class='error'>${escapeHtml(err.message || 'Unexpected error')}</div>`;
      } finally {
        disableElement(btnAsk, false);
      }
    });

  // Explain form
  const formExplain = qs('#form-explain');
  const resultExplain = qs('#result-explain');
  formExplain.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const topic = formExplain.topic.value.trim();
    const level = formExplain.level.value;
    if (!topic) return showMessage(resultExplain, 'Topic is required.', 'error');

    const btnExplain = qs('#btn-explain');
    disableElement(btnExplain, true);
    startLoading(resultExplain, '🧠 Generating response');
    try {
      const res = await postJSON('/api/explain', { topic, level });
      stopLoading(resultExplain);
      if (!res || res.success === false) {
        resultExplain.innerHTML = `<div class='error'>${escapeHtml((res && res.error) || 'Unknown error')}</div>`;
      } else {
        resultExplain.innerHTML = formatResponse(res.data);
        fadeIn(resultExplain);
      }
    } catch (err) {
      stopLoading(resultExplain);
      resultExplain.innerHTML = `<div class='error'>${escapeHtml(err.message || 'Unexpected error')}</div>`;
    } finally {
      disableElement(btnExplain, false);
    }
  });

  // Summarize form
  const formSumm = qs('#form-summarize');
  const resultSumm = qs('#result-summarize');
  formSumm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const text = formSumm.text.value.trim();
    if (!text) return showMessage(resultSumm, 'Text is required.', 'error');

    const btnSumm = qs('#btn-summarize');
    disableElement(btnSumm, true);
    startLoading(resultSumm, '🧠 Generating response');
    try {
      const res = await postJSON('/api/summarize', { text });
      stopLoading(resultSumm);
      if (!res || res.success === false) {
        resultSumm.innerHTML = `<div class='error'>${escapeHtml((res && res.error) || 'Unknown error')}</div>`;
      } else {
        resultSumm.innerHTML = formatResponse(res.data);
        fadeIn(resultSumm);
      }
    } catch (err) {
      stopLoading(resultSumm);
      resultSumm.innerHTML = `<div class='error'>${escapeHtml(err.message || 'Unexpected error')}</div>`;
    } finally {
      disableElement(btnSumm, false);
    }
  });

  // Solve form
  const formSolve = qs('#form-solve');
  const resultSolve = qs('#result-solve');
  formSolve.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const problem = formSolve.problem.value.trim();
    if (!problem) return showMessage(resultSolve, 'Problem is required.', 'error');

    const btnSolve = qs('#btn-solve');
    disableElement(btnSolve, true);
    startLoading(resultSolve, '🧠 Generating response');
    try {
      const res = await postJSON('/api/solve', { problem });
      stopLoading(resultSolve);
      if (!res || res.success === false) {
        resultSolve.innerHTML = `<div class='error'>${escapeHtml((res && res.error) || 'Unknown error')}</div>`;
      } else {
        resultSolve.innerHTML = formatResponse(res.data);
        fadeIn(resultSolve);
      }
    } catch (err) {
      stopLoading(resultSolve);
      resultSolve.innerHTML = `<div class='error'>${escapeHtml(err.message || 'Unexpected error')}</div>`;
    } finally {
      disableElement(btnSolve, false);
    }
  });

  // Quiz form & rendering
  const formQuiz = qs('#form-quiz');
  const quizContainer = qs('#quiz-container');
  let currentQuiz = null;

  formQuiz.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const topic = formQuiz.topic.value.trim();
    const difficulty = formQuiz.difficulty.value;
    let num_questions = parseInt(formQuiz.num_questions.value, 10) || 0;

    if (!topic) return showMessage(quizContainer, 'Topic is required.', 'error');
    if (num_questions <= 0) return showMessage(quizContainer, 'Number of questions must be >= 1.', 'error');
    // Disable quiz button while generating
    const btnQuiz = qs('#btn-quiz');
    disableElement(btnQuiz, true);
    startLoading(quizContainer, '🧠 Generating response');
    try {
      const res = await postJSON('/api/quiz', { topic, difficulty, num_questions });
      stopLoading(quizContainer);
      if (!res || res.success === false) {
        quizContainer.innerHTML = `<div class='error'>${escapeHtml((res && res.error) || 'Unknown error')}</div>`;
      } else {
        renderQuiz(res.data);
        fadeIn(quizContainer);
      }
    } catch (err) {
      stopLoading(quizContainer);
      quizContainer.innerHTML = `<div class='error'>${escapeHtml(err.message || 'Unexpected error')}</div>`;
    } finally {
      disableElement(btnQuiz, false);
    }
  });

  function renderQuiz(quizData) {
    // Expecting { questions: [ { question, options, answer } ] }
    quizContainer.innerHTML = '';
    if (!quizData || !Array.isArray(quizData.questions)) {
      return showMessage(quizContainer, 'Invalid quiz data returned.', 'error');
    }

    // store quiz globally for grading and inspection
    window.currentQuiz = quizData.questions;
    currentQuiz = window.currentQuiz;

    const form = document.createElement('form');
    form.className = 'quiz-form';

    currentQuiz.forEach((q, idx) => {
      const qcard = document.createElement('div');
      qcard.className = 'quiz-question';
      const qtitle = document.createElement('div');
      qtitle.textContent = `${idx + 1}. ${q.question}`;
      qcard.appendChild(qtitle);

      const opts = document.createElement('div');
      opts.className = 'options';
      (q.options || []).forEach((opt, i) => {
        const label = document.createElement('label');
        label.className = 'option-label';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q-${idx}`;
        radio.value = String.fromCharCode(65 + i); // 'A', 'B', ...
        label.appendChild(radio);
        const span = document.createElement('span');
        span.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
        label.appendChild(span);
        opts.appendChild(label);
      });

      qcard.appendChild(opts);
      form.appendChild(qcard);
    });

    const submit = document.createElement('button');
    submit.type = 'button';
    submit.className = 'btn';
    submit.textContent = 'Submit Quiz';
    submit.addEventListener('click', (ev) => {
      ev.preventDefault();
      // disable submit to avoid double grading
      disableElement(submit, true);
      gradeQuiz(form, submit);
    });

    form.appendChild(submit);
    quizContainer.appendChild(form);
  }

  function gradeQuiz(form, submitButton) {
    if (!currentQuiz) return;
    let correct = 0;
    const total = currentQuiz.length;

    // Build detailed results
    const report = document.createElement('div');
    report.className = 'card';
    const header = document.createElement('h3');
    header.textContent = 'Quiz Complete';
    report.appendChild(header);

    const list = document.createElement('div');

    currentQuiz.forEach((q, idx) => {
      const qwrap = document.createElement('div');
      qwrap.className = 'quiz-question';

      const qtitle = document.createElement('div');
      qtitle.innerHTML = `<strong>${idx + 1}. ${escapeHtml(q.question)}</strong>`;
      qwrap.appendChild(qtitle);

      const selected = form.querySelector(`input[name="q-${idx}"]:checked`);
      const choice = selected ? selected.value : null;
      const correctAns = q.answer ? q.answer.toUpperCase() : null;

      // Options with coloring for selected
      const optsWrap = document.createElement('div');
      optsWrap.className = 'options';
      (q.options || []).forEach((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        const optDiv = document.createElement('div');
        optDiv.className = 'option-label';
        const span = document.createElement('span');
        span.innerHTML = `${letter}. ${escapeHtml(opt)}`;

        if (choice === letter) {
          // color selected answer green if correct, red if not
          if (correctAns && letter === correctAns) {
            span.className = 'success';
            correct += 1;
          } else {
            span.className = 'error';
          }
        }

        // Mark correct answer visually (if not selected)
        if (correctAns && letter === correctAns && choice !== letter) {
          const badge = document.createElement('small');
          badge.style.marginLeft = '8px';
          badge.style.color = '#065f46';
          badge.textContent = '(correct)';
          span.appendChild(badge);
        }

        optDiv.appendChild(span);
        optsWrap.appendChild(optDiv);
      });

      // Show what the user selected and the correct answer explicitly
      const summary = document.createElement('div');
      summary.style.marginTop = '8px';
      summary.innerHTML = `<em>Selected:</em> ${escapeHtml(choice || 'None')} &nbsp; <em>Correct:</em> ${escapeHtml(correctAns || 'N/A')}`;

      qwrap.appendChild(optsWrap);
      qwrap.appendChild(summary);
      list.appendChild(qwrap);
    });

    const score = document.createElement('div');
    score.className = 'result';
    score.innerHTML = `<p class="success">Your Score: ${correct} / ${total}</p>`;

    report.appendChild(list);
    report.appendChild(score);
    // Performance message
    const pct = Math.round((correct / total) * 100);
    const perf = document.createElement('div');
    perf.className = 'result';
    let msg = '';
    if (pct >= 80) msg = '🎉 Excellent understanding!';
    else if (pct >= 50) msg = '👍 Good effort!';
    else msg = '📘 Review recommended.';
    const perfNode = document.createElement('p');
    perfNode.textContent = msg;
    report.appendChild(perf);
    report.appendChild(perfNode);

    // Disable all radios in the original form to prevent changes
    form.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);

    quizContainer.innerHTML = '';
    quizContainer.appendChild(report);
    fadeIn(report);
    // Smooth scroll to results
    try { report.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}

    // re-enable submit button if provided
    if (submitButton) disableElement(submitButton, false);
  }

  // Initialize default view
  showView('ask');

  // Copy & Clear button wiring for all views
  const wireCopyClear = () => {
    const mappings = [
      { copy: '#copy-ask', clearForm: '#clear-ask', clearResult: '#clear-ask-result', form: '#form-ask', result: '#result-ask' },
      { copy: '#copy-explain', clearForm: '#clear-explain', clearResult: '#clear-explain-result', form: '#form-explain', result: '#result-explain' },
      { copy: '#copy-quiz', clearForm: '#clear-quiz', clearResult: '#clear-quiz-result', form: '#form-quiz', result: '#quiz-container' },
      { copy: '#copy-summarize', clearForm: '#clear-summarize', clearResult: '#clear-summarize-result', form: '#form-summarize', result: '#result-summarize' },
      { copy: '#copy-solve', clearForm: '#clear-solve', clearResult: '#clear-solve-result', form: '#form-solve', result: '#result-solve' }
    ];

    mappings.forEach(m => {
      const copyBtn = qs(m.copy);
      const clearFormBtn = qs(m.clearForm);
      const clearResultBtn = qs(m.clearResult);
      const formEl = qs(m.form);
      const resultEl = qs(m.result);

      if (copyBtn && resultEl) {
        copyBtn.addEventListener('click', () => {
          const text = resultEl.innerText || '';
          if (!text) return;
          navigator.clipboard?.writeText(text).catch(() => {});
        });
      }

      if (clearFormBtn && formEl) {
        clearFormBtn.addEventListener('click', () => {
          formEl.reset();
        });
      }

      if (clearResultBtn && resultEl) {
        clearResultBtn.addEventListener('click', () => {
          resultEl.innerHTML = '';
        });
      }
    });
  };

  wireCopyClear();
});

