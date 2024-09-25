document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bubbleCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const style = getComputedStyle(document.documentElement);

  const bubbles = [];
  const splashes = [];

  class Bubble {
    constructor() {
      // Asegurar que las burbujas no se generen muy cerca de los bordes
      this.radius = Math.random() * 20 + 5;
      this.x = Math.random() * (canvas.width - 2 * this.radius) + this.radius;
      this.y = Math.random() * (canvas.height - 2 * this.radius) + this.radius;
      this.speedX = Math.random() * 2 - 1;
      this.speedY = Math.random() * 2 - 1;
      this.alpha = Math.random() * 0.5 + 0.5;
      let colors = [
        '--color-3',
        '--color-4',
        '--color-5',
        '--color-6',
        '--color-7',
        '--color-8'
      ].map(c => style.getPropertyValue(c));

      // Color morado con transparencia
      this.rgba = `rgba(${colors[Math.floor(Math.random() * (colors.length - 1))]}, ${this.alpha})`;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.rgba
      ctx.fill();
      ctx.closePath();
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Rebotar en los bordes y crear chapoteo
      if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
        this.speedX *= -1;
        this.createSplash();
        this.adjustDirection();
      }
      if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
        this.speedY *= -1;
        this.createSplash();
        this.adjustDirection();
      }
    }

    createSplash() {
      for (let i = 0; i < 5; i++) {
        splashes.push(new Splash(this.x, this.y));
      }
    }

    adjustDirection() {
      const angle = (Math.random() * 0.4 - 0.2); // Ajuste aleatorio en el ángulo
      const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
      const direction = Math.atan2(this.speedY, this.speedX) + angle;
      this.speedX = speed * Math.cos(direction);
      this.speedY = speed * Math.sin(direction);
    }

    adjustPosition() {
      if (this.x + this.radius > canvas.width) {
        this.x = canvas.width - this.radius;
      } else if (this.x - this.radius < 0) {
        this.x = this.radius;
      }
      if (this.y + this.radius > canvas.height) {
        this.y = canvas.height - this.radius;
      } else if (this.y - this.radius < 0) {
        this.y = this.radius;
      }
    }
  }

  class Splash {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = Math.random() * 2 + 1;
      this.speedX = Math.random() * 2 - 1;
      this.speedY = Math.random() * 2 - 1;
      this.alpha = 1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`; // Color morado con transparencia
      ctx.fill();
      ctx.closePath();
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= 0.02;
    }
  }

  function init() {
    for (let i = 0; i < 100; i++) {
      bubbles.push(new Bubble());
    }
    animate();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bubbles.forEach(bubble => {
      bubble.update();
      bubble.draw();
    });

    splashes.forEach((splash, index) => {
      splash.update();
      splash.draw();
      if (splash.alpha <= 0) {
        splashes.splice(index, 1);
      }
    });

    requestAnimationFrame(animate);
  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    bubbles.forEach(bubble => bubble.adjustPosition());
  }

  window.addEventListener('resize', handleResize);

  init();
})