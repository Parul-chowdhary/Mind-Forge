// ==========================================================================
// MINDFORGE NEURAL SYNAPSE & EMBER BACKGROUND
// Dynamic 60fps canvas particle system with mouse interaction
// ==========================================================================

(function() {
  const canvas = document.getElementById('neuro-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };

  const PARTICLE_COUNT = 65;
  const CONNECTION_DIST = 130;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -0.3 - Math.random() * 0.7; // Gentle upward drift like forge embers
      this.radius = 1.2 + Math.random() * 2.2;
      this.isEmber = Math.random() > 0.65;
      this.color = this.isEmber ? '#f59e0b' : '#6366f1';
      this.alpha = 0.2 + Math.random() * 0.6;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse gentle repel/attract
      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }

      if (this.y < -10 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = this.isEmber ? 10 : 6;
      ctx.shadowColor = this.color;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Draw neural synaptic connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
          ctx.strokeStyle = '#6366f1';
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(render);
  }

  init();
  requestAnimationFrame(render);
})();
