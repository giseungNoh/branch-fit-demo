const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const branches=[
{id:'IBK-001',name:'역삼중앙',district:'강남구',visits:4280,elderly:18.7,freq:1.12,face:29,score:61},
{id:'IBK-002',name:'삼성역',district:'강남구',visits:3520,elderly:16.8,freq:.91,face:24,score:54},
{id:'IBK-003',name:'명동역',district:'중구',visits:3180,elderly:22.5,freq:.82,face:27,score:67},
{id:'IBK-004',name:'신당역',district:'중구',visits:2410,elderly:24.9,freq:.66,face:35,score:78},
{id:'IBK-005',name:'무교',district:'중구',visits:2890,elderly:20.1,freq:.73,face:31,score:71},
{id:'IBK-006',name:'종로',district:'종로구',visits:2260,elderly:23.8,freq:.64,face:37,score:82},
{id:'IBK-007',name:'인사동',district:'종로구',visits:2640,elderly:22.1,freq:.72,face:34,score:74},
{id:'IBK-008',name:'문래동',district:'영등포구',visits:3370,elderly:19.2,freq:.88,face:28,score:58},
{id:'IBK-009',name:'당산동',district:'영등포구',visits:3010,elderly:18.4,freq:.79,face:26,score:55},
{id:'IBK-010',name:'대림동',district:'영등포구',visits:2180,elderly:21.8,freq:.61,face:33,score:76},
{id:'IBK-011',name:'성수동',district:'성동구',visits:3660,elderly:17.5,freq:.95,face:23,score:49},
{id:'IBK-012',name:'성수희망',district:'성동구',visits:2460,elderly:19.9,freq:.68,face:30,score:69}
];
const districts={강남구:{pop:'564,873명',elderly:'17.8%'},중구:{pop:'131,312명',elderly:'22.4%'},종로구:{pop:'150,215명',elderly:'23.1%'},영등포구:{pop:'397,802명',elderly:'19.6%'},성동구:{pop:'282,211명',elderly:'18.5%'}};
let state={district:'중구',branch:'IBK-004'};
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1900)}
function gotoView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));$('#topTitle').textContent=({dashboard:'대시보드',status:'현황분석',candidates:'후보점포 분석',assessment:'사전영향평가',opinions:'고객 의견 수렴',post:'사후영향평가',data:'데이터 관리'})[id]||'BranchFit';window.scrollTo({top:0,behavior:'smooth'});$('#sidebar').classList.remove('open')}
$$('#nav button').forEach(b=>b.onclick=()=>gotoView(b.dataset.view));$$('[data-goto]').forEach(b=>b.onclick=()=>gotoView(b.dataset.goto));$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');
$('#sourceBtn').onclick=()=>toast('근거자료: 금융위 점포폐쇄 대응방안 · 은행연합회 공동절차 · 공공/내부 데이터');
function fmt(n){return n.toLocaleString('ko-KR')+'명'}
function options(){const ds=Object.keys(districts);const dhtml=ds.map(d=>`<option ${d===state.district?'selected':''}>${d}</option>`).join('');$('#districtSelect').innerHTML=dhtml;$('#candidateDistrict').innerHTML='<option value="전체">전체 자치구</option>'+dhtml;const bhtml=branches.map(b=>`<option value="${b.id}">${b.name} · ${b.district}</option>`).join('');$('#assessmentBranch').innerHTML=bhtml;$('#surveyBranch').innerHTML=bhtml;$('#assessmentBranch').value=state.branch;$('#surveyBranch').value=state.branch}
function renderProgress(){const rows=[['현황분석','완료'],['후보점포 우선순위','완료'],['사전영향평가','진행 중'],['고객 의견 수렴','대기'],['사후영향평가','향후']];$('#progressList').innerHTML=rows.map(r=>`<div><b>${r[0]}</b><span>${r[1]}</span></div>`).join('')}
function districtBranches(d){return branches.filter(b=>b.district===d)}
function renderStatus(){const list=districtBranches(state.district),meta=districts[state.district];$('#districtPop').textContent=meta.pop;$('#districtElderly').textContent=meta.elderly;$('#districtBranches').textContent=list.length+'개';const avg=Math.round(list.reduce((a,b)=>a+b.visits,0)/list.length);const face=Math.round(list.reduce((a,b)=>a+b.face,0)/list.length);$('#mCustomers').textContent=fmt(avg);$('#mVulnerable').textContent=meta.elderly;$('#mFrequency').textContent=(list.reduce((a,b)=>a+b.freq,0)/list.length).toFixed(2)+'배';$('#mFace').textContent=face+'%';$('#statusRows').innerHTML=list.map(b=>`<tr><td><b>${b.name}</b></td><td>${fmt(b.visits)}</td><td>${b.elderly}%</td><td>${b.freq.toFixed(2)}배</td><td>${b.face}%</td></tr>`).join('');const low=[...list].sort((a,b)=>a.visits-b.visits)[0];$('#statusInsight').innerHTML=`<b>${state.district} 현황 요약</b><ul><li>지역 내 ${list.length}개 데모 점포를 비교합니다.</li><li>월평균 방문량이 가장 낮은 점포는 <b>${low.name}</b> (${fmt(low.visits)})입니다.</li><li>이용빈도·고령층·대면서비스 의존도는 단독으로 폐쇄 여부를 결정하는 기준이 아니라, <b>후속 사전영향평가 대상 선별을 위한 현황정보</b>입니다.</li></ul>`}
$('#districtSelect').onchange=e=>{state.district=e.target.value;renderStatus();$('#candidateDistrict').value=state.district;renderCandidates()};
function priority(b){return Math.round((1-b.freq)*45+b.elderly*.9+b.face*.8)}
function renderCandidates(){let list=$('#candidateDistrict').value==='전체'?branches:districtBranches($('#candidateDistrict').value);const sort=$('#candidateSort').value;if(sort==='visit')list=[...list].sort((a,b)=>a.visits-b.visits);else if(sort==='elderly')list=[...list].sort((a,b)=>b.elderly-a.elderly);else list=[...list].sort((a,b)=>priority(b)-priority(a));$('#candidateRows').innerHTML=list.map((b,i)=>`<tr><td><b>${i+1}</b></td><td><b>${b.name}</b><br><small>${b.district}</small></td><td>${fmt(b.visits)}</td><td>${Math.round((b.freq-1)*100)}%</td><td>${b.elderly}%</td><td>${b.face}%</td><td><span class="status ${i<2?'warn':'ok'}">${i<2?'우선 검토':'일반 검토'}</span></td><td><button class="btn" data-assess="${b.id}">사전평가</button></td></tr>`).join('');$$('[data-assess]').forEach(x=>x.onclick=()=>{state.branch=x.dataset.assess;$('#assessmentBranch').value=state.branch;renderAssessment();gotoView('assessment')})}
$('#candidateDistrict').onchange=renderCandidates;
$('#candidateSort').onchange=renderCandidates;
function selected(){return branches.find(b=>b.id===state.branch)||branches[0]}
function impactLevel(score){return score>=75?'높음':score>=55?'중간':'낮음'}
function renderAssessment(){const b=selected();$('#impactScore').textContent=b.score+'점';$('#impactLevel').textContent=impactLevel(b.score);const items=[['점포 이용현황',fmt(b.visits),'확인'],['취약계층 현황',b.elderly+'%','확인'],['점포 이용빈도',b.freq.toFixed(2)+'배','확인'],['대면서비스 의존도',b.face+'%','확인'],['최근접 동일은행 점포','3.2km · 데모','확인'],['고객·지역 의견','아직 수집 전','미수집']];$('#assessmentItems').innerHTML=items.map(x=>`<div class="assessment-item"><div><b>${x[0]}</b><small>${x[1]}</small></div><span class="status ${x[2]==='확인'?'ok':'unknown'}">${x[2]}</span></div>`).join('');$('#aiAssessment').className='ai-summary muted';$('#aiAssessment').textContent='AI 분석 버튼을 누르면 평가결과와 규정 근거를 함께 해석합니다.';$('#directionBox').innerHTML='<b>분석 전</b><p>평가결과를 바탕으로 검토방향을 생성합니다.</p>';renderAlternatives(b)}
$('#assessmentBranch').onchange=e=>{state.branch=e.target.value;renderAssessment()};
function renderAlternatives(b){const high=impactLevel(b.score)==='높음';const alts=high?[['공동·소규모점포','대면서비스 유지 가능성 우선 검토'],['이동점포','지역별 정기 운영 검토'],['인근점포 통합','거리·혼잡도 추가 확인']]:[['인근점포 통합','접근성과 서비스 범위 확인'],['이동점포','필요 시 보완 채널'],['ATM·STM','저영향 업무의 보완 수단']];$('#alternativeCards').innerHTML=alts.map((a,i)=>`<div class="alt"><span class="tag ${i===0?'blue':''}">${i+1}순위 검토</span><b>${a[0]}</b><small>${a[1]}</small></div>`).join('')}
$('#aiAnalyzeBtn').onclick=()=>{const b=selected(),level=impactLevel(b.score);$('#aiAssessment').className='ai-summary';$('#aiAssessment').innerHTML=`<b>${b.name} · 영향도 ${level}</b><p>월평균 이용량은 ${fmt(b.visits)}, 인근점포 대비 이용수준은 ${b.freq.toFixed(2)}배이며 대면서비스 의존도는 ${b.face}%입니다. 관련 사전영향평가 절차상 금융접근성 및 대체수단의 충분성을 함께 검토해야 합니다.</p><p><b>RAG 근거:</b> 금융위 점포폐쇄 대응방안 및 은행연합회 공동절차 관련 문단을 연결하는 데모입니다.</p>`;$('#directionBox').innerHTML=`<b>${level==='높음'?'대체수단 확보 후 신중 검토':level==='중간'?'통합 가능성 + 대체수단 병행 검토':'통합 가능성 검토'}</b><p>AI는 최종 폐쇄를 결정하지 않고, 평가 결과와 규정 근거를 바탕으로 담당자가 확인할 방향을 설명합니다.</p>`;toast('AI 근거 분석을 생성했습니다')};
function bars(el,vals,labels){$(el).innerHTML=vals.map((v,i)=>`<i style="height:${v}%"><span>${labels[i]||''}</span></i>`).join('')}
function surveyTemplate(){const b=selected();return `${b.name} 점포 통·폐합 검토 관련 고객 의견조사\n\n1. 현재 해당 점포를 얼마나 자주 이용하십니까?\n2. 해당 점포가 통합될 경우 예상되는 불편 정도는 어느 정도입니까?\n3. 가장 대체하기 어려운 업무는 무엇입니까?\n4. 이용 가능한 대체수단 중 선호하는 방식은 무엇입니까?\n5. 대체점포까지 이동 가능한 거리는 어느 정도입니까?\n6. 추가로 전달하고 싶은 의견을 자유롭게 작성해 주세요.`}
$('#generateSurvey').onclick=()=>{state.branch=$('#surveyBranch').value;$('#surveyText').value=surveyTemplate();toast('AI 설문 초안을 생성했습니다')};$('#copySurvey').onclick=()=>{navigator.clipboard?.writeText($('#surveyText').value);toast('설문 템플릿을 복사했습니다')};$('#sendSurvey').onclick=()=>{if(!$('#surveyText').value.trim())return toast('먼저 설문을 생성해 주세요');$('#sentCount').textContent='1,420';$('#responseCount').textContent='512';$('#responseRate').textContent='36.1%';toast('데모: 고객 설문 발송을 완료했습니다')};$('#analyzeOpinions').onclick=()=>{$('#opinionSummary').innerHTML='<b>AI 고객의견 분석</b><p>응답자의 68%가 통·폐합 시 불편을 예상했습니다. 자유의견에서는 <b>대체점포 이동거리, 고령층의 디지털 이용 어려움, 대면상담 필요성</b>이 반복적으로 나타났습니다.</p><p>다음 검토에서는 공동점포 또는 대면지원이 가능한 대체수단의 서비스 범위를 우선 확인하는 것이 필요합니다.</p>';toast('고객 응답을 분석했습니다')};
function renderDatasets(){const sets=[['점포 좌표·타행점포','금융결제원/공공 API','CONNECTED'],['인구·고령층 통계','공공데이터','VALIDATED'],['점포 방문수','은행 내부 업로드','UPLOADED'],['대면서비스 의존도','은행 내부 업로드','PARTIAL'],['고객 설문 응답','BranchFit Survey','CONNECTED']];$('#datasetList').innerHTML=sets.map(s=>`<div class="dataset"><div><b>${s[0]}</b><small>${s[1]}</small></div><span class="status ${s[2]==='PARTIAL'?'warn':'ok'}">${s[2]}</span></div>`).join('')}
$('#dataFile').onchange=e=>{const f=e.target.files[0];if(!f)return;$('#mappingPreview').innerHTML=`<div><b>${f.name}</b> 업로드 감지</div><div>AI 매핑 제안: <b>영업점명 → branch_name</b></div><div>AI 매핑 제안: <b>내점고객 → visit_count</b></div><div>다음 단계: 사용자 확인 → Python ETL → Validation → PostgreSQL</div>`;toast('AI 컬럼 매핑 초안을 생성했습니다')};

function renderPostSection(){
 const post=$('#post'); if(!post) return;
 post.innerHTML=`
  <div class="pagehead"><div><h1>사후영향평가</h1><p>통·폐합 이후 고객 불편, 대체점포 혼잡, 대체수단 운영성과를 폐점 전과 비교해 후속 조치 필요 여부를 확인합니다.</p></div><span class="tag purple">Post-Impact Monitoring</span></div>
  <div class="callout"><b>공식 절차의 목적</b>은 폐점 이후 소비자 불편과 대체수단의 적정성을 다시 확인하고, 필요한 경우 대체수단을 보완하는 것입니다. 아래 수치와 경보 기준은 <b>BranchFit 데모용 모니터링 지표</b>이며 공식 전국 공통 점수 기준이 아닙니다.</div>

  <div class="card pad" style="margin-top:16px;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:16px;align-items:end">
    <div><label>통·폐합 완료 점포</label><select id="postBranch"><option>신당역 · 중구</option><option>종로 · 종로구</option><option>대림동 · 영등포구</option></select></div>
    <div><label>평가 기준 기간</label><select id="postPeriod"><option>폐점 후 12주</option><option>폐점 후 1개월</option><option>폐점 후 3개월</option><option>폐점 후 6개월</option></select></div>
    <div><span style="font-size:12px;color:#6b7a90">현재 상태</span><div style="margin-top:7px"><span class="status warn">모니터링 필요</span></div></div>
  </div>

  <div class="kpis" style="margin-top:16px">
    <div class="card kpi"><span>대체점포 방문량</span><strong>+38%</strong><small>3,100 → 4,280건</small></div>
    <div class="card kpi"><span>평균 대기시간</span><strong>+6분</strong><small>8분 → 14분</small></div>
    <div class="card kpi"><span>월 고객 민원</span><strong>+187%</strong><small>8건 → 23건</small></div>
    <div class="card kpi"><span>대체수단 이용률</span><strong>61%</strong><small>공동점포 기준 · 데모</small></div>
  </div>

  <div class="grid two" style="margin-top:16px">
    <div class="card pad">
      <div class="card-title">폐점 전 · 후 핵심 변화</div>
      <div class="tablewrap"><table><thead><tr><th>지표</th><th>폐점 전</th><th>폐점 후</th><th>변화</th><th>상태</th></tr></thead><tbody>
        <tr><td><b>대체점포 월 방문량</b></td><td>3,100건</td><td>4,280건</td><td>+38%</td><td><span class="status warn">확인 필요</span></td></tr>
        <tr><td><b>평균 대기시간</b></td><td>8분</td><td>14분</td><td>+6분</td><td><span class="status warn">모니터링</span></td></tr>
        <tr><td><b>월 민원/VOC</b></td><td>8건</td><td>23건</td><td>+187%</td><td><span class="status warn">증가</span></td></tr>
        <tr><td><b>평균 대체점포 접근거리</b></td><td>0.4km</td><td>2.8km</td><td>+2.4km</td><td><span class="status warn">증가</span></td></tr>
        <tr><td><b>핵심 창구업무 제공</b></td><td>10/10</td><td>8/10</td><td>-2개</td><td><span class="status unknown">공백 확인</span></td></tr>
      </tbody></table></div>
    </div>
    <div class="card pad">
      <div class="card-title">12주 운영 추이 <span class="tag">대체점포 방문량</span></div>
      <div class="bar-chart" id="postChart"></div>
      <p style="margin:14px 0 0;color:#6b7a90;font-size:12px;line-height:1.6">폐점 후 인근 대체점포로 이용량이 이동하는지 확인합니다. 실제 운영에서는 방문로그·번호표·창구거래 집계와 연결합니다.</p>
    </div>
  </div>

  <div class="grid two" style="margin-top:16px">
    <div class="card pad">
      <div class="card-title">대체수단 운영 현황</div>
      <div class="tablewrap"><table><thead><tr><th>대체수단</th><th>운영</th><th>이용 현황</th><th>업무 커버리지</th><th>조치</th></tr></thead><tbody>
        <tr><td><b>공동점포</b><br><small>1.2km</small></td><td><span class="status ok">정상</span></td><td>월 1,240건</td><td>8/10 업무</td><td>기업금융 확인</td></tr>
        <tr><td><b>인근 IBK 점포</b><br><small>2.8km</small></td><td><span class="status ok">정상</span></td><td>+38%</td><td>10/10 업무</td><td>혼잡도 관찰</td></tr>
        <tr><td><b>ATM/STM</b><br><small>0.3km</small></td><td><span class="status ok">정상</span></td><td>월 890건</td><td>3/10 업무</td><td>보완채널</td></tr>
      </tbody></table></div>
    </div>
    <div class="card pad">
      <div class="card-title">고객 불편 · VOC 모니터링</div>
      <div class="checklist">
        <div>! 대체점포 이동거리 관련 불편 <span class="warnText">11건</span></div>
        <div>! 대기시간 증가 관련 불편 <span class="warnText">7건</span></div>
        <div>! 대면상담 업무 공백 <span class="warnText">4건</span></div>
        <div>✓ 대체수단 운영중단 신고 <span>0건</span></div>
      </div>
      <div class="ai-summary" style="margin-top:12px"><b>주요 고객 신호</b><p>불편 의견은 이동거리와 대기시간에 집중되어 있습니다. 단순 민원 건수뿐 아니라 자유의견 유형과 반복 주제를 함께 확인합니다.</p></div>
    </div>
  </div>

  <div class="grid two" style="margin-top:16px">
    <div class="card pad">
      <div class="card-title">사후평가 체크리스트</div>
      <div class="assessment-items">
        <div class="assessment-item"><div><b>소비자 불편 지속 여부</b><small>민원·VOC·사후설문 확인</small></div><span class="status warn">REVIEW</span></div>
        <div class="assessment-item"><div><b>대체수단 적정성</b><small>업무범위·운영시간·직원상주 여부</small></div><span class="status warn">REVIEW</span></div>
        <div class="assessment-item"><div><b>대체점포 수용 가능성</b><small>방문량·대기시간 변화</small></div><span class="status warn">REVIEW</span></div>
        <div class="assessment-item"><div><b>대체수단 정상 운영</b><small>운영중단 및 이용 가능 여부</small></div><span class="status ok">PASS</span></div>
        <div class="assessment-item"><div><b>추가 보완 필요 여부</b><small>대체점포 재지정·채널 추가 검토</small></div><span class="status unknown">판단 필요</span></div>
      </div>
    </div>
    <div class="card pad">
      <div class="card-title">AI 사후영향 분석 <span class="tag blue">근거 요약</span></div>
      <div id="postAiSummary" class="ai-summary muted">AI 분석 버튼을 누르면 폐점 전·후 변화, 고객 불편, 대체수단 운영 데이터를 종합해 후속 검토사항을 정리합니다.</div>
      <button class="btn primary full" id="postAiBtn">AI 사후영향 분석</button>
    </div>
  </div>

  <div class="card pad" style="margin-top:16px">
    <div class="card-title">필요 데이터 및 연동 상태</div>
    <div class="tablewrap"><table><thead><tr><th>데이터</th><th>사용 목적</th><th>예상 원천</th><th>상태</th></tr></thead><tbody>
      <tr><td>대체점포 방문량</td><td>고객 이동·혼잡도</td><td>번호표/방문 로그</td><td><span class="status ok">연동 가능</span></td></tr>
      <tr><td>평균 대기시간</td><td>서비스 품질 변화</td><td>대기열 시스템</td><td><span class="status warn">내부 필요</span></td></tr>
      <tr><td>민원/VOC</td><td>실제 고객 불편</td><td>VOC·콜센터·설문</td><td><span class="status warn">내부 필요</span></td></tr>
      <tr><td>대체채널 이용량</td><td>대체수단 실효성</td><td>공동점포/ATM/STM 로그</td><td><span class="status warn">내부 필요</span></td></tr>
      <tr><td>접근거리</td><td>금융접근성 변화</td><td>점포/채널 좌표 + PostGIS</td><td><span class="status ok">계산 가능</span></td></tr>
    </tbody></table></div>
  </div>`;

 $('#postPeriod').onchange=()=>toast($('#postPeriod').value+' 기준으로 조회했습니다');
 $('#postBranch').onchange=()=>toast($('#postBranch').value+' 사후평가를 불러왔습니다');
 $('#postAiBtn').onclick=()=>{const out=$('#postAiSummary');out.className='ai-summary';out.innerHTML='<b>모니터링 필요</b><p>폐점 후 대체점포 방문량(+38%)과 평균 대기시간(+6분), 고객 민원이 함께 증가했습니다. 특히 이동거리와 대기시간 관련 VOC가 반복되고 있어 현재 대체수단이 고객 불편을 충분히 해소하는지 추가 확인이 필요합니다.</p><p><b>후속 검토:</b> 공동점포의 기업금융 등 미제공 업무 확인 → 대체점포 혼잡 완화 방안 → 필요 시 대체수단 추가 또는 재지정 검토.</p><p><b>주의:</b> 이 요약은 BranchFit 데모 모니터링 지표를 해석한 것이며 공식 판정이나 자동 조치 명령이 아닙니다.</p>';toast('AI 사후영향 분석을 생성했습니다')};
 bars('#postChart',[48,52,58,63,67,72,78,82,86,89,91,93],['1주','2주','3주','4주','5주','6주','7주','8주','9주','10주','11주','12주']);
}

function init(){options();renderProgress();renderStatus();$('#candidateDistrict').value=state.district;renderCandidates();renderAssessment();renderDatasets();bars('#surveyBars',[34,46,55,63,71,78],['1일','2일','3일','4일','5일','6일']);renderPostSection()}
init();