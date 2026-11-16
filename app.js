'use strict';
let questions = [];
let gradeData = null;
let generatedIds = [];
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
    const x=sx(n),y=sy(n);
    return `<line x1="${x}" x2="${x}" y1="${T}" y2="${T+h}" stroke="#e5eaf1"/><line x1="${L}" x2="${L+w}" y1="${y}" y2="${y}" stroke="#e5eaf1"/><text x="${x}" y="${T+h+19}" text-anchor="middle" font-size="11" fill="#63758b">${n}</text><text x="${L-12}" y="${y+4}" text-anchor="end" font-size="11" fill="#63758b">${n}</text>`;
  }).join('');
  const marks=values.coordinates.map(([x,y])=>`<circle cx="${sx(x)}" cy="${sy(y)}" r="4" fill="#1a5e9a" opacity=".66" stroke="white" stroke-width=".5"/>`).join('');
  const l=values.line;
  const slopeLine=`<line x1="${sx(2)}" y1="${sy(l.slope*2+l.intercept)}" x2="${sx(9)}" y2="${sy(l.slope*9+l.intercept)}" stroke="#f15d22" stroke-width="2.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Observed versus expected grades with regression line">${grid}<rect x="${L}" y="${T}" width="${w}" height="${h}" fill="none" stroke="#718497"/>${slopeLine}${marks}<text x="${L+w/2}" y="${H-17}" text-anchor="middle" font-size="14" fill="#273d54">Expected Grade</text><text x="18" y="${T+h/2}" text-anchor="middle" transform="rotate(-90 18 ${T+h/2})" font-size="14" fill="#273d54">Observed Grade</text></svg>`;
}
function makeCard(q, expanded=false, isExam=false, position=0) {
  const tags=q.topics.map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('');
  const content = q.body.replace(/data-grade-chart(?=\b)/g,'data-grade-chart');
  return `<article class="question-card" data-id="${escapeHtml(q.id)}">
    <div class="question-head"><div class="q-left"><div class="q-meta"><span class="pill year">${q.year}</span><span class="pill">Question ${q.number}</span><span class="pill points">${q.points_label} points</span>${isExam?`<span class="pill">Exam question ${position+1}</span>`:''}</div>
    <h3 class="q-title">${escapeHtml(q.title)}</h3><div class="tags">${tags}</div></div>
    ${isExam?'':`<button type="button" class="button button-outline expand" aria-expanded="${expanded}" aria-label="${expanded?'Hide':'View'} ${escapeHtml(q.title)}">${expanded?'Hide question':'View question'}</button>`}</div>
    <div class="question-body" ${expanded?'':'hidden'}>${content}</div></article>`;
}
function renderPlots(container) {
  if (!gradeData) return;
  container.querySelectorAll('[data-grade-chart]').forEach(node=>node.innerHTML=chartSVG(gradeData));
}
function filteredQuestions() {
  const query=el('query').value.toLowerCase().trim(), topic=el('topic').value,year=el('year').value;
  return questions.filter(q=> (!topic||q.topics.includes(topic)) && (!year||String(q.year)===year) &&
   (!query||[q.title,q.id,q.year,...q.topics,q.body.replace(/<[^>]+>/g,' ')].join(' ').toLowerCase().includes(query)));
}
function renderBank() {
  const qs=filteredQuestions(), container=el('question-list');
  el('bank-count').textContent=`${qs.length} of ${questions.length} questions`;
  el('empty').hidden=qs.length!==0;
  container.innerHTML=qs.map(q=>makeCard(q)).join('');
  container.querySelectorAll('button.expand').forEach(button=>{
    button.addEventListener('click', async ()=>{
      const card=button.closest('.question-card'), body=card.querySelector('.question-body'), expanded=body.hidden;
      body.hidden=!expanded;
      button.textContent=expanded?'Hide question':'View question';
      button.setAttribute('aria-expanded', String(expanded));
      if(expanded){renderPlots(body);await typeset(body);}
    });
  });
}
function selectTab(id) {
  const isBank=id==='bank';
  el('panel-bank').hidden=!isBank;el('panel-exam').hidden=isBank;
  el('tab-bank').classList.toggle('active',isBank);el('tab-exam').classList.toggle('active',!isBank);
  el('tab-bank').setAttribute('aria-selected',String(isBank));el('tab-exam').setAttribute('aria-selected',String(!isBank));
}
function shuffle(items) {
  const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
async function renderExam(ids) {
  const exam=ids.map(id=>questions.find(q=>q.id===id)).filter(Boolean);
  if(exam.length!==4){el('exam-message').textContent='Could not load all four selected questions.';return;}
  generatedIds=exam.map(q=>q.id);el('exam-message').hidden=true;el('exam-actions').hidden=false;
  el('exam-score').textContent=`4 questions · ${exam.reduce((s,q)=>s+q.points,0)} total points`;
  el('exam-list').innerHTML=exam.map((q,i)=>makeCard(q,true,true,i)).join('');
  renderPlots(el('exam-list'));await typeset(el('exam-list'));
}
async function init() {
  try {
    const [a,b]=await Promise.all([fetch('./data/questions.json'),fetch('./data/grades-2016.json')]);
    if(!a.ok||!b.ok)throw new Error('Missing JSON data');
    [questions,gradeData]=await Promise.all([a.json(),b.json()]);
    const topics=[...new Set(questions.flatMap(q=>q.topics))].sort();
    topics.forEach(t=>el('topic').add(new Option(t,t)));
    [...new Set(questions.map(q=>q.year))].sort((x,y)=>y-x).forEach(y=>el('year').add(new Option(y,y)));
    renderBank();
    const param=new URLSearchParams(window.location.search).get('exam');
    if(param){const ids=param.split(','); if(ids.length===4&&new Set(ids).size===4&&ids.every(id=>questions.some(q=>q.id===id))){selectTab('exam');await renderExam(ids);}}
  }catch(err){el('question-list').innerHTML='<p class="loading">Unable to load the question bank. To preview locally, serve this folder with a local web server; see README.md.</p>';el('bank-count').textContent='Data unavailable';console.error(err);}
}
el('tab-bank').addEventListener('click',()=>selectTab('bank'));
el('tab-exam').addEventListener('click',()=>selectTab('exam'));
['query','topic','year'].forEach(id=>el(id).addEventListener(id==='query'?'input':'change',renderBank));
el('reset').addEventListener('click',()=>{el('query').value='';el('topic').value='';el('year').value='';renderBank();});
el('generate').addEventListener('click',()=>{
  const pool=questions.filter(q=>q.include_in_random||el('include-history').checked);
  if(pool.length<4){el('exam-message').hidden=false;el('exam-message').textContent='Need at least four eligible questions.';return;}
  const ids=shuffle(pool).slice(0,4).map(q=>q.id);
  const url=new URL(window.location.href);url.searchParams.set('exam',ids.join(','));
  window.history.replaceState({},'',url.toString());renderExam(ids);
});
el('print-exam').addEventListener('click',()=>window.print());
el('copy-exam').addEventListener('click',async()=>{
  const url=new URL(window.location.href);url.searchParams.set('exam',generatedIds.join(','));
  try{await navigator.clipboard.writeText(url.toString());el('copy-exam').textContent='Copied!';setTimeout(()=>el('copy-exam').textContent='Copy exam link',1500);}
  catch(e){prompt('Copy exam link:',url.toString());}
});
init();
