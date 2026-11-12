import useReveal from "../../hooks/useReveal";

/**
 * Wraps children in a scroll-triggered fade-up. `delay` staggers siblings.
 */
function Reveal({ children, delay = 0, as: Tag = "div", className = "", ...rest }) {
  const [ref, visible] = useReveal();

  return (
    <Tag
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` }}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
