import * as pdfjsLib from './vendor/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc='./vendor/pdf.worker.mjs';
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const file=params.get('file'),audio=params.get('audio');
let pdf=null,page=1,scale=1,busy=false;
const valid=value=>value&&value.startsWith('历年试卷/')&&!value.includes('..')&&!value.includes('\\')&&/\.(pdf|mp3)$/i.test(value);
function message(text){$('status').textContent=text;$('status').hidden=!text}
async function render(){
  if(!pdf||busy)return;
  busy=true;
  try{
    message('正在显示第 '+page+' 页…');
    const p=await pdf.getPage(page);
    const fit=Math.min(1.7,(Math.max(320,window.innerWidth)-40)/p.getViewport({scale:1}).width);
    const ratio=Math.min(devicePixelRatio||1,2);
    const viewport=p.getViewport({scale:fit*scale*ratio});
    const canvas=$('paper');canvas.width=Math.round(viewport.width);canvas.height=Math.round(viewport.height);
    canvas.style.width=Math.round(viewport.width/ratio)+'px';canvas.style.height=Math.round(viewport.height/ratio)+'px';
    await p.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
    $('pageInfo').textContent=page+' / '+pdf.numPages;
    $('prev').disabled=page<=1;$('next').disabled=page>=pdf.numPages;
    message('');
  }catch(error){message('这一页暂时无法显示：'+error.message)}finally{busy=false}
}
if(audio&&valid(audio)&&/\.mp3$/i.test(audio)){
  $('title').textContent='听力音频';$('audioBox').hidden=false;$('audio').src=audio;message('');
}else if(file&&valid(file)&&/\.pdf$/i.test(file)){
  $('title').textContent=file.split('/').pop();$('pdfBox').hidden=false;
  try{pdf=await pdfjsLib.getDocument({url:file,cMapUrl:'./vendor/cmaps/',cMapPacked:true,standardFontDataUrl:'./vendor/standard_fonts/'}).promise;await render()}
  catch(error){message('无法打开试卷：'+error.message)}
  $('prev').onclick=()=>{if(page>1){page--;render()}};
  $('next').onclick=()=>{if(pdf&&page<pdf.numPages){page++;render()}};
  $('smaller').onclick=()=>{scale=Math.max(.65,scale/1.25);render()};
  $('larger').onclick=()=>{scale=Math.min(2.5,scale*1.25);render()};
}else message('资料地址无效，请返回学习页面。');
