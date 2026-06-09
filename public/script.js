/* =============================================
   PIXORAMA GROUP — REIMAGINED v2
   Particles · World Map · Typed · Counters
   3D Tilt · Magnetic · Pin Drop · Nav Indicator
   ============================================= */

/* ══ 1. PARTICLE NETWORK ══ */
(function () {
  const cv = document.getElementById('particle-canvas');
  const ctx = cv.getContext('2d');
  let W, H, pts = [];
  const N = 80, DIST = 120;
  const COLS = ['#6366f1','#06b6d4','#8b5cf6','#ec4899','#10b981'];

  function hex(h) {
    return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  }

  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }

  function Dot() {
    this.x = Math.random()*W; this.y = Math.random()*H;
    this.vx = (Math.random()-.5)*.35; this.vy = (Math.random()-.5)*.35;
    this.r = Math.random()*1.8+.8;
    this.rgb = hex(COLS[Math.floor(Math.random()*COLS.length)]);
    this.a = Math.random()*.4+.15;
  }

  let mx = -999, my = -999;

  function tick() {
    ctx.clearRect(0,0,W,H);
    for (let i=0;i<pts.length;i++) {
      for (let j=i+1;j<pts.length;j++) {
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d=Math.hypot(dx,dy);
        if (d<DIST) {
          ctx.beginPath();
          ctx.strokeStyle=`rgba(99,102,241,${(1-d/DIST)*.12})`;
          ctx.lineWidth=.8;
          ctx.moveTo(pts[i].x,pts[i].y);
          ctx.lineTo(pts[j].x,pts[j].y);
          ctx.stroke();
        }
      }
    }
    for (const p of pts) {
      const dx=p.x-mx, dy=p.y-my, d=Math.hypot(dx,dy);
      if (d<90) { p.vx+=(dx/d)*.25; p.vy+=(dy/d)*.25; }
      p.vx*=.99; p.vy*=.99;
      p.x+=p.vx; p.y+=p.vy;
      if (p.x<-8) p.x=W+8; if (p.x>W+8) p.x=-8;
      if (p.y<-8) p.y=H+8; if (p.y>H+8) p.y=-8;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]},${p.a})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  addEventListener('resize', ()=>{ resize(); pts=[]; for(let i=0;i<N;i++) pts.push(new Dot()); });
  addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; });
  resize();
  for (let i=0;i<N;i++) pts.push(new Dot());
  tick();
})();


/* ══ 2. WORLD-MAP DOT CANVAS ══ */
(function () {
  const cv = document.getElementById('world-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');

  function resize() {
    cv.width  = cv.offsetWidth  * devicePixelRatio;
    cv.height = cv.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  addEventListener('resize', ()=>{ resize(); draw(); });

  /* Simplified world continent dots — longitude mapped to X, latitude to Y */
  /* Points as [x%,y%] across the canvas */
  const dots = [];
  /* Generate a rough world outline using seeded dot clusters */
  const continents = [
    /* North America */ {cx:20,cy:32,rx:14,ry:14,n:80},
    /* South America */ {cx:28,cy:60,rx:8,ry:14,n:50},
    /* Europe        */ {cx:50,cy:26,rx:8,ry:8,n:45},
    /* Africa        */ {cx:51,cy:50,rx:9,ry:14,n:60},
    /* Asia          */ {cx:72,cy:30,rx:20,ry:14,n:120},
    /* Australia     */ {cx:84,cy:62,rx:7,ry:7,n:30},
  ];

  const rng = (seed=>()=>{ seed=(seed*9301+49297)%233280; return seed/233280; })(42);

  continents.forEach(c=>{
    for (let k=0;k<c.n;k++) {
      const angle = rng()*Math.PI*2;
      const rad   = Math.sqrt(rng());
      dots.push({
        x: c.cx + Math.cos(angle)*c.rx*rad,
        y: c.cy + Math.sin(angle)*c.ry*rad,
        a: 0.15 + rng()*.25,
        r: 1.2 + rng()*.8,
        t: rng()*Math.PI*2,   /* phase offset for twinkle */
      });
    }
  });

  /* Pin positions (same as HTML) */
  const pins = [
    {x:62,y:28},{x:48,y:24},{x:54,y:29},{x:77,y:32},{x:86,y:38},{x:91,y:30}
  ];
  /* Connection arcs between some pins */
  const arcs = [
    [0,1],[1,2],[2,3],[3,4],[4,5]
  ];

  let t = 0;

  function draw() {
    const W = cv.offsetWidth, H = cv.offsetHeight;
    ctx.clearRect(0,0,W,H);

    /* Dot grid */
    dots.forEach(d=>{
      const tw = .15 + .1*Math.sin(t*0.6+d.t);
      ctx.beginPath();
      ctx.arc(d.x/100*W, d.y/100*H, d.r, 0, Math.PI*2);
      ctx.fillStyle=`rgba(99,102,241,${tw})`;
      ctx.fill();
    });

    /* Connection arcs between city pins */
    const progress = (t*.4) % 1;  /* 0→1 loop */
    arcs.forEach(([ai,bi],idx)=>{
      const pa = pins[ai], pb = pins[bi];
      const ax = pa.x/100*W, ay = pa.y/100*H;
      const bx = pb.x/100*W, by = pb.y/100*H;
      const mx = (ax+bx)/2, my = Math.min(ay,by)-(Math.abs(bx-ax)*.3);

      /* Static arc */
      ctx.beginPath();
      ctx.moveTo(ax,ay);
      ctx.quadraticCurveTo(mx,my,bx,by);
      ctx.strokeStyle='rgba(99,102,241,0.12)';
      ctx.lineWidth=1;
      ctx.setLineDash([]);
      ctx.stroke();

      /* Animated packet on arc */
      const p = ((progress + idx*.2) % 1);
      const t2 = p;
      const qx = (1-t2)*(1-t2)*ax + 2*(1-t2)*t2*mx + t2*t2*bx;
      const qy = (1-t2)*(1-t2)*ay + 2*(1-t2)*t2*my + t2*t2*by;
      const grad = ctx.createRadialGradient(qx,qy,0,qx,qy,5);
      grad.addColorStop(0,'rgba(6,182,212,0.9)');
      grad.addColorStop(1,'rgba(6,182,212,0)');
      ctx.beginPath();
      ctx.arc(qx,qy,4,0,Math.PI*2);
      ctx.fillStyle=grad;
      ctx.fill();
    });

    t += 0.02;
    requestAnimationFrame(draw);
  }

  resize();
  draw();
})();


/* ══ 3. TYPED TEXT ══ */
(function () {
  const el = document.getElementById('typed');
  if (!el) return;
  const words = ['Experiences','Platforms','the Future','with AI','at Scale'];
  let wi=0, ci=0, del=false;

  function tick() {
    const w=words[wi];
    if (!del) {
      el.textContent=w.slice(0,++ci);
      if (ci===w.length){ del=true; setTimeout(tick,1800); return; }
      setTimeout(tick,88);
    } else {
      el.textContent=w.slice(0,--ci);
      if (ci===0){ del=false; wi=(wi+1)%words.length; }
      setTimeout(tick,48);
    }
  }
  setTimeout(tick,700);
})();


/* ══ 4. SCROLL REVEALS ══ */
(function () {
  const els = document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right,.reveal-card');
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if (e.isIntersecting) {
        const d = +e.target.dataset.delay || 0;
        setTimeout(()=> e.target.classList.add('visible'), d);
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.1});
  els.forEach(el=>obs.observe(el));

  /* Hero elements appear immediately */
  document.querySelectorAll('#hero .reveal-up').forEach((el,i)=>{
    setTimeout(()=> el.classList.add('visible'), 180+i*130);
  });
})();


/* ══ 5. ANIMATED COUNTERS ══ */
(function () {
  function ease(t){ return 1-Math.pow(1-t,3); }

  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.target);
      const isF = target%1!==0;
      let start=null;
      function anim(ts){
        if(!start) start=ts;
        const p=Math.min((ts-start)/1800,1);
        const v=ease(p)*target;
        el.textContent=isF?v.toFixed(1):Math.floor(v);
        if(p<1) requestAnimationFrame(anim);
        else el.textContent=isF?target.toFixed(1):target;
      }
      requestAnimationFrame(anim);
      obs.unobserve(el);
    });
  },{threshold:0.5});
  document.querySelectorAll('.counter').forEach(el=>obs.observe(el));

  /* Stat bars */
  const bobs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const bar=e.target;
      setTimeout(()=>{ bar.style.width=bar.dataset.width+'%'; },200);
      bobs.unobserve(bar);
    });
  },{threshold:0.5});
  document.querySelectorAll('.stat-fill').forEach(el=>bobs.observe(el));
})();


/* ══ 6. SCROLL PROGRESS BAR ══ */
(function () {
  const bar = document.createElement('div');
  bar.style.cssText='position:fixed;top:0;left:0;height:2px;z-index:9999;background:linear-gradient(90deg,#6366f1,#06b6d4);transition:width .1s linear;pointer-events:none;';
  document.body.appendChild(bar);
  addEventListener('scroll',()=>{
    bar.style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+'%';
  },{passive:true});
})();


/* ══ 7. 3D CARD TILT (non-flipped) ══ */
(function () {
  /* Only tilt on desktop */
  if (innerWidth < 1024) return;

  document.querySelectorAll('.card-wrap').forEach(wrap=>{
    let isFlipped = false;

    wrap.addEventListener('mouseenter', ()=>{ isFlipped=true; });
    wrap.addEventListener('mouseleave', ()=>{
      isFlipped=false;
      wrap.style.transform='';
      wrap.style.transition='transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    });

    /* Slight perspective tilt as you approach the card (before hover flip) */
    wrap.parentElement.addEventListener('mousemove', e=>{
      if (isFlipped) return;
      const rect = wrap.getBoundingClientRect();
      /* Check if mouse is near this card */
      const dx = e.clientX - (rect.left+rect.width/2);
      const dy = e.clientY - (rect.top+rect.height/2);
      const dist = Math.hypot(dx,dy);
      if (dist < 160) {
        const rx = -dy/rect.height*8;
        const ry =  dx/rect.width*8;
        wrap.style.transform=`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
        wrap.style.transition='transform 0.15s';
      }
    });
  });
})();


/* ══ 8. MAGNETIC BUTTONS ══ */
(function () {
  document.querySelectorAll('.magnetic').forEach(btn=>{
    btn.addEventListener('mousemove', e=>{
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - rect.left - rect.width/2;
      const dy = e.clientY - rect.top  - rect.height/2;
      btn.style.transform=`translate(${dx*.12}px,${dy*.12}px)`;
    });
    btn.addEventListener('mouseleave',()=>{
      btn.style.transform='';
    });
  });
})();


/* ══ 9. NAVBAR — glass elevation + active indicator ══ */
(function () {
  const nav = document.getElementById('navbar');
  const indicator = document.getElementById('nav-indicator');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  /* Elevation on scroll */
  addEventListener('scroll',()=>{
    nav.classList.toggle('elevated', scrollY > 60);
  },{passive:true});

  /* Active section indicator */
  function updateActive() {
    const y = scrollY + 100;
    sections.forEach(sec=>{
      if (y >= sec.offsetTop && y < sec.offsetTop+sec.offsetHeight) {
        const id = sec.id;
        links.forEach(link=>{
          const active = link.getAttribute('href')==='#'+id;
          link.classList.toggle('active', active);
        });
      }
    });
  }
  addEventListener('scroll', updateActive, {passive:true});
  updateActive();
})();


/* ══ 10. HAMBURGER MENU ══ */
(function () {
  const btn = document.getElementById('hamburger');
  const linksEl = document.getElementById('nav-links');
  if (!btn||!linksEl) return;
  let open=false;

  btn.addEventListener('click',()=>{
    open=!open;
    if (open) {
      linksEl.style.cssText='display:flex;flex-direction:column;position:fixed;top:68px;left:12px;right:12px;background:rgba(4,4,16,0.97);backdrop-filter:blur(28px);padding:20px;gap:4px;border:1px solid rgba(255,255,255,0.08);border-radius:16px;z-index:199;';
    } else {
      linksEl.style.cssText='';
    }
    /* Animate hamburger spans */
    const spans = btn.querySelectorAll('span');
    if (open) {
      spans[0].style.cssText='transform:rotate(45deg) translate(5px,5px)';
      spans[1].style.cssText='opacity:0';
      spans[2].style.cssText='transform:rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s=>s.style.cssText='');
    }
  });

  linksEl.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',()=>{
      open=false; linksEl.style.cssText='';
      btn.querySelectorAll('span').forEach(s=>s.style.cssText='');
    });
  });
})();


/* ══ 11. CONTACT FORM ══ */
(function () {
  const form  = document.getElementById('contact-form');
  const toast = document.getElementById('toast');
  if (!form||!toast) return;

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const btn=form.querySelector('button[type=submit]');
    btn.textContent='Sending…'; btn.disabled=true;

    setTimeout(()=>{
      btn.innerHTML='<span>Message Sent! ✓</span>';
      btn.style.background='linear-gradient(135deg,#10b981,#06b6d4)';
      form.reset();
      toast.classList.add('show');
      setTimeout(()=>{
        toast.classList.remove('show');
        btn.innerHTML='<span>Send Message</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        btn.style.background='';
        btn.disabled=false;
      },4200);
    },1200);
  });
})();


/* ══ 12. SMOOTH ANCHOR SCROLL ══ */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',function(e){
    const target=document.querySelector(this.getAttribute('href'));
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'}); }
  });
});


/* ══ 13. METHODOLOGY PIN DROP ON SCROLL ══ */
(function () {
  const pins = document.querySelectorAll('.timeline-pin.pin-drop');
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if (e.isIntersecting) {
        const pin = e.target;
        const delay = +pin.dataset.pinDelay || 0;
        setTimeout(()=>{ pin.style.animationPlayState='running'; }, delay);
        obs.unobserve(pin);
      }
    });
  },{threshold:0.5});
  pins.forEach(pin=>{
    pin.style.animationPlayState='paused';
    obs.observe(pin);
  });
})();


/* ══ 14. CURSOR GLOW TRAIL ══ */
(function () {
  if (innerWidth < 768) return;
  const MAX=14;
  const dots=[];
  for (let i=0;i<MAX;i++) {
    const d=document.createElement('div');
    const s=1-i/MAX;
    d.style.cssText=`position:fixed;pointer-events:none;z-index:9997;
      width:${7*s}px;height:${7*s}px;border-radius:50%;
      background:rgba(99,102,241,${0.55*s});
      transform:translate(-50%,-50%);
      transition:left ${i*.028}s,top ${i*.028}s;
      mix-blend-mode:screen;`;
    document.body.appendChild(d);
    dots.push(d);
  }
  addEventListener('mousemove',e=>{
    dots.forEach(d=>{ d.style.left=e.clientX+'px'; d.style.top=e.clientY+'px'; });
  });
})();


/* ══ 15. AVATAR CARD HOVER PING ══ */
(function () {
  document.querySelectorAll('.avatar-card').forEach(card=>{
    card.addEventListener('mouseenter',()=>{
      const ring=card.querySelector('.av-ring');
      ring.style.animationDuration='1s';
    });
    card.addEventListener('mouseleave',()=>{
      const ring=card.querySelector('.av-ring');
      ring.style.animationDuration='3s';
    });
  });
})();


/* ══ 16. WORLD MAP PIN STAGGER (ensure re-trigger on resize) ══ */
(function () {
  /* Pins are CSS-animated on load; nothing extra needed */
})();
