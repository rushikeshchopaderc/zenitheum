const INTERACTIVE = "a, button, input, select, textarea, label, summary";

/**
 * A table on wide screens that becomes a stack of cards on phones (the semantic table is simply hidden, not
 * restyled, so both stay accessible). Rows open on click; the primary column renders a real button so the
 * keyboard and screen readers get the same affordance.
 *
 * columns: [{ key, header, cell(row), primary?, align?: "right", nowrap?, width?, minWidth? }]
 * card:    { title(row), badge?(row), meta?(row) -> node[], foot?(row) }
 */
export default function DataTable({ columns, rows, rowKey = (row) => row.id, onOpen, selectedId, card, label, dim = false }) {
  const keyOf = rowKey;
  return (
    <>
      <div className={`adm-tablewrap adm-tablewrap--rows${dim ? " adm-dim" : ""}`}>
        <table className="adm-table" aria-label={label}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={column.align === "right" ? "adm-right" : undefined} style={column.width || column.minWidth ? { width: column.width, minWidth: column.minWidth } : undefined}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = keyOf(row);
              return (
                <tr
                  key={id}
                  data-row-id={id}
                  data-clickable={onOpen ? "" : undefined}
                  data-selected={selectedId === id ? "true" : undefined}
                  onClick={
                    onOpen
                      ? (event) => {
                          if (!event.target.closest(INTERACTIVE)) onOpen(row);
                        }
                      : undefined
                  }
                >
                  {columns.map((column) => {
                    const content = column.cell(row);
                    return (
                      <td key={column.key} className={`${column.align === "right" ? "adm-right " : ""}${column.nowrap ? "adm-nowrap" : ""}`.trim() || undefined}>
                        {column.primary && onOpen ? (
                          <button type="button" className="adm-rowlink" data-row-open onClick={() => onOpen(row)}>
                            {content}
                          </button>
                        ) : (
                          content
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {card ? (
        <ul className={`adm-cards${dim ? " adm-dim" : ""}`} aria-label={label}>
          {rows.map((row) => {
            const id = keyOf(row);
            const meta = card.meta ? card.meta(row).filter(Boolean) : [];
            return (
              <li key={id} className="adm-rowcard" data-row-id={id} data-selected={selectedId === id ? "true" : undefined}>
                <div className="adm-rowcard__top">
                  {onOpen ? (
                    <button type="button" className="adm-rowlink" data-row-open onClick={() => onOpen(row)}>
                      {card.title(row)}
                    </button>
                  ) : (
                    <div style={{ minWidth: 0 }}>{card.title(row)}</div>
                  )}
                  {card.badge ? <div className="adm-rowcard__lift">{card.badge(row)}</div> : null}
                </div>
                {meta.length ? (
                  <div className="adm-rowcard__meta">
                    {meta.map((item, index) => (
                      <span key={index}>{item}</span>
                    ))}
                  </div>
                ) : null}
                {card.foot ? <div className="adm-rowcard__lift">{card.foot(row)}</div> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </>
  );
}
