const backofficeStyle=document.createElement('link');
backofficeStyle.rel='stylesheet';
backofficeStyle.href='backoffice.css?v=20260909-1';
document.head.appendChild(backofficeStyle);

const caseHistory=[
{id:'CASE-2026-014',branch:'신당역',branchId:'IBK-004',district:'중구',stage:'고객 의견 수렴',impact:'높음',state:'설문 진행',updated:'오늘',status:'assessment'},
{id:'CASE-2026-011',branch:'종로',branchId:'IBK-006',district:'종로구',stage:'사후영향평가',impact:'높음',state:'모니터링 필요',updated:'2일 전',status:'post'},
{id:'CASE-2026-009',branch:'대림동',branchId:'IBK-010',district:'영등포구',stage:'후보점포 분석',impact:'-',state:'우선 검토',updated:'5일 전',status:'candidate'},
{id:'CASE-2026-006',branch:'성수희망',branchId:'IBK-012',district:'성동구',stage:'사전영향평가',impact:'중간',state:'검토 중',updated:'7일 전',status:'assessment'}
];

const DATA_FRESHNESS={
branch:{label:'점포/좌표',date:'2026-09-08',source:'IBK 영업점 정보'},
population:{label:'인구·65세 이상',date:'2026-07-31',source:'행정안전부 주민등록 인구통계'},
business:{label:'사업체',date:'2024-12-31',source:'KOSIS 전국사업체조사'},
visit:{label:'점포 방문·이용빈도',date:'2026-08',source:'은행 내부데이터 · 데모값'},
face:{label:'대면서비스 의존도',date:'2026-08',source:'은행 내부데이터 · 데모값'},
opinion:{label:'고객 설문/VOC',date:'2026-09-09',source:'BranchFit 데모 설문'}
};

const mapMeta={
'IBK-001':{lat:37.5008,lng:127.0365,status:'normal'},'IBK-002':{lat:37.5088,lng:127.0632,status:'normal'},'IBK-003':{lat:37.5608,lng:126.9864,status:'candidate'},'IBK-004':{lat:37.5656,lng:127.0196,status:'assessment'},'IBK-005':{lat:37.5671,lng:126.9794,status:'normal'},'IBK-006':{lat:37.5704,lng:126.9921,status:'post'},'IBK-007':{lat:37.5730,lng:126.9852,status:'assessment'},'IBK-008':{lat:37.5175,lng:126.8959,status:'normal'},'IBK-009':{lat:37.5348,lng:126.9027,status:'normal'},'IBK-010':{lat:37.4930,lng:126.8967,status:'candidate'},'IBK-011':{lat:37.5446,lng:127.0558,status:'normal'},'IBK-012':{lat:37.5440,lng:127.0647,status:'assessment'}
};
let analysisMap,mapLayerGroup,activeMapFilter='all';
const mapColors={normal:'#1769e0',candidate:'#f59f00',assessment:'#e85976',post:'#0ca678'};
function stageLabel(status){return({normal:'일반 운영',candidate:'검토 후보',assessment:'사전영향평가',post:'사후 모니터링'})[status]||status}

function freshnessHTML(keys){return `<div class="freshness-strip"><b>데이터 기준일</b>${keys.map(k=>{const d=DATA_FRESHNESS[k];return `<span><strong>${d.label}</strong> ${d.date}<small>${d.source}</small></span>`}).join('')}</div>`}
function refreshFreshnessStrips(){
 const targets=[['#dashboard',['branch','population','visit','face']],['#status',['population','visit','face','branch']],['#candidates',['visit','population','face','branch']],['#assessment',['branch','visit','face']],['#opinions',['opinion']],['#post',['visit','opinion','branch']],['#data',['branch','population','business','visit','face','opinion']]];
 targets.forEach(([sel,keys])=>{const section=document.querySelector(sel);if(!section)return;section.querySelectorAll(':scope > .freshness-strip').forEach(x=>x.remove());const head=section.querySelector(':scope > .pagehead');if(head)head.insertAdjacentHTML('afterend',freshnessHTML(keys));});
}

function criteriaHTML(){return `<div class="card pad criteria-card"><div class="card-title">평가 항목</div><div class="tablewrap"><table class="criteria-table"><thead><tr><th>항목</th><th>확인 내용</th><th>사용 데이터</th><th>기준일</th></tr></thead><tbody>
<tr><td><b>고객 점포 이용현황</b></td><td>최근 12개월 월평균 방문·이용고객 규모</td><td class="criteria-source">은행 내부 방문·번호표·창구 집계</td><td class="criteria-date">2026-08 · 데모</td></tr>
<tr><td><b>점포 이용빈도</b></td><td>대상점포 이용량을 인근점포·전행 평균과 비교</td><td class="criteria-source">은행 내부 방문 로그</td><td class="criteria-date">2026-08 · 데모</td></tr>
<tr><td><b>취약계층</b></td><td>65세 이상 등 대면 금융 접근이 중요한 고객·지역 특성</td><td class="criteria-source">공개 인구통계 + 내부 고객집계</td><td class="criteria-date">2026-07-31 / 2026-08</td></tr>
<tr><td><b>대면서비스 의존도</b></td><td>전체 거래 중 창구·대면 서비스 이용 비중</td><td class="criteria-source">은행 내부 거래채널 집계</td><td class="criteria-date">2026-08 · 데모</td></tr>
</tbody></table></div></div>`}

function monitoringHTML(){return `<div class="card pad monitoring-panel"><div class="card-title">모니터링 지표</div><div class="monitoring-grid">
<div><b>민원 증감</b><small>VOC·민원 건수 및 주요 불편유형 변화</small></div>
<div><b>대체점포 방문량</b><small>통합·대체점포의 방문량 및 혼잡 변화</small></div>
<div><b>평균 대기시간</b><small>창구 평균 대기시간 변화</small></div>
<div><b>대체수단 이용률</b><small>공동점포·이동점포·ATM/STM 실제 이용수준</small></div>
<div><b>접근거리 변화</b><small>폐점 전후 고객의 대면 금융 접근거리 변화</small></div>
<div><b>서비스 공백</b><small>기존 업무 중 대체채널에서 제공되지 않는 업무</small></div>
</div></div>`}

function applyBackofficeStructure(){
 const dash=document.querySelector('#dashboard');
 if(dash){dash.querySelector('.hero')?.remove();dash.querySelector('.flow')?.remove();const h=dash.querySelector('.pagehead h1');if(h)h.textContent='대시보드';const p=dash.querySelector('.pagehead p');if(p)p.textContent='점포 통·폐합 검토 현황과 진행 중인 분석 Case를 확인합니다.';dash.querySelector('.pagehead .tag')?.remove();}
 const candidates=document.querySelector('#candidates');
 if(candidates){const p=candidates.querySelector('.pagehead p');if(p)p.textContent='현황분석의 핵심 평가항목을 기준으로 추가 사전영향평가가 필요한 점포를 비교합니다.';const tag=candidates.querySelector('.pagehead .tag');if(tag){tag.className='tag';tag.textContent='STEP 2'};candidates.querySelector('.callout')?.remove();candidates.querySelector('.candidate-method-grid')?.remove();candidates.querySelector('.candidate-evidence-grid')?.remove();candidates.querySelector('.candidate-detail-card')?.remove();const ce=document.querySelector('#candidateEvidence');ce?.closest('.card')?.remove();if(!candidates.querySelector('.criteria-card')){const fresh=candidates.querySelector(':scope > .freshness-strip');fresh?.insertAdjacentHTML('afterend',criteriaHTML());}}
 const post=document.querySelector('#post');
 if(post){const p=post.querySelector('.pagehead p');if(p)p.textContent='통·폐합 이후 핵심 운영지표를 모니터링하고 이상 징후와 서비스 공백을 확인합니다.';const tag=post.querySelector('.pagehead .tag');if(tag){tag.className='tag';tag.textContent='STEP 5'};post.querySelector('.post-purpose-grid')?.remove();if(!post.querySelector('.monitoring-panel')){const head=post.querySelector('.district-box');head?.insertAdjacentHTML('afterend',monitoringHTML());}}
}

function renderCaseHistory(){const el=document.querySelector('#recentCases');if(!el)return;el.innerHTML=caseHistory.map(c=>`<div class="case-row" data-case-branch="${c.branchId}"><div class="case-row-top"><b>${c.branch} · ${c.district}</b><span class="stage-badge">${c.stage}</span></div><small>${c.id} · 최근 업데이트 ${c.updated}</small><div class="case-meta"><span class="tag ${c.impact==='높음'?'amber':''}">영향도 ${c.impact}</span><span class="tag">${c.state}</span></div></div>`).join('');document.querySelectorAll('[data-case-branch]').forEach(el=>el.onclick=()=>{const id=el.dataset.caseBranch;if(typeof state!=='undefined')state.branch=id;const select=document.querySelector('#assessmentBranch');if(select){select.value=id;if(typeof renderAssessment==='function')renderAssessment()}if(typeof gotoView==='function')gotoView('assessment')})}
function renderAlerts(){const el=document.querySelector('#dashboardAlerts');if(!el)return;el.innerHTML='<div class="alert-item red"><b>사후 모니터링</b><br>종로점 대체점포 방문량·민원이 함께 증가했습니다.</div><div class="alert-item"><b>고객 의견</b><br>신당역점 설문에서 대체점포 이동거리 관련 의견이 집중되고 있습니다.</div><div class="alert-item"><b>데이터 확인</b><br>2개 분석 Case에서 대체수단 서비스 범위 확인이 필요합니다.</div>'}
function initMap(){if(!window.L||!document.querySelector('#analysisMap'))return;analysisMap=L.map('analysisMap',{zoomControl:true,scrollWheelZoom:false}).setView([37.555,126.997],11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(analysisMap);mapLayerGroup=L.layerGroup().addTo(analysisMap);renderMapMarkers();setTimeout(()=>analysisMap.invalidateSize(),200)}
function renderMapMarkers(){if(!mapLayerGroup)return;mapLayerGroup.clearLayers();branches.forEach(b=>{const m=mapMeta[b.id];if(!m||(activeMapFilter!=='all'&&m.status!==activeMapFilter))return;const marker=L.circleMarker([m.lat,m.lng],{radius:8,color:'#fff',weight:2,fillColor:mapColors[m.status],fillOpacity:1}).addTo(mapLayerGroup);marker.bindPopup(`<div class="popup-card"><b>IBK ${b.name}</b><small>${b.district}</small><div class="popup-stage" style="color:${mapColors[m.status]}">${stageLabel(m.status)}</div><small>월평균 방문 ${b.visits.toLocaleString()}명 · 고령층 ${b.elderly}%</small><small>점포 데이터 기준 ${DATA_FRESHNESS.branch.date}</small><button data-popup-branch="${b.id}">분석 상세보기</button></div>`);marker.on('popupopen',()=>setTimeout(()=>{const btn=document.querySelector(`[data-popup-branch="${b.id}"]`);if(btn)btn.onclick=()=>{state.branch=b.id;document.querySelector('#assessmentBranch').value=b.id;renderAssessment();gotoView('assessment')}},0))})}
function bindMapFilters(){document.querySelectorAll('[data-map-filter]').forEach(btn=>btn.onclick=()=>{activeMapFilter=btn.dataset.mapFilter;document.querySelectorAll('[data-map-filter]').forEach(x=>x.classList.toggle('active',x===btn));renderMapMarkers()})}
function bindPostAI(){const btn=document.querySelector('#postAiBtn');if(!btn)return;btn.onclick=()=>{const box=document.querySelector('#postAiSummary');box.classList.remove('muted');box.innerHTML='<b>AI 사후영향 분석</b><p>폐점 이후 대체점포 방문량은 38%, 평균 대기시간은 7분 증가했고 월 민원은 12건에서 34건으로 늘었습니다. 공동점포 이용률은 61%로 운영 중이지만, 기업대출 상담 업무는 현재 대체되지 않아 서비스 공백이 확인됩니다.</p><p><b>추가 검토:</b> 통합점포 혼잡 완화, 기업대출 상담 대체채널 확보, 고령고객 접근성 재확인, 4주 후 VOC 재모니터링.</p>';toast('사후영향 분석을 생성했습니다')}}
function bindPostCase(){const sel=document.querySelector('#postCaseSelect');if(!sel)return;sel.innerHTML=caseHistory.filter(c=>c.status==='post').map(c=>`<option value="${c.id}">${c.branch} · ${c.id}</option>`).join('')}
function renderCaseStorage(){const el=document.querySelector('#caseHistoryRows');if(!el)return;el.innerHTML=caseHistory.map(c=>`<tr><td><b>${c.id}</b><small>${c.branch} · ${c.district}</small></td><td>${c.stage}</td><td>${c.impact}</td><td>${c.state}</td><td>${c.updated}</td></tr>`).join('')}
function refreshDatasetList(){const el=document.querySelector('#datasetList');if(!el)return;const sets=[['점포 좌표·타행점포',`IBK/FIN MAP · 기준 ${DATA_FRESHNESS.branch.date}`,'CONNECTED'],['인구·고령층 통계',`${DATA_FRESHNESS.population.source} · 기준 ${DATA_FRESHNESS.population.date}`,'VALIDATED'],['점포 방문수',`은행 내부 · 기준 ${DATA_FRESHNESS.visit.date}(데모)`,'UPLOADED'],['대면서비스 의존도',`은행 내부 · 기준 ${DATA_FRESHNESS.face.date}(데모)`,'PARTIAL'],['고객 설문 응답',`BranchFit Survey · 기준 ${DATA_FRESHNESS.opinion.date}(데모)`,'CONNECTED']];el.innerHTML=sets.map(s=>`<div class="dataset"><div><b>${s[0]}</b><small>${s[1]}</small></div><span class="status ${s[2]==='PARTIAL'?'warn':'ok'}">${s[2]}</span></div>`).join('')}

window.addEventListener('load',()=>{refreshFreshnessStrips();applyBackofficeStructure();renderCaseHistory();renderAlerts();bindMapFilters();initMap();bindPostAI();bindPostCase();renderCaseStorage();refreshDatasetList()});
