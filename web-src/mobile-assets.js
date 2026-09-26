document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link)return;
  const path=link.getAttribute('href');
  if(!path||!path.startsWith('历年试卷/'))return;
  if(/\.pdf$/i.test(path)){
    event.preventDefault();
    location.href='viewer.html?file='+encodeURIComponent(path);
  }else if(/\.mp3$/i.test(path)){
    event.preventDefault();
    location.href='viewer.html?audio='+encodeURIComponent(path);
  }
});
