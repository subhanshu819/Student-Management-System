// Material Symbol icon wrapper
export default function Icon({ name, size = 20, filled = false, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
      }}
    >
      {name}
    </span>
  );
}
