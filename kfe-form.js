/* Kronos native forms — careers "Apply" and investor access request. Posts to the Kronos contact function. v1.1 (2026-10-20).
   Include on any page after kfe-shell.js:  <script src="/kfe-form.js" defer></script>
   Careers: enhances the existing .apply block (Google Form link kept as fallback). Investors: renders into .kfe-form-mount[data-inquiry]. */
(function(){
  var FN='https://nbylepiqprkqblgghifh.supabase.co/functions/v1/submit-contact';
  var KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ieWxlcGlxcHJrcWJsZ2doaWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODUyMzYsImV4cCI6MjA5NjU2MTIzNn0.5svyfFH5BbVmRmpH9RivjtCrJ1fsjGrZah2ugJCCk1Q';
  function esc(s){return (''+s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function field(label,inner){return '<label>'+label+inner+'</label>';}
  function build(o){
    var html='<form class="kfe-form" novalidate data-inquiry="'+esc(o.inquiry)+'">'+
      '<div class="kfe-form-row">'+field('Name','<input name="name" required maxlength="200" autocomplete="name">')+field('Email','<input type="email" name="email" required maxlength="200" autocomplete="email">')+'</div>'+
      (o.org?field(o.org,'<input name="organization" maxlength="300" autocomplete="organization">'):'')+
      (o.link?field(o.link,'<input type="url" name="link" maxlength="300" placeholder="https://">'):'')+
      field(o.prompt,'<textarea name="message" required maxlength="4000" rows="6"></textarea>')+
      '<input class="kfe-hp" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true">'+
      '<button type="submit">'+esc(o.button)+'</button>'+
      (o.note?'<p class="kfe-form-note">'+o.note+'</p>':'')+
      '<p class="kfe-form-status" aria-live="polite"></p></form>';
    var wrap=document.createElement('div'); wrap.innerHTML=html; var f=wrap.firstChild;
    f.addEventListener('submit',function(ev){
      ev.preventDefault(); var st=f.querySelector('.kfe-form-status'), b=f.querySelector('button');
      var g=function(n){var el=f.querySelector('[name="'+n+'"]');return el?el.value.trim():'';};
      if(g('company_website')){st.textContent='';return;}
      if(!g('name')||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g('email'))||!g('message')){st.setAttribute('data-state','err');st.textContent='Please add your name, a valid email and a message.';return;}
      b.disabled=true; st.removeAttribute('data-state'); st.textContent='Sending…';
      var msg=(o.prefix||'')+(g('link')?'Link: '+g('link')+'\n':'')+(o.prefix||g('link')?'\n':'')+g('message');
      fetch(FN,{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+KEY},body:JSON.stringify({name:g('name'),email:g('email'),organization:g('organization'),inquiry:o.inquiry,message:msg,source:o.source})})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(x){ if(!x.ok) throw new Error((x.j&&x.j.error)||'send failed');
        f.querySelectorAll('input,textarea,button').forEach(function(el){el.closest('label')?el.closest('label').remove():el.remove();}); var n=f.querySelector('.kfe-form-note'); if(n)n.remove();
        st.setAttribute('data-state','ok'); st.innerHTML=o.thanks; try{document.dispatchEvent(new CustomEvent('kfe:form-sent',{detail:{inquiry:o.inquiry}}));}catch(e){} })
      .catch(function(){ b.disabled=false; st.setAttribute('data-state','err'); st.innerHTML='That didn’t go through. '+(o.fallback||'Please use the <a href="/contact">contact page</a>.'); });
    });
    return f;
  }
  function careers(){
    var apply=document.querySelector('.apply'); if(!apply||!/Careers/.test(document.title))return;
    var role=(document.title.split(/\s[—–-]\s/)[0]||'').trim(); if(!role)return;
    var gf=apply.querySelector('a.applybtn'); var gurl=gf?gf.getAttribute('href'):'';
    var slug=location.pathname.replace(/\/index\.html$|\.html$|\/$/,'').split('/').pop()||'role';
    var intro=apply.querySelector('p'); if(intro)intro.textContent='Apply here in a minute: your note and a link to your work go straight to the team.';
    if(gf)gf.remove();
    apply.appendChild(build({inquiry:'careers',source:'careers:'+slug,org:'',link:'LinkedIn, portfolio or CV link (optional)',prompt:'Why this role, and what you have built',button:'Send application →',
      prefix:'Role: '+role+'\n',note:gurl?'Prefer a form? <a href="'+esc(gurl)+'" target="_blank" rel="noopener">Apply via Google Forms ↗</a>':'',
      thanks:'Thank you — your application for <b>'+esc(role)+'</b> reached the team. We reply to every application. <a href="/careers/thanks.html">What happens next →</a>',
      fallback:gurl?'Please use the <a href="'+esc(gurl)+'" target="_blank" rel="noopener">application form ↗</a> instead.':''}));
  }
  function mounts(){
    document.querySelectorAll('.kfe-form-mount[data-inquiry]').forEach(function(m){
      var inq=m.getAttribute('data-inquiry'); if(m.getAttribute('data-heading')){var h=document.createElement('h3');h.textContent=m.getAttribute('data-heading');h.style.cssText='margin:18px 0 4px;font-family:var(--serif,Georgia,serif);font-weight:400';m.appendChild(h);}
      m.appendChild(build({inquiry:inq,source:(m.getAttribute('data-source')||location.pathname),org:'Organization',link:'',prompt:m.getAttribute('data-prompt')||'Your message',button:m.getAttribute('data-button')||'Send request →',
        thanks:m.getAttribute('data-thanks')||'Thank you — your request reached the team. We respond to qualified inquiries within 2–3 business days.'}));
    });
  }
  function run(){try{careers();}catch(e){} try{mounts();}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run); else run();
})();
