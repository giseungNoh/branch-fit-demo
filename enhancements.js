const caseHistory=[
{id:'CASE-2026-014',branch:'신당역',branchId:'IBK-004',district:'중구',stage:'고객 의견 수렴',impact:'높음',state:'설문 진행',updated:'오늘',status:'assessment'},
{id:'CASE-2026-011',branch:'종로',branchId:'IBK-006',district:'종로구',stage:'사후영향평가',impact:'높음',state:'모니터링 필요',updated:'2일 전',status:'post'},
{id:'CASE-2026-009',branch:'대림동',branchId:'IBK-010',district:'영등포구',stage:'후보점포 분석',impact:'-',state:'우선 검토',updated:'5일 전',status:'candidate'},
{id:'CASE-2026-006',branch:'성수희망',branchId:'IBK-012',district:'성동구',stage:'사전영향평가',impact:'중간',state:'검토 중',updated:'7일 전',status:'assessment'}
];

const DATA_FRESHNESS={
branch:{label:'점포/좌표',date:'2026-09-08',source:'IBK 영업점 정보 · FIN MAP 연동 예정'},
population:{label:'인구·65세 이상',date:'2026-07-31',source:'행정안전부 주민등록 인구통계'},
business:{label:'사업체',date:'2024-12-31',source:'KOSIS 전국사업체조사'},
visit:{label:'점포 방문·이용빈도',date:'2026-08',source:'은행 내부데이터 · 데모값'},
face:{label:'대면서비스 의존도',date:'2026-08',source:'은행 내부데이터 · 데모값'},
opinion:{label:'고객 설문',date:'2026-09-09',source:'BranchFit 데모 설문'}
};

const mapMeta={
'IBK-001':{lat:37.5008,lng:127.0365,status:'normal'},'IBK-002':{lat:37.5088,lng:127.0632,status:'normal'},'IBK-003':{lat:37.5608,lng:126.9864,status:'candidate'},'IBK-004':{lat:37.5656,lng:127.0196,status:'assessment'},'IBK-005':{lat:37.5671,lng:126.9794,status:'normal'},'IBK-006':{lat:37.5704,lng:126.9921,status:'post'},'IBK-007':{lat:37.5730,lng:126.9852,status:'assessment'},'IBK-008':{lat:37.5175,lng:126.8959,status:'normal'},'IBK-009':{lat:37.5348,lng:126.9027,status:'normal'},'IBK-010':{lat:37.4930,lng:126.8967,status:'candidate'},'IBK-011':{lat:37.5446,lng:127.0558,status:'normal'},'IBK-012':{lat:37.5440,lng:127.0647,status:'assessment'}
};
let analysisMap, mapLayerGroup, activeMapFilter='all';
const mapColors={normal:'#1769e0',candidate:'#f59f00',assessment:'#e85976',post:'#0ca678'};
function stageLabel(status){return({normal:'일반 운영',candidate:'검토 후보',assessment:'사전영향평가',post:'사후 모니터링'})[status]||status}
function renderCaseHistory(){const el=document.querySelector('#recentCases');if(!el)return;el.innerHTML=caseHistory.map(c=>`<div class="case-row" data-case-branch="${c.branchId}"><div class="case-row-top"><b>${c.branch} · ${c.district}</b><span class="stage-badge">${c.stage}</span></div><small>${c.id} · 최근 업데이트 ${c.updated}</small><div class="case-meta"><span class="tag ${c.impact==='높음'?'amber':''}">영향도 ${c.impact}</span><span class="tag">${c.state}</span></div></div>`).join('');document.querySelectorAll('[data-case-branch]').forEach(el=>el.onclick=()=>{const id=el.dataset.caseBranch;if(typeof state!=='undefined'){state.branch=id}const select=document.querySelector('#assessmentBranch');if(select){select.value=id;if(typeof renderAssessment==='function')renderAssessment()}if(typeof gotoView==='function')gotoView('assessment')})}
function renderAlerts(){const el=document.querySelector('#dashboardAlerts');if(!el)return;el.innerHTML='<div class="alert-item red"><b>사후 모니터링</b><br>종로점 대체점포 방문량·민원이 함께 증가했습니다.</div><div class="alert-item"><b>고객 의견</b><br>신당역점 설문에서 대체점포 이동거리 관련 의견이 집중되고 있습니다.</div><div class="alert-item"><b>데이터 확인</b><br>2개 분석 Case에서 대체수단 서비스 범위 확인이 필요합니다.</div>'}
function initMap(){if(!window.L||!document.querySelector('#analysisMap'))return;analysisMap=L.map('analysisMap',{zoomControl:true,scrollWheelZoom:false}).setView([37.555,126.997],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(analysisMap);mapLayerGroup=L.layerGroup().addTo(analysisMap);renderMapMarkers();setTimeout(()=>analysisMap.invalidateSize(),200)}
function renderMapMarkers(){if(!mapLayerGroup)return;mapLayerGroup.clearLayers();branches.forEach(b=>{const m=mapMeta[b.id];if(!m||(activeMapFilter!=='all'&&m.status!==activeMapFilter))return;const marker=L.circleMarker([m.lat,m.lng],{radius:8,color:'#fff',weight:2,fillColor:mapColors[m.status],fillOpacity:1}).addTo(mapLayerGroup);marker.bindPopup(`<div class="popup-card"><b>IBK ${b.name}</b><small>${b.district}</small><div class="popup-stage" style="color:${mapColors[m.status]}">${stageLabel(m.status)}</div><small>월평균 방문 ${b.visits.toLocaleString()}명 · 고령층 ${b.elderly}%</small><small>점포 데이터 기준 ${DATA_FRESHNESS.branch.date}</small><button data-popup-branch="${b.id}">분석 상세보기</button></div>`);marker.on('popupopen',()=>setTimeout(()=>{const btn=document.querySelector(`[data-popup-branch="${b.id}"]`);if(btn)btn.onclick=()=>{state.branch=b.id;document.querySelector('#assessmentBranch').value=b.id;renderAssessment();gotoView('assessment')}},0))})}
function bindMapFilters(){document.querySelectorAll('[data-map-filter]').forEach(btn=>btn.onclick=()=>{activeMapFilter=btn.dataset.mapFilter;document.querySelectorAll('[data-map-filter]').forEach(x=>x.classList.toggle('active',x===btn));renderMapMarkers()})}
function bindPostAI(){const btn=document.querySelector('#postAiBtn');if(!btn)return;btn.onclick=()=>{const box=document.querySelector('#postAiSummary');box.classList.remove('muted');box.innerHTML='<b>AI 사후영향 분석</b><p>폐점 이후 대체점포 방문량은 38%, 평균 대기시간은 7분 증가했고 월 민원은 12건에서 34건으로 늘었습니다. 공동점포 이용률은 61%로 운영 중이지만, 기업대출 상담 업무는 현재 대체되지 않아 서비스 공백이 확인됩니다.</p><p><b>추가 검토:</b> 통합점포 혼잡 완화, 기업대출 상담 대체채널 확보, 고령고객 접근성 재확인, 4주 후 VOC 재모니터링.</p>';toast('사후영향 분석을 생성했습니다')}}
function bindPostCase(){const sel=document.querySelector('#postCaseSelect');if(!sel)return;sel.innerHTML=caseHistory.filter(c=>c.status==='post').map(c=>`<option value="${c.id}">${c.branch} · ${c.id}</option>`).join('')}
function renderCaseStorage(){const el=document.querySelector('#caseHistoryRows');if(!el)return;el.innerHTML=caseHistory.map(c=>`<tr><td><b>${c.id}</b><small>${c.branch} · ${c.district}</small></td><td>${c.stage}</td><td>${c.impact}</td><td>${c.state}</td><td>${c.updated}</td></tr>`).join('')}

function removeDashboardProcessCards(){
 const dash=document.querySelector('#dashboard');if(!dash)return;
 [...dash.querySelectorAll('.grid.two')].forEach(grid=>{
   const text=grid.textContent||'';
   if(text.includes('현재 분석 프로세스')||text.includes('AI가 담당하는 영역'))grid.remove();
 });
}

function freshnessHTML(keys=['branch','population','visit','face']){
 return `<div class="freshness-strip"><b>데이터 기준일</b>${keys.map(k=>{const d=DATA_FRESHNESS[k];return `<span><strong>${d.label}</strong> ${d.date}<small>${d.source}</small></span>`}).join('')}</div>`;
}

function injectFreshness(){
 const targets=[
   ['#dashboard .pagehead',['branch','population','visit','face']],
   ['#status .pagehead',['population','visit','face']],
   ['#candidates .pagehead',['branch','population','visit','face']],
   ['#assessment .pagehead',['branch','population','visit','face']],
   ['#opinions .pagehead',['opinion']],
   ['#post .pagehead',['visit','opinion','branch']],
   ['#data .pagehead',['branch','population','business','visit','face','opinion']]
 ];
 targets.forEach(([sel,keys])=>{const head=document.querySelector(sel);if(!head||head.parentElement.querySelector(':scope > .freshness-strip'))return;head.insertAdjacentHTML('afterend',freshnessHTML(keys));});
}

function candidateEvidenceHTML(){return `
<div class="candidate-evidence-grid">
  <div class="card pad candidate-basis">
    <div class="card-title">후보점포 우선순위 산정 근거 <span class="tag amber">BranchFit 자체 탐색기준</span></div>
    <p class="basis-intro">이 단계는 공식 사전영향평가가 아니라, <b>어떤 점포를 먼저 깊게 평가할지</b> 좁히는 내부 탐색 단계입니다. 공식 폐점 기준이나 자동 폐쇄 결정으로 사용하지 않습니다.</p>
    <div class="basis-list">
      <div><b>① 고객 점포 이용현황</b><span>최근 12개월 월평균 방문·이용고객 규모</span><small>근거 데이터: 은행 내부 방문/번호표/창구 로그 · 데모 기준 2026-08</small></div>
      <div><b>② 점포 이용빈도</b><span>대상점포 이용량을 인근·전행 평균과 비교</span><small>근거 데이터: 은행 내부 방문 로그 · 상대 비교지표</small></div>
      <div><b>③ 취약계층 현황</b><span>고령층 등 대면 접근성에 민감한 고객·지역 특성 확인</span><small>지역 통계는 배경정보이며 실제 점포 고객구성은 내부데이터가 필요</small></div>
      <div><b>④ 대면서비스 의존도</b><span>전체 거래 중 창구·대면 서비스 비중을 전행 평균과 비교</span><small>근거 데이터: 은행 내부 거래 채널 집계</small></div>
    </div>
  </div>
  <div class="card pad candidate-reference">
    <div class="card-title">제도·데이터 근거</div>
    <div class="reference-item"><span class="tag blue">정책 근거</span><b>금융위원회 점포폐쇄 대응방안</b><small>후보선정 점수표가 아니라, 후보 선정 이후 사전영향평가에서 금융접근성·대체수단 등을 확인하는 절차의 근거로 사용</small></div>
    <div class="reference-item"><span class="tag blue">공동절차</span><b>은행연합회 점포폐쇄 관련 공동절차</b><small>고객 의견수렴, 사전·사후영향평가, 대체수단 검토의 절차 근거</small></div>
    <div class="reference-item"><span class="tag">주의</span><b>후보 우선순위는 은행별 내부 기준 필요</b><small>공통 공식 컷오프는 확인되지 않았으므로 실제 도입 시 은행 내부 후보선정 규칙과 가중치를 Rule Engine에 연결</small></div>
  </div>
</div>
<div class="card pad candidate-detail-card">
  <div class="card-title">후보 해석 가이드</div>
  <div class="candidate-guide"><div><b>우선 검토</b><small>이용량이 낮거나 상대 이용빈도가 낮아 추가 사전영향평가 우선순위가 높은 점포</small></div><div><b>보호 리스크 동시 확인</b><small>고령층·대면의존도가 높으면 단순 이용량이 낮더라도 폐점 적합으로 해석하면 안 됨</small></div><div><b>다음 단계</b><small>후보 선택 → 사전영향평가 → 규정 RAG → 대체수단 검토 → 고객 의견수렴</small></div></div>
</div>`}

function injectCandidateEvidence(){
 const section=document.querySelector('#candidates');if(!section||section.querySelector('.candidate-evidence-grid'))return;
 const callout=section.querySelector('.callout');
 if(callout)callout.insertAdjacentHTML('afterend',candidateEvidenceHTML());
}

function decorateCandidateRows(){
 const rows=document.querySelectorAll('#candidateRows tr');
 rows.forEach((tr,i)=>{
   if(tr.querySelector('.evidence-note'))return;
   const cells=tr.querySelectorAll('td'); if(cells.length<7)return;
   const bName=cells[1]?.innerText?.split('\n')[0]||'점포';
   const note=document.createElement('div');
   note.className='evidence-note';
   note.textContent=i<2?`${bName}: 낮은 이용수준 중심으로 우선 검토하되 취약계층·대면의존도는 보호 리스크로 별도 확인`:`${bName}: 현황지표를 종합해 일반 검토군으로 분류`;
   cells[1].appendChild(note);
 });
}

function observeCandidates(){const body=document.querySelector('#candidateRows');if(!body)return;new MutationObserver(decorateCandidateRows).observe(body,{childList:true});decorateCandidateRows()}

window.addEventListener('load',()=>{removeDashboardProcessCards();injectFreshness();injectCandidateEvidence();observeCandidates();renderCaseHistory();renderAlerts();bindMapFilters();initMap();bindPostAI();bindPostCase();renderCaseStorage()});