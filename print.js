"use strict";
const el = id => document.getElementById(id);
const escapeHtml = text => String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function drawGrades(values) {
  const W=560,H=430,L=72,T=28,R=28,B=68,w=W-L-R,h=H-T-B;
  const sx=x=>L+x/10*w,sy=y=>T+h-y/10*h;
  let grid='';
  for(let n=0;n<=10;n++){
    const x=sx(n),y=sy(n);
    grid+=`<line x1="${x}" x2="${x}" y1="${T}" y2="${T+h}" stroke="#e3e3e3"/><line x1="${L}" x2="${L+w}" y1="${y}" y2="${y}" stroke="#e3e3e3"/><text x="${x}" y="${T+h+19}" text-anchor="middle" font-size="11">${n}</text><text x="${L-12}" y="${y+4}" text-anchor="end" font-size="11">${n}</text>`;
  }
  const marks=values.coordinates.map(([x,y])=>`<circle cx="${sx(x)}" cy="${sy(y)}" r="3.8" fill="#333" opacity=".75"/>`).join('');
  const line=values.line;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Observed and expected grades scatterplot">${grid}<rect x="${L}" y="${T}" width="${w}" height="${h}" fill="none" stroke="#666"/><line x1="${sx(2)}" y1="${sy(line.slope*2+line.intercept)}" x2="${sx(9)}" y2="${sy(line.slope*9+line.intercept)}" stroke="#666" stroke-width="2"/>${marks}<text x="${L+w/2}" y="${H-17}" text-anchor="middle" font-size="14">Expected Grade</text><text x="18" y="${T+h/2}" text-anchor="middle" transform="rotate(-90 18 ${T+h/2})" font-size="14">Observed Grade</text></svg>`;
}
function addImageFallbacks(grades) {
  document.querySelectorAll('.source-figure').forEach(figure=>{
    const image=figure.querySelector('img');
    const missing=figure.querySelector('.image-missing');
    if(!image)return;
    image.loading='eager';
    const fail=()=>{
      image.hidden=true;
      if(image.getAttribute('src')?.includes('2016_q2.png') && grades){
        const plot=document.createElement('div');plot.className='grade-plot';plot.innerHTML=drawGrades(grades);figure.appendChild(plot);
        if(missing) missing.hidden=true;
      } else if(missing) missing.hidden=false;
    };
    image.addEventListener('error',fail,{once:true});
    if(image.complete && !image.naturalWidth) fail();
  });
}

function imageReady(img) {
  if(img.complete)return Promise.resolve();
  return new Promise(resolve=>{
    img.addEventListener('load',resolve,{once:true});
    img.addEventListener('error',resolve,{once:true});
  });
}
function questionHtml(q,index,mode='practice') {
  const isYear=mode==='year';
  const source=`${q.year} Final${q.part?', Part '+q.part:''} · Q${q.number}`;
  const title = /^Question\s+\d+$/i.test(q.title.trim()) ? '' : `<div class="question-title">${escapeHtml(q.title)}</div>`;
  const brief = q.body.length < 1400 && !q.body.includes('<figure') && !q.body.includes('<table');
  const number=isYear ? q.number : index+1;
  const sourceHtml=isYear ? '' : `<div class="question-source">${escapeHtml(source)}</div>`;
  return `<section class="question${brief ? ' brief-question' : ''}">
    <div class="question-heading"><div class="question-heading-left">Question ${number}${q.points_label ? `<small>[${escapeHtml(q.points_label)} points]</small>`:''}</div>${sourceHtml}</div>
    ${title}<div class="question-body">${q.body}</div></section>`;
}
function yearExamHtml(selected){
  let lastPart=null;
  return selected.map((q,index)=>{
    const part=q.part && q.part!==lastPart ? `<h2 class="exam-part-heading">Part ${escapeHtml(q.part)}</h2>` : '';
    lastPart=q.part;
    return part+questionHtml(q,index,'year');
  }).join('');
}
async function init(){
  try {
    const params=new URLSearchParams(location.search);
    const year=params.get('year');
    const isYear=year!==null;
    const ids=(params.get('exam')||'').split(',');
    if(isYear){
      if(!/^\d{4}$/.test(year))throw Error('Invalid exam year.');
    }else if(ids.length!==4 || new Set(ids).size!==4){
      throw Error('A practice exam must include four different questions.');
    }
    const [r1,r2]=await Promise.all([fetch('./data/questions.json'),fetch('./data/grades-2016.json')]);
    if(!r1.ok||!r2.ok) throw Error('Could not load exam data.');
    const [all,grades]=await Promise.all([r1.json(),r2.json()]);
    let selected;
    if(isYear){
      // Archive order is original year/part/question order, including unclassified questions.
      selected=all.filter(q=>String(q.year)===year);
      if(!selected.length)throw Error('No archived final was found for that year.');
      el('print-title').textContent=`ECON 532 - ${year} Final Examination`;
      document.title=`ECON 532 - ${year} Final Examination`;
      el('questions').innerHTML=yearExamHtml(selected);
    }else{
      selected=ids.map(id=>all.find(q=>q.id===id));
      if(selected.some(x=>!x))throw Error('One of the questions was not found.');
      el('questions').innerHTML=selected.map((q,i)=>questionHtml(q,i,'practice')).join('');
    }
    addImageFallbacks(grades);
    await Promise.all([...document.querySelectorAll('.source-figure img')].map(imageReady));
    if(window.MathJax){
      await MathJax.startup.promise;
      await MathJax.typesetPromise([el('questions')]);
    }
    if(document.fonts?.ready)await document.fonts.ready;
    el('message').remove();
    el('print-button').disabled=false;
    if(new URLSearchParams(location.search).has('autoprint')){
      // Give layout a final repaint before the browser opens its print dialog.
      requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));
    }
  } catch(error) {
    el('message').textContent='Cannot prepare this exam: '+error.message;
  }
}
el('print-button').addEventListener('click',()=>window.print());
init();
