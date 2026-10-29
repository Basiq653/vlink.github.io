/** Three slowly drifting blurred color spots behind the content. */
export default function AmbientOrbs() {
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div className="orb" style={{ width: 500, height: 500, background: 'rgba(79, 158, 255, 0.07)', top: -100, left: -100 }} />
      <div className="orb" style={{ width: 400, height: 400, background: 'rgba(123, 94, 167, 0.07)', bottom: -80, right: -80, animationDelay: '-4s' }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'rgba(29, 233, 182, 0.05)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animationDelay: '-8s' }} />
    </div>
  );
}
