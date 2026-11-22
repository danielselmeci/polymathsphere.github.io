/*
 * Interactive layer for polymathsphere.com
 *  1. The hero's Facets logo as a 3D wireframe icosahedron you can spin
 *  2. A grid that lights up around the cursor
 *  3. Inspect mode: a drafting crosshair, coordinates and element specs
 * Everything degrades to the static site without JavaScript, and motion
 * that isn't started by the visitor is skipped when they prefer reduced
 * motion.
 */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    document.addEventListener('DOMContentLoaded', function () {
        initSphere();
        if (finePointer && !reduceMotion) initGridGlow();
        if (finePointer) initInspect();
    });

    /* ------------------------------------------------------------------
       1. 3D sphere
       ------------------------------------------------------------------ */
    function initSphere() {
        const canvas = document.querySelector('.sphere-3d');
        if (!canvas || !canvas.getContext) return;
        const figure = canvas.closest('.hero-figure');
        const ctx = canvas.getContext('2d');

        // Icosahedron: 12 vertices on the unit sphere, 30 edges
        const t = (1 + Math.sqrt(5)) / 2;
        const raw = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
        const len = Math.hypot(1, t);
        const V = raw.map(v => v.map(c => c / len));
        const E = [];
        for (let i = 0; i < 12; i++) {
            for (let j = i + 1; j < 12; j++) {
                const d = Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]);
                if (Math.abs(d - 2 / len) < 1e-6) E.push([i, j]);
            }
        }

        // 3x3 matrix helpers (row-major arrays)
        const mul = (a, b) => [0, 1, 2].map(r => [0, 1, 2].map(c => a[r][0] * b[0][c] + a[r][1] * b[1][c] + a[r][2] * b[2][c]));
        const apply = (m, v) => [0, 1, 2].map(r => m[r][0] * v[0] + m[r][1] * v[1] + m[r][2] * v[2]);
        const rotX = a => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
        const rotY = a => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
        const rotZ = a => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];

        // Start in the logo's orientation: one face toward the viewer,
        // with a corner of that face pointing down.
        const face = (() => {
            for (const [i, j] of E) {
                for (let k = 0; k < 12; k++) {
                    if (k !== i && k !== j && E.some(e => e[0] === Math.min(i, k) && e[1] === Math.max(i, k)) && E.some(e => e[0] === Math.min(j, k) && e[1] === Math.max(j, k))) return [i, j, k];
                }
            }
            return [0, 1, 5];
        })();
        const n = (() => { const c = [0, 1, 2].map(a => V[face[0]][a] + V[face[1]][a] + V[face[2]][a]); const l = Math.hypot(...c); return c.map(x => x / l); })();
        // Rotation that takes n to +z (Rodrigues)
        const axis = [n[1], -n[0], 0];
        const s = Math.hypot(axis[0], axis[1]);
        let R = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        if (s > 1e-9) {
            const k = axis.map(a => a / s), c = n[2], sn = s, oc = 1 - c;
            R = [
                [c + k[0] * k[0] * oc, k[0] * k[1] * oc - k[2] * sn, k[0] * k[2] * oc + k[1] * sn],
                [k[1] * k[0] * oc + k[2] * sn, c + k[1] * k[1] * oc, k[1] * k[2] * oc - k[0] * sn],
                [k[2] * k[0] * oc - k[1] * sn, k[2] * k[1] * oc + k[0] * sn, c + k[2] * k[2] * oc]
            ];
        }
        const a0 = apply(R, V[face[0]]);
        R = mul(rotZ(Math.atan2(a0[0], a0[1])), R);
        const R0 = R;

        const D = 7; // camera distance; larger is flatter
        let size = 0, dpr = 1;
        function resize() {
            const box = figure.querySelector('svg').getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            size = box.width;
            canvas.width = Math.round(size * dpr);
            canvas.height = Math.round(size * dpr);
            canvas.style.width = size + 'px';
            canvas.style.height = size + 'px';
        }

        let vx = 0, vy = 0, drag = null, lastInput = 0, drawProgress = reduceMotion ? 1 : 0, visible = true;
        const autoSpin = reduceMotion ? 0 : 0.0035;

        function draw() {
            const W = size * dpr;
            ctx.clearRect(0, 0, W, W);
            if (!W) return;
            const cx = W * 0.5, cy = W * (190 / 400);
            const target = W * (120 / 400);
            const P = V.map(v => {
                const p = apply(R, v);
                const f = D / (D - p[2]);
                return [p[0] * f, p[1] * f, p[2]];
            });
            const scale = target / Math.max(...P.map(p => Math.hypot(p[0], p[1])));
            const color = getComputedStyle(figure).color;
            ctx.strokeStyle = color;
            ctx.lineCap = 'round';
            const total = E.length;
            // Back edges first, then front edges
            const order = E.map((e, i) => ({ e, i, z: P[e[0]][2] + P[e[1]][2] })).sort((a, b) => a.z - b.z);
            order.forEach(({ e, i, z }) => {
                const part = Math.max(0, Math.min(1, drawProgress * total * 1.6 - i * 0.6));
                if (!part) return;
                const [p, q] = [P[e[0]], P[e[1]]];
                const x1 = cx + p[0] * scale, y1 = cy + p[1] * scale;
                const x2 = cx + q[0] * scale, y2 = cy + q[1] * scale;
                const front = z > -0.05;
                ctx.globalAlpha = front ? 1 : 0.28;
                ctx.lineWidth = (front ? 2.25 : 1.25) * W / 400;
                ctx.setLineDash(front ? [] : [3 * dpr, 4 * dpr]);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x1 + (x2 - x1) * part, y1 + (y2 - y1) * part);
                ctx.stroke();
            });
            ctx.setLineDash([]);
            // Vertices
            ctx.fillStyle = color;
            P.forEach(p => {
                if (p[2] < -0.05 || drawProgress < 1) return;
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.arc(cx + p[0] * scale, cy + p[1] * scale, 2.2 * W / 400, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }

        function frame(now) {
            if (visible && !document.hidden) {
                if (drawProgress < 1) drawProgress = Math.min(1, drawProgress + 0.012);
                if (!drag) {
                    const idle = now - lastInput > 2500;
                    if (drawProgress >= 1 && idle) vy += (autoSpin - vy) * 0.02;
                    if (Math.abs(vx) > 1e-5 || Math.abs(vy) > 1e-5) R = mul(mul(rotY(vy), rotX(vx)), R);
                    vx *= reduceMotion ? 0 : 0.94;
                    if (!idle) vy *= reduceMotion ? 0 : 0.94;
                }
                draw();
            }
            requestAnimationFrame(frame);
        }

        canvas.addEventListener('pointerdown', e => {
            drag = { x: e.clientX, y: e.clientY };
            canvas.setPointerCapture(e.pointerId);
            canvas.classList.add('is-dragging');
            lastInput = performance.now();
        });
        canvas.addEventListener('pointermove', e => {
            if (!drag) return;
            const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
            drag = { x: e.clientX, y: e.clientY };
            vy = dx * 0.008;
            vx = -dy * 0.008;
            R = mul(mul(rotY(vy), rotX(vx)), R);
            lastInput = performance.now();
        });
        const end = () => { drag = null; canvas.classList.remove('is-dragging'); lastInput = performance.now(); };
        canvas.addEventListener('pointerup', end);
        canvas.addEventListener('pointercancel', end);
        canvas.addEventListener('dblclick', () => { R = R0; vx = vy = 0; lastInput = performance.now(); });
        canvas.addEventListener('keydown', e => {
            const step = 0.15;
            const map = { ArrowLeft: rotY(-step), ArrowRight: rotY(step), ArrowUp: rotX(step), ArrowDown: rotX(-step) };
            if (map[e.key]) { R = mul(map[e.key], R); vx = vy = 0; lastInput = performance.now(); e.preventDefault(); }
            if (e.key === 'Home' || e.key === '0') { R = R0; vx = vy = 0; e.preventDefault(); }
        });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(canvas);
        }
        window.addEventListener('resize', () => { resize(); draw(); });

        canvas.hidden = false;
        figure.classList.add('is-3d');
        resize();
        requestAnimationFrame(frame);
    }

    /* ------------------------------------------------------------------
       2. Grid that lights up around the cursor
       ------------------------------------------------------------------ */
    function initGridGlow() {
        const glow = document.createElement('div');
        glow.className = 'grid-glow';
        glow.setAttribute('aria-hidden', 'true');
        document.body.prepend(glow);
        let x = -999, y = -999, queued = false;
        const paint = () => {
            glow.style.setProperty('--mx', x + 'px');
            glow.style.setProperty('--my', y + 'px');
            queued = false;
        };
        document.addEventListener('pointermove', e => {
            x = e.clientX; y = e.clientY;
            glow.classList.add('is-on');
            if (!queued) { queued = true; requestAnimationFrame(paint); }
        }, { passive: true });
        document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('is-on'));
    }

    /* ------------------------------------------------------------------
       3. Inspect mode
       ------------------------------------------------------------------ */
    function initInspect() {
        const links = document.querySelector('.nav-links');
        if (!links) return;
        const STORE = 'ps-inspect';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'inspect-toggle';
        btn.setAttribute('aria-pressed', 'false');
        btn.title = 'Inspect mode (press I)';
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="6.5"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg><span>Inspect</span>';
        const contact = links.querySelector('.nav-contact');
        links.insertBefore(btn, contact || null);

        const layer = document.createElement('div');
        layer.className = 'inspect-layer';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = '<div class="insp-x"></div><div class="insp-y"></div><div class="insp-box"></div><div class="insp-tag"><span class="insp-name"></span><span class="insp-size"></span><span class="insp-type"></span></div><div class="insp-coords"></div><div class="insp-hint">Inspect mode · press I or Esc to exit</div>';
        document.body.appendChild(layer);
        const $ = sel => layer.querySelector(sel);
        const lx = $('.insp-x'), ly = $('.insp-y'), box = $('.insp-box'), tag = $('.insp-tag'), coords = $('.insp-coords');

        const NAMES = [
            ['.nav', 'Navigation'], ['.footer-content', 'Title block'], ['.sphere-3d', '3D model'], ['.hero-figure svg', 'Drawing'],
            ['.btn', 'Button'], ['.inspect-toggle', 'Switch'], ['a', 'Link'], ['button', 'Button'],
            ['h1', 'Heading 1'], ['h2', 'Heading 2'], ['h3', 'Heading 3'],
            ['.hero-slogan', 'Slogan'], ['.hero-label, .section-title', 'Label'], ['p', 'Text'],
            ['input, textarea', 'Field'], ['img', 'Image'], ['svg', 'Drawing'], ['canvas', 'Canvas'],
            ['.capability-item, .process-item, .platform-item', 'Panel'], ['.page-header', 'Header'], ['section', 'Section'], ['form', 'Form']
        ];
        const SELECTOR = NAMES.map(n => n[0]).join(',');

        let on = false, raf = 0, last = null;
        function set(state) {
            on = state;
            document.documentElement.classList.toggle('inspect-on', on);
            btn.setAttribute('aria-pressed', String(on));
            try { localStorage.setItem(STORE, on ? '1' : '0'); } catch (e) { /* ignore */ }
            if (!on) box.style.opacity = tag.style.opacity = '0';
        }

        function describe(el) {
            for (const [sel, name] of NAMES) if (el.matches(sel)) return name;
            return el.tagName.toLowerCase();
        }

        function update() {
            raf = 0;
            if (!on || !last) return;
            const { x, y, target } = last;
            lx.style.transform = `translateY(${y}px)`;
            ly.style.transform = `translateX(${x}px)`;
            coords.textContent = `X ${String(Math.round(x + window.scrollX)).padStart(4, '0')} · Y ${String(Math.round(y + window.scrollY)).padStart(4, '0')}`;

            const el = target && target.closest && !layer.contains(target) ? target.closest(SELECTOR) : null;
            if (!el) { box.style.opacity = tag.style.opacity = '0'; return; }
            const r = el.getBoundingClientRect();
            box.style.opacity = '1';
            box.style.transform = `translate(${r.left}px, ${r.top}px)`;
            box.style.width = r.width + 'px';
            box.style.height = r.height + 'px';

            const cs = getComputedStyle(el);
            $('.insp-name').textContent = `${describe(el)} · <${el.tagName.toLowerCase()}>`;
            $('.insp-size').textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
            const hasText = el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
            $('.insp-type').textContent = hasText
                ? `${cs.fontFamily.split(',')[0].replace(/['"]/g, '')} ${cs.fontWeight} · ${Math.round(parseFloat(cs.fontSize))}px`
                : '';
            tag.style.opacity = '1';
            const tw = tag.offsetWidth, th = tag.offsetHeight;
            let tx = Math.min(Math.max(r.left, 8), window.innerWidth - tw - 8);
            let ty = r.top - th - 8;
            if (ty < 70) ty = Math.min(r.bottom + 8, window.innerHeight - th - 8);
            tag.style.transform = `translate(${tx}px, ${ty}px)`;
        }

        document.addEventListener('pointermove', e => {
            last = { x: e.clientX, y: e.clientY, target: e.target };
            if (on && !raf) raf = requestAnimationFrame(update);
        }, { passive: true });
        window.addEventListener('scroll', () => { if (on && !raf) raf = requestAnimationFrame(update); }, { passive: true });

        btn.addEventListener('click', () => set(!on));
        document.addEventListener('keydown', e => {
            const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
            if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key === 'i' || e.key === 'I') { set(!on); e.preventDefault(); }
            if (e.key === 'Escape' && on) set(false);
        });

        let saved = false;
        try { saved = localStorage.getItem(STORE) === '1'; } catch (e) { /* ignore */ }
        set(saved);
    }
})();
