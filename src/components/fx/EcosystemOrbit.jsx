import logo from "../../assets/img/Zenitheum_removebg.webp";
import { ECOSYSTEM } from "../../data/ecosystem";
import useAnimationGate from "../../hooks/useAnimationGate";

/**
 * Three counter-rotating rings of nodes around the Zenitheum mark. Pure CSS
 * motion: nodes counter-rotate so labels stay upright, and hovering pauses it.
 * Decorative — the same information is listed as text next to it.
 */
function EcosystemOrbit({ className = "" }) {
  const [gateRef, gate] = useAnimationGate();
  return (
    <div ref={gateRef} className={`orbit ${gate} ${className}`} aria-hidden="true">
      <div className="orbit-aura" />

      {ECOSYSTEM.map((ring, ringIndex) => (
        <div
          key={ring.id}
          className={`orbit-ring orbit-ring-${ring.id}`}
          style={{
            "--r": `${ring.radius}cqw`,
            "--dur": `${ring.duration}s`,
            "--dir": ring.reverse ? "reverse" : "normal",
          }}
        >
          {ring.items.map((item, i) => (
            <div
              key={item.label}
              className="orbit-slot"
              style={{ "--a": `${(360 / ring.items.length) * i + ringIndex * 28}deg` }}
            >
              <div className="orbit-node">
                <span className="orbit-label">{item.label}</span>
                <span className="orbit-hint">{item.hint}</span>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="orbit-core">
        <span className="orbit-core-ring" />
        <img src={logo} alt="" width="64" height="64" className="h-[3.4rem] w-[3.4rem] object-contain" />
      </div>
    </div>
  );
}

export default EcosystemOrbit;
