/** Title block at the top of every screen. The h1 is focusable so route changes can move focus to it. */
export default function PageHeader({ eyebrow, title, lede, children }) {
  return (
    <header className="adm-pagehead">
      <div className="adm-pagehead__titles">
        {eyebrow ? <div className="adm-eyebrow">{eyebrow}</div> : null}
        <h1 className="adm-h1" tabIndex={-1} data-page-title>
          {title}
        </h1>
        {lede ? <p className="adm-lede">{lede}</p> : null}
      </div>
      {children ? <div className="adm-pagehead__actions">{children}</div> : null}
    </header>
  );
}
