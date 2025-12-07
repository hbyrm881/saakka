let yazi_ekrani = document.querySelector("#yazi");
let buton = document.querySelector("#gosterBtn");

// güvenli, şaka amaçlı gösterilecek metin
const mesaj = "Napıyorsun Fuckkass??";

function showFancyText(text){
    // temizle
    yazi_ekrani.innerHTML = "";
    yazi_ekrani.classList.remove('reveal');
    yazi_ekrani.style.position = 'relative';

    // oluştur (inline, ölçüm için görünür bırakıyoruz)
    const frag = document.createDocumentFragment();
    const spans = [];
    [...text].forEach((ch, i) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch;
        span.style.whiteSpace = 'pre'; // boşlukları koru
        // inline-block olması transform için gerekli
        span.style.display = 'inline-block';
        frag.appendChild(span);
        spans.push(span);
    });
    yazi_ekrani.appendChild(frag);

    // render bekle (layout sağlam)
    void yazi_ekrani.offsetWidth;

    // her karakter için rastgele kenardan gelen başlangıç transform'u ayarla ve animate et
    spans.forEach((span, i) => {
        // rastgele başlangıç kenarı ve uzaklık (viewport bazlı)
        const side = ['top','bottom','left','right'][Math.floor(Math.random()*4)];
        let dx = 0, dy = 0;
        const spreadX = Math.max(300, window.innerWidth * 0.6);
        const spreadY = Math.max(200, window.innerHeight * 0.5);

        if (side === 'top') {
            dx = (Math.random()-0.5) * 300;
            dy = - (50 + Math.random() * spreadY);
        } else if (side === 'bottom') {
            dx = (Math.random()-0.5) * 300;
            dy = 50 + Math.random() * spreadY;
        } else if (side === 'left') {
            dx = - (80 + Math.random() * spreadX);
            dy = (Math.random()-0.5) * 120;
        } else {
            dx = 80 + Math.random() * spreadX;
            dy = (Math.random()-0.5) * 120;
        }

        const rot = (Math.random()-0.5) * 60; // başlangıç rotasyonu

        // başlangıç transform + opacity (inline oldukları için final pozisyon korunur)
        span.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(.86)`;
        span.style.opacity = '0';

        // animasyon (Web Animations API ile) -> hedef: transform none, opacity 1
        const delay = i * 45 + Math.random()*90; // stagger + hafif rastgele
        const duration = 700 + Math.random()*300;
        span.animate([
            { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(.86)`, opacity: 0 },
            { transform: `translate(0px, 0px) rotate(0deg) scale(1)`, opacity: 1 }
        ], {
            duration,
            easing: 'cubic-bezier(.18,.9,.3,1)',
            delay,
            fill: 'forwards'
        });
    });

    // konfeti biraz gecikmeli ateşle
    setTimeout(() => launchConfetti(), 260);
}

buton.addEventListener("click", () => showFancyText(mesaj));

/* Basit, tek seferlik konfeti: canvas tabanlı, otomatik temizlenir */
function launchConfetti(){
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;

    function resize(){
        canvas.width = innerWidth * DPR;
        canvas.height = innerHeight * DPR;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        ctx.setTransform(DPR,0,0,DPR,0,0);
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#ff6b6b','#ffd27d','#6bf07a','#6bb3ff','#b39cff','#ff9a9e'];
    const count = 90;
    const particles = new Array(count).fill().map(() => ({
        x: Math.random()*innerWidth,
        y: -10 - Math.random()*200,
        vx: (Math.random()-0.5)*7,
        vy: Math.random()*5 + 2,
        size: Math.random()*8 + 4,
        rot: Math.random()*360,
        vr: (Math.random()-0.5)*15,
        color: colors[Math.floor(Math.random()*colors.length)],
        life: 2200 + Math.random()*800
    }));

    const start = performance.now();
    let raf;
    function frame(now){
        const t = now - start;
        ctx.clearRect(0,0,innerWidth,innerHeight);
        particles.forEach(p => {
            p.vy += 0.06; // gravity
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vr * 0.02;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
            ctx.restore();
            p.life -= 16;
        });
        if (t < 2600){
            raf = requestAnimationFrame(frame);
        } else {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    }
    raf = requestAnimationFrame(frame);
}
