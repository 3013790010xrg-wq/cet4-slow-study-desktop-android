// 离线规则式写作反馈。仅能识别明确模式，估分不是 CET 官方或人工阅卷分数。
function gradeEssay(raw, task = {}) {
  const text = String(raw || '').trim();
  const words = text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
  const wordCount = words.length;
  if (!wordCount) return {score:0, parts:{task:0,organization:0,language:0,mechanics:0},wordCount:0,issues:[],corrected:'',notes:['先写一句简单英文，再点检查。']};
  const issues=[];
  let corrected=text;
  const addRule=(re,replacement,message,category='language')=>{
    const hits=[...corrected.matchAll(re)];
    for(const hit of hits.slice(0,5)){
      const before=hit[0];
      const after=before.replace(new RegExp(re.source,re.flags.replace('g','')),replacement);
      if(before!==after)issues.push({before,after,message,category});
    }
    corrected=corrected.replace(re,replacement);
  };
  const spelling={becasue:'because',enviroment:'environment',environement:'environment',importent:'important',studnets:'students',univercity:'university',univerisity:'university',imporve:'improve',govenment:'government',teh:'the',recieve:'receive',definately:'definitely',seperate:'separate',convinient:'convenient',reserch:'research',oppertunity:'opportunity',sucess:'success',succesful:'successful',communcation:'communication',differnt:'different',advices:'advice',informations:'information',equipments:'equipment',knowledges:'knowledge',writting:'writing',grammer:'grammar',althought:'although',thier:'their',wich:'which',wether:'whether',peoples:'people'};
  for(const [wrong,right] of Object.entries(spelling))addRule(new RegExp('\\b'+wrong+'\\b','gi'),()=>right,`拼写或词形：${wrong} → ${right}`,'mechanics');
  const rules=[
    [/\bI am agree\b/gi,'I agree','agree 已是动词，不需要 am。'],
    [/\bI very like\b/gi,'I really like','very 不能直接修饰动词 like，可用 really。'],
    [/\bmore better\b/gi,'better','better 本身是比较级，不再加 more。'],
    [/\b(we|they|students) should to\b/gi,(_,p)=>`${p} should`,'情态动词 should 后接动词原形，不加 to。'],
    [/\b(can|must|should) to\b/gi,(_,p)=>p,'情态动词后直接接动词原形。'],
    [/\bdiscuss about\b/gi,'discuss','discuss 后可直接接讨论对象。'],
    [/\bpeople is\b/gi,'people are','people 作复数，配 are。'],
    [/\bstudents is\b/gi,'students are','students 作复数，配 are。'],
    [/\bthey is\b/gi,'they are','they 配 are。'],
    [/\bwe is\b/gi,'we are','we 配 are。'],
    [/\b(he|she|it) have\b/gi,(_,p)=>`${p} has`,'he/she/it 在一般现在时配 has。'],
    [/\b(he|she|it) go\b/gi,(_,p)=>`${p} goes`,'he/she/it 在一般现在时用 goes。'],
    [/\b(it|this) help\b/gi,(_,p)=>`${p} helps`,'单数主语在一般现在时用 helps。'],
    [/\b(it|this) make\b/gi,(_,p)=>`${p} makes`,'单数主语在一般现在时用 makes。'],
    [/\bI thinks\b/gi,'I think','I 后接 think。'],
    [/\bthere is many\b/gi,'there are many','many 后通常是复数名词，用 there are。'],
    [/\bmany student\b(?!s)/gi,'many students','many 后用复数 students。'],
    [/\bmuch students\b/gi,'many students','students 可数，用 many。'],
    [/\bevery students\b/gi,'every student','every 后用单数名词。'],
    [/\bone of the student\b(?!s)/gi,'one of the students','one of the 后接复数名词。'],
    [/\ba (apple|idea|example|important|interesting|online|old|effective)\b/gi,(_,p)=>`an ${p}`,'元音音素开头的词前通常用 an。'],
    [/\ban (university|useful|student|robot|computer)\b/gi,(_,p)=>`a ${p}`,'这些词前应使用 a。'],
    [/\b(the|a|an|to|and|is|are)\s+\1\b/gi,(_,p)=>p,'重复词可以删去一个。']
  ];
  for(const [re,replacement,message] of rules)addRule(re,replacement,message);
  addRule(/\bi\b/g,'I','英语中的“我”始终大写。','mechanics');
  addRule(/(^|[.!?]\s+)([a-z])/g,(_,before,letter)=>before+letter.toUpperCase(),'句首单词应大写。','mechanics');
  if(!/[.!?]$/.test(corrected)){
    issues.push({before:'句末',after:'加句号',message:'完整英文句子末尾要有标点。',category:'mechanics'});
    corrected+='.';
  }
  const sentences=text.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);
  if(sentences.some(s=>(s.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)||[]).length>36))
    issues.push({before:'过长的句子',after:'拆成两句',message:'有句子超过 36 词。尝试在 and、but 或 because 附近拆句。',category:'organization'});
  const keywordList=(task.keywords||[]).map(s=>String(s).toLowerCase());
  const lower=text.toLowerCase();
  const topicHits=keywordList.filter(w=>new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i').test(text)).length;
  const longTarget=task.exam!==false;
  const minWords=longTarget?120:60,maxWords=longTarget?180:120;
  const notes=[];
  if(wordCount<minWords)notes.push(`目前 ${wordCount} 词；这道题建议写到 ${minWords}–${maxWords} 词。先补一个理由和一个例子。`);
  if(wordCount>maxWords)notes.push(`目前 ${wordCount} 词；建议删去重复内容，控制在 ${minWords}–${maxWords} 词。`);
  if(keywordList.length&&topicHits===0)notes.push('没有识别到题目关键词，请检查是否回应了题目。关键词检测不能判断意思相近的表达。');
  if(sentences.length<3)notes.push('建议至少写三句：观点、理由或例子、结尾。');
  if(!issues.length)notes.push('未发现规则库能识别的常见错误；这不代表没有其他语法或内容问题。');
  const transition=/\b(first|second|also|however|therefore|moreover|for example|because|finally|in conclusion|in my view)\b/i.test(text);
  const conclusion=/\b(in conclusion|overall|therefore|in my view|i believe|i hope)\b/i.test(text);
  const paragraphCount=text.split(/\n\s*\n/).filter(Boolean).length;
  let taskScore=wordCount>=minWords&&wordCount<=maxWords?3:wordCount>=minWords*.65?2:wordCount>=20?1:0;
  if(topicHits>0||!keywordList.length)taskScore=Math.min(4,taskScore+1);
  let organization=Math.min(3,(sentences.length>=3?1:0)+(transition?1:0)+(paragraphCount>=2||conclusion?1:0));
  const languageIssues=issues.filter(i=>i.category==='language').length;
  let language=Math.max(0,5-Math.ceil(languageIssues/2));
  if(wordCount<20)language=Math.min(language,2);
  const mechanicalIssues=issues.filter(i=>i.category==='mechanics').length;
  let mechanics=Math.max(0,3-Math.ceil(mechanicalIssues/2));
  const score=taskScore+organization+language+mechanics;
  return {score,parts:{task:taskScore,organization,language,mechanics},wordCount,issues:issues.slice(0,18),corrected,notes};
}

function gradeReportHtml(result){
  const esc=typeof escapeHtml==='function'?escapeHtml:s=>String(s);
  return `<div class="grade-report"><div class="grade-head"><div><span class="eyebrow">离线练习估分 · 非官方</span><strong>${result.score}<small> / 15</small></strong></div><span>${result.wordCount} 词</span></div><div class="grade-parts"><span>切题与完成 ${result.parts.task}/4</span><span>结构 ${result.parts.organization}/3</span><span>语言 ${result.parts.language}/5</span><span>拼写标点 ${result.parts.mechanics}/3</span></div>${result.notes.map(n=>`<p class="grade-note">${esc(n)}</p>`).join('')}<h3>可以先修改这些地方</h3>${result.issues.length?`<ol class="issue-list">${result.issues.map(i=>`<li><del>${esc(i.before)}</del> → <b>${esc(i.after)}</b><small>${esc(i.message)}</small></li>`).join('')}</ol>`:'<p>暂无规则库能识别的常见错误。</p>'}<details><summary>查看套用明确规则后的文本</summary><p class="corrected-text">${esc(result.corrected)}</p></details><p class="grade-limit">只检查部分拼写、词形、基础语法、字数和结构；无法可靠判断论证质量或所有语法错误。请据建议修改后再检查一次。</p></div>`;
}

document.addEventListener('click',e=>{
  if(e.target.id!=='gradeWriting')return;
  const textarea=document.querySelector('#myWriting');
  if(!textarea||!current||current.kind!=='writing')return;
  const task=WRITING[current.index];
  state.writing[current.index]=textarea.value;
  save();
  const key=task.keywords||(task.words.match(/[A-Za-z]+/g)||[]).slice(0,3);
  const result=gradeEssay(textarea.value,{keywords:key,exam:!!task.exam});
  document.querySelector('#gradeResult').innerHTML=gradeReportHtml(result);
});
