'use strict';

let questions = [];
let gradeData = null;
// Keep the chapter selector functional even if an optional metadata file is missing.
const defaultChapterNames = {
  9: 'Sample Distribution of X̄ and S′²: Normal Population',
  10: 'Asymptotic Theory',
  11: 'Estimation I',
  12: 'Estimation II',
  13: 'Estimation III',
  14: 'MLE, MM',
  15: 'Hypothesis Testing'
};
let chapterNames = {...defaultChapterNames};
let generatedIds = [];
const selectedChapters = new Set(); // Empty means all eligible, chapter-classified questions.

const el = id => document.getElementById(id);
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function typeset(node) {
  if (!window.MathJax) return;
  try { await window.MathJax.startup.promise; await window.MathJax.typesetPromise([node]); }
  catch (err) { console.warn('Math formatting warning', err); }
}

function chartSVG(values) {
  const W=560,H=430,L=72,T=28,R=28,B=68,w=W-L-R,h=H-T-B;
  const sx=x=>L+x/10*w, sy=y=>T+h-y/10*h;
  const grid=Array.from({length:11},(_,n)=>{
    const x=sx(n), y=sy(n);
    return `<line x1="${x}" x2="${x}" y1="${T}" y2="${T+h}" stroke="#e5eaf1"/><line x1="${L}" x2="${L+w}" y1="${y}" y2="${y}" stroke="#e5eaf1"/><text x="${x}" y="${T+h+19}" text-anchor="middle" font-size="11" fill="#63758b">${n}</text><text x="${L-12}" y="${y+4}" text-anchor="end" font-size="11" fill="#63758b">${n}</text>`;
  }).join('');
  const marks=values.coordinates.map(([x,y])=>`<circle cx="${sx(x)}" cy="${sy(y)}" r="4" fill="#1a5e9a" opacity=".66" stroke="white" stroke-width=".5"/>`).join('');
  const l=values.line;
  const slopeLine=`<line x1="${sx(2)}" y1="${sy(l.slope*2+l.intercept)}" x2="${sx(9)}" y2="${sy(l.slope*9+l.intercept)}" stroke="#f15d22" stroke-width="2.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Observed versus expected grades with regression line">${grid}<rect x="${L}" y="${T}" width="${w}" height="${h}" fill="none" stroke="#718497"/>${slopeLine}${marks}<text x="${L+w/2}" y="${H-17}" text-anchor="middle" font-size="14" fill="#273d54">Expected Grade</text><text x="18" y="${T+h/2}" text-anchor="middle" transform="rotate(-90 18 ${T+h/2})" font-size="14" fill="#273d54">Observed Grade</text></svg>`;
}

function makeCard(q, expanded=false, isExam=false, position=0) {
  const tags=q.chapters.map(n=>`<span class="tag" title="${escapeHtml(chapterNames[n]||'')}">Chapter ${n}</span>`).join('');
  const pointLabel=q.points_label ? `<span class="pill points">[${escapeHtml(q.points_label)}] points</span>` : '';
  const location=q.part ? `<span class="pill">Part ${q.part}</span>` : '';
  const printLabel = isExam ? `<div class="print-only print-question-heading"><div class="print-question-number">Question ${position+1}${q.points_label?` <span class="print-question-points">[${escapeHtml(q.points_label)} points]</span>`:''}</div><div class="print-question-source">Source: ${escapeHtml(q.year)} Final${q.part?`, Part ${escapeHtml(q.part)}`:''}, Q${escapeHtml(q.number)}</div></div>` : '';
  return `<article class="question-card" data-id="${escapeHtml(q.id)}">${printLabel}
    <div class="question-head"><div class="q-left"><div class="q-meta"><span class="pill year">${q.year} Final</span>${location}<span class="pill">Q${q.number}</span>${pointLabel}${isExam?`<span class="pill">Practice question ${position+1}</span>`:''}</div>
    <h3 class="q-title${/^Question\s+\d+$/i.test(q.title.trim())?' generic-question-title':''}">${escapeHtml(q.title)}</h3><div class="tags">${tags}</div></div>
    ${isExam?'':`<button type="button" class="button button-outline expand" aria-expanded="${expanded}">${expanded?'Hide question':'View question'}</button>`}</div>
    <div class="question-body" ${expanded?'':'hidden'}>${q.body}</div></article>`;
}

function prepareFigures(container) {
  // Figures can be added to /images later without changing the database.
  container.querySelectorAll('figure.source-figure').forEach(fig=>{
    const img=fig.querySelector('img');
    const missing=fig.querySelector('.image-missing');
    if (!img || !missing || img.dataset.checked==='true') return;
    img.dataset.checked='true';
    const onMissing=()=>{
      img.hidden=true;
      if (img.getAttribute('src')?.endsWith('/2016_q2.png') && gradeData) {
        const plot=document.createElement('div');
        plot.className='grade-plot';
        plot.innerHTML=chartSVG(gradeData);
        fig.appendChild(plot);
        missing.innerHTML='Recreated scatterplot from the provided data. To use the original figure, add <code>images/2016_q2.png</code>.';
      }
      missing.hidden=false;
    };
    img.addEventListener('error',onMissing,{once:true});
    // If loading failed before the listener was registered (e.g. cache hit).
    if (img.complete && !img.naturalWidth) onMissing();
  });
}

function filteredQuestions() {
  const query=el('query').value.toLowerCase().trim();
  const chapter=el('topic').value;
  const year=el('year').value;
  return questions.filter(q=>(!chapter||q.chapters.includes(Number(chapter))) &&
    (!year||String(q.year)===year) &&
    (!query||[q.title,q.id,String(q.year),...q.topics,q.body.replace(/<[^>]+>/g,' ')].join(' ').toLowerCase().includes(query)));
}

function updateYearPrintOption() {
  const year=el('year').value;
  const actions=el('year-print-actions');
  actions.hidden=!year;
  if(!year)return;
  const count=questions.filter(q=>String(q.year)===year).length;
  el('year-print-description').textContent=`${year} Final · ${count} questions · complete exam (all chapters and unclassified questions)`;
  el('print-year').textContent=`Print ${year} final`;
}

function eligibleRandomQuestions() {
  // Only chapter-classified questions are part of the random-exam pool.
  // Questions without a chapter remain available in the year-by-year archive.
  return questions.filter(q=>q.include_in_random &&
    Array.isArray(q.chapters) && q.chapters.length>0 &&
    (selectedChapters.size===0 || q.chapters.some(n=>selectedChapters.has(n))));
}

function updateChapterSelection() {
  el('chapters-all').classList.toggle('is-selected',selectedChapters.size===0);
  el('chapters-all').setAttribute('aria-pressed',String(selectedChapters.size===0));
  el('chapter-options').querySelectorAll('[data-chapter]').forEach(button=>{
    const active=selectedChapters.has(Number(button.dataset.chapter));
    button.classList.toggle('is-selected',active);
    button.setAttribute('aria-pressed',String(active));
  });
  const n=eligibleRandomQuestions().length;
  const status=el('chapter-pool-status');
  status.textContent= n<4 ? `${n} eligible question${n===1?'':'s'}. Select another chapter to reach four.` :
    `${n} eligible questions`;
  status.classList.toggle('warning',n<4);
  el('generate').disabled=n<4;
}

function buildChapterSelector() {
  const container = el('chapter-options');
  // Initial chapters are already in HTML. Insert only truly new chapters,
  // so a slow or cached script cannot leave the selector visually empty.
  Object.entries(chapterNames).sort((a,b)=>Number(a[0])-Number(b[0])).forEach(([n,name])=>{
    let button=container.querySelector(`[data-chapter="${n}"]`);
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='chapter-chip';
      button.dataset.chapter=n;
      button.textContent=`Chapter ${n}`;
      button.setAttribute('aria-pressed','false');
      container.appendChild(button);
    }
    button.title=name;
  });
  container.addEventListener('click',event=>{
    const button=event.target.closest('button[data-chapter]');
    if(!button || !container.contains(button))return;
    const number=Number(button.dataset.chapter);
    if(selectedChapters.has(number))selectedChapters.delete(number);
    else selectedChapters.add(number);
    updateChapterSelection();
  });
  el('chapters-all').addEventListener('click',()=>{
    selectedChapters.clear();
    updateChapterSelection();
  });
  updateChapterSelection();
}

function renderBank() {
  const qs=filteredQuestions();
  updateYearPrintOption();
  const container=el('question-list');
  el('bank-count').textContent=`${qs.length} of ${questions.length} questions`;
  el('empty').hidden=qs.length!==0;
  container.innerHTML=qs.map(q=>makeCard(q)).join('');
  prepareFigures(container);
  container.querySelectorAll('button.expand').forEach(button=>{
    button.addEventListener('click',async()=>{
      const card=button.closest('.question-card');
      const body=card.querySelector('.question-body');
      const opening=body.hidden;
      body.hidden=!opening;
      button.textContent=opening?'Hide question':'View question';
      button.setAttribute('aria-expanded',String(opening));
      if(opening) await typeset(body);
    });
  });
}

function selectTab(id) {
  const isBank=id==='bank';
  el('panel-bank').hidden=!isBank;
  el('panel-exam').hidden=isBank;
  el('tab-bank').classList.toggle('active',isBank);
  el('tab-exam').classList.toggle('active',!isBank);
  el('tab-bank').setAttribute('aria-selected',String(isBank));
  el('tab-exam').setAttribute('aria-selected',String(!isBank));
}

function shuffle(items) {
  const a=[...items];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

async function renderExam(ids) {
  const exam=ids.map(id=>questions.find(q=>q.id===id)).filter(Boolean);
  if(exam.length!==4){el('exam-message').textContent='Could not load all four selected questions.';return;}
  generatedIds=exam.map(q=>q.id);
  el('exam-message').hidden=true;
  el('exam-actions').hidden=false;
  const known=exam.filter(q=>q.points!=null);
  const pts=known.reduce((s,q)=>s+q.points,0);
  const scoreLabel=known.length===4? `${pts} total points` : `${pts} specified points · some scores unavailable`;
  el('exam-score').textContent=`4 questions · ${scoreLabel}`;
  el('exam-list').innerHTML=exam.map((q,i)=>makeCard(q,true,true,i)).join('');
  prepareFigures(el('exam-list'));
  await typeset(el('exam-list'));
}

async function init() {
  try {
    // Only the question database is required. The other two JSON files
    // enrich the page, but cannot prevent chapter selection from loading.
    const [questionsResponse, gradesResponse, chaptersResponse]=await Promise.all([
      fetch('./data/questions.json?v=8.1'),
      fetch('./data/grades-2016.json').catch(()=>null),
      fetch('./data/chapters.json').catch(()=>null)
    ]);
    if(!questionsResponse.ok)throw new Error('Missing questions.json');
    questions=await questionsResponse.json();
    if(gradesResponse?.ok)gradeData=await gradesResponse.json();
    if(chaptersResponse?.ok){
      chapterNames={...defaultChapterNames, ...await chaptersResponse.json()};
    }
    // Make sure any new chapters present in questions can be selected,
    // even if their chapter description has not yet been written.
    questions.flatMap(q=>q.chapters||[]).forEach(n=>{
      if(!(n in chapterNames))chapterNames[n]=`Chapter ${n}`;
    });
    // Students selecting a chapter see tagged questions only; year-only browsing includes all.
    Object.entries(chapterNames).sort((a,b)=>Number(a[0])-Number(b[0]))
      .forEach(([n,name])=>el('topic').add(new Option(`Chapter ${n} — ${name}`,n)));
    [...new Set(questions.map(q=>q.year))].sort((a,b)=>b-a)
      .forEach(y=>el('year').add(new Option(y,y)));
    buildChapterSelector();
    const chapterParam=new URLSearchParams(window.location.search).get('chapters');
    if(chapterParam){
      chapterParam.split(',').map(Number).filter(n=>Number.isInteger(n)&&Object.hasOwn(chapterNames,String(n)))
        .forEach(n=>selectedChapters.add(n));
      updateChapterSelection();
    }
    renderBank();
    const param=new URLSearchParams(window.location.search).get('exam');
    if(param){
      const ids=param.split(',');
      if(ids.length===4&&new Set(ids).size===4&&ids.every(id=>questions.some(q=>q.id===id))){
        selectTab('exam');
        await renderExam(ids);
      }
    }
  } catch(err) {
    el('question-list').innerHTML='<p class="loading">Unable to load the question bank. To preview locally, serve this folder with a local web server; see README.md.</p>';
    el('bank-count').textContent='Data unavailable';
    el('chapter-pool-status').textContent='Question data could not be loaded. Please refresh this page.';
    el('generate').disabled=true;
    console.error(err);
  }
}

el('tab-bank').addEventListener('click',()=>selectTab('bank'));
el('tab-exam').addEventListener('click',()=>selectTab('exam'));
['query','topic','year'].forEach(id=>el(id).addEventListener(id==='query'?'input':'change',renderBank));
el('reset').addEventListener('click',()=>{el('query').value='';el('topic').value='';el('year').value='';renderBank();});
el('generate').addEventListener('click',()=>{
  const pool=eligibleRandomQuestions();
  if(pool.length<4){el('exam-message').hidden=false;el('exam-message').textContent='Need at least four eligible questions.';return;}
  const ids=shuffle(pool).slice(0,4).map(q=>q.id);
  const url=new URL(window.location.href);
  url.searchParams.set('exam',ids.join(','));
  if(selectedChapters.size)url.searchParams.set('chapters',[...selectedChapters].sort((a,b)=>a-b).join(','));
  else url.searchParams.delete('chapters');
  window.history.replaceState({},'',url.toString());
  renderExam(ids);
});
function openPrintableExam(param,value){
  // Always open the independent print layout rather than printing the website.
  const url=new URL('./print.html',window.location.href);
  url.searchParams.set(param,value);
  url.searchParams.set('autoprint','1');
  const win=window.open(url.toString(),'_blank');
  if(!win)window.location.href=url.toString();
}
el('print-exam').addEventListener('click',()=>{
  if(generatedIds.length!==4)return;
  openPrintableExam('exam',generatedIds.join(','));
});
el('print-year').addEventListener('click',()=>{
  const year=el('year').value;
  if(year && questions.some(q=>String(q.year)===year)) openPrintableExam('year',year);
});
el('copy-exam').addEventListener('click',async()=>{
  const url=new URL(window.location.href);
  url.searchParams.set('exam',generatedIds.join(','));
  if(selectedChapters.size)url.searchParams.set('chapters',[...selectedChapters].sort((a,b)=>a-b).join(','));
  else url.searchParams.delete('chapters');
  try {await navigator.clipboard.writeText(url.toString());el('copy-exam').textContent='Copied!';setTimeout(()=>el('copy-exam').textContent='Copy exam link',1500);}
  catch(e){window.prompt('Copy exam link:',url.toString());}
});
init();
