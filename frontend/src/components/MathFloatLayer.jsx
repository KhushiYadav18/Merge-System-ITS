import { InlineMath } from "react-katex";

const FORMULAS = [
  "x^2 + y^2 = r^2",
  "f(x)=ax^2+bx+c",
  "\\sin^2(\\theta)+\\cos^2(\\theta)=1",
  "\\sum_{n=1}^{\\infty}\\frac{1}{n^2}=\\frac{\\pi^2}{6}",
  "\\frac{d}{dx}x^n=nx^{n-1}",
  "a^2-b^2=(a-b)(a+b)",
  "E=mc^2",
  "\\int_a^b f(x)\\,dx",
];

const SYMBOLS = [
  "+",
  "-",
  "\\times",
  "\\div",
  "=",
  "<",
  ">",
  "\\sqrt{x}",
  "\\pi",
  "\\theta",
  "\\Delta",
  "\\Sigma",
  "\\lambda",
  "\\infty",
  "\\int",
];

function createEquation(formula, index, density) {
  const x = ((index * 19 + 13) % 86) + 4;
  const y = ((index * 17 + 11) % 72) + 8;
  const duration =
    density === "high" ? 10 + (index % 6) * 1.8 : 14 + (index % 6) * 2.2;
  const delay = (index % 10) * -1.3;
  const drift = (index % 2 === 0 ? 1 : -1) * (16 + (index % 6) * 8);
  const rise = 34 + (index % 5) * 14;
  const spin = (index % 2 === 0 ? 1 : -1) * (6 + (index % 4) * 3);
  const size =
    density === "high" ? 0.74 + (index % 5) * 0.09 : 0.68 + (index % 5) * 0.08;

  return {
    formula,
    style: {
      left: `${x}%`,
      top: `${y}%`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
      "--drift": `${drift}px`,
      "--rise": `${rise}px`,
      "--spin": `${spin}deg`,
      "--size": size,
    },
  };
}

export default function MathFloatLayer({ density = "low" }) {
  const equationCount = density === "high" ? 16 : 11;
  const symbolCount = density === "high" ? 24 : 16;

  const equations = Array.from({ length: equationCount }, (_, index) =>
    createEquation(FORMULAS[index % FORMULAS.length], index, density),
  );

  const symbols = Array.from({ length: symbolCount }, (_, index) =>
    createEquation(SYMBOLS[index % SYMBOLS.length], index + 20, density),
  );

  return (
    <div className="math-float-layer" aria-hidden="true">
      {equations.map((item, index) => (
        <span
          key={`${item.formula}-${index}`}
          className="math-float-item"
          style={item.style}
        >
          <InlineMath math={item.formula} />
        </span>
      ))}
      {symbols.map((item, index) => (
        <span
          key={`${item.formula}-symbol-${index}`}
          className="math-float-item math-float-symbol"
          style={item.style}
        >
          <InlineMath math={item.formula} />
        </span>
      ))}
    </div>
  );
}
