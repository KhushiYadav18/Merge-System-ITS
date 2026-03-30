import { useEffect, useRef } from "react";

export default function NeoCursor() {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const trailPoints = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      trailPoints.current.push({
        x: e.clientX,
        y: e.clientY,
        age: 0,
      });

      if (trailPoints.current.length > 24) {
        trailPoints.current.shift();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Age trail points
      trailPoints.current.forEach((point) => {
        point.age += 1;
      });

      // Draw tail beam
      if (trailPoints.current.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 0; i < trailPoints.current.length - 1; i++) {
          const p1 = trailPoints.current[i];
          const p2 = trailPoints.current[i + 1];

          const opacity = 1 - (p1.age / 24) * 0.9;
          const lineWidth = 2.4 * opacity;

          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          gradient.addColorStop(0, `rgba(25, 245, 193, ${opacity * 0.8})`);
          gradient.addColorStop(1, `rgba(71, 196, 255, ${opacity * 0.5})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = lineWidth;
          ctx.shadowColor = "rgba(25, 245, 193, 0.8)";
          ctx.shadowBlur = 12;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Draw cursor dot
      const { x, y } = mousePos.current;
      ctx.shadowColor = "rgba(25, 245, 193, 0.9)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "rgba(25, 245, 193, 0.95)";
      ctx.beginPath();
      ctx.arc(x, y, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Draw outer glow ring
      ctx.strokeStyle = "rgba(71, 196, 255, 0.6)";
      ctx.lineWidth = 1.4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(71, 196, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(x, y, 7.8, 0, Math.PI * 2);
      ctx.stroke();

      // Draw rotating accent ring
      const angle = (Date.now() * 0.003) % (Math.PI * 2);
      ctx.strokeStyle = "rgba(146, 92, 255, 0.4)";
      ctx.lineWidth = 0.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(146, 92, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(angle) * 6,
        y + Math.sin(angle) * 6,
        3.6,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    const frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
