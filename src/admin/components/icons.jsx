/*
 * Icon set for the admin console. Geometry is from Lucide (https://lucide.dev, ISC licence; portions from
 * Feather, MIT), inlined so the console depends on no icon package. 24x24 viewBox, 2px round strokes.
 */

const SHAPES = {
  overview: [["rect",{"width":"7","height":"9","x":"3","y":"3","rx":"1"}],["rect",{"width":"7","height":"5","x":"14","y":"3","rx":"1"}],["rect",{"width":"7","height":"9","x":"14","y":"12","rx":"1"}],["rect",{"width":"7","height":"5","x":"3","y":"16","rx":"1"}]],
  demos: [["path",{"d":"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"}],["path",{"d":"M16 2v4"}],["path",{"d":"M8 2v4"}],["path",{"d":"M3 10h5"}],["path",{"d":"M17.5 17.5 16 16.25V14"}],["path",{"d":"M22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"}]],
  orders: [["path",{"d":"M16.5 9.4 7.55 4.24"}],["path",{"d":"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"}],["polyline",{"points":"3.29 7 12 12 20.71 7"}],["line",{"x1":"12","x2":"12","y1":"22","y2":"12"}]],
  questions: [["path",{"d":"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"}]],
  applications: [["rect",{"width":"20","height":"14","x":"2","y":"7","rx":"2","ry":"2"}],["path",{"d":"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"}]],
  subscribers: [["rect",{"width":"20","height":"16","x":"2","y":"4","rx":"2"}],["path",{"d":"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"}]],
  roadmap: [["path",{"d":"M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"}],["path",{"d":"M12 13v8"}],["path",{"d":"M12 3v3"}]],
  video: [["path",{"d":"m22 8-6 4 6 4V8Z"}],["rect",{"width":"14","height":"12","x":"2","y":"6","rx":"2","ry":"2"}]],
  menu: [["line",{"x1":"4","x2":"20","y1":"12","y2":"12"}],["line",{"x1":"4","x2":"20","y1":"6","y2":"6"}],["line",{"x1":"4","x2":"20","y1":"18","y2":"18"}]],
  x: [["path",{"d":"M18 6 6 18"}],["path",{"d":"m6 6 12 12"}]],
  search: [["circle",{"cx":"11","cy":"11","r":"8"}],["path",{"d":"m21 21-4.3-4.3"}]],
  download: [["path",{"d":"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}],["polyline",{"points":"7 10 12 15 17 10"}],["line",{"x1":"12","x2":"12","y1":"15","y2":"3"}]],
  trash: [["path",{"d":"M3 6h18"}],["path",{"d":"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"}],["path",{"d":"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"}],["line",{"x1":"10","x2":"10","y1":"11","y2":"17"}],["line",{"x1":"14","x2":"14","y1":"11","y2":"17"}]],
  copy: [["rect",{"width":"14","height":"14","x":"8","y":"8","rx":"2","ry":"2"}],["path",{"d":"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"}]],
  check: [["polyline",{"points":"20 6 9 17 4 12"}]],
  external: [["path",{"d":"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"}],["polyline",{"points":"15 3 21 3 21 9"}],["line",{"x1":"10","x2":"21","y1":"14","y2":"3"}]],
  chevronLeft: [["path",{"d":"m15 18-6-6 6-6"}]],
  chevronRight: [["path",{"d":"m9 18 6-6-6-6"}]],
  chevronDown: [["path",{"d":"m6 9 6 6 6-6"}]],
  arrowRight: [["path",{"d":"M5 12h14"}],["path",{"d":"m12 5 7 7-7 7"}]],
  alert: [["path",{"d":"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"}],["path",{"d":"M12 9v4"}],["path",{"d":"M12 17h.01"}]],
  info: [["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M12 16v-4"}],["path",{"d":"M12 8h.01"}]],
  refresh: [["path",{"d":"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"}],["path",{"d":"M21 3v5h-5"}],["path",{"d":"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"}],["path",{"d":"M8 16H3v5"}]],
  file: [["path",{"d":"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"}],["polyline",{"points":"14 2 14 8 20 8"}],["line",{"x1":"16","x2":"8","y1":"13","y2":"13"}],["line",{"x1":"16","x2":"8","y1":"17","y2":"17"}],["line",{"x1":"10","x2":"8","y1":"9","y2":"9"}]],
  phone: [["path",{"d":"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"}]],
  send: [["path",{"d":"m22 2-7 20-4-9-9-4Z"}],["path",{"d":"M22 2 11 13"}]],
  eye: [["path",{"d":"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"}],["circle",{"cx":"12","cy":"12","r":"3"}]],
  eyeOff: [["path",{"d":"M9.88 9.88a3 3 0 1 0 4.24 4.24"}],["path",{"d":"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"}],["path",{"d":"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"}],["line",{"x1":"2","x2":"22","y1":"2","y2":"22"}]],
  spinner: [["path",{"d":"M21 12a9 9 0 1 1-6.219-8.56"}]],
  lock: [["rect",{"width":"18","height":"11","x":"3","y":"11","rx":"2","ry":"2"}],["path",{"d":"M7 11V7a5 5 0 0 1 10 0v4"}]],
  filter: [["path",{"d":"M3 6h18"}],["path",{"d":"M7 12h10"}],["path",{"d":"M10 18h4"}]],
  reset: [["path",{"d":"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{"d":"M3 3v5h5"}]],
  pencil: [["path",{"d":"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"}],["path",{"d":"m15 5 4 4"}]],
  logout: [["path",{"d":"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}],["polyline",{"points":"16 17 21 12 16 7"}],["line",{"x1":"21","x2":"9","y1":"12","y2":"12"}]],
  save: [["path",{"d":"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"}],["polyline",{"points":"17 21 17 13 7 13 7 21"}],["polyline",{"points":"7 3 7 8 15 8"}]],
  circleCheck: [["path",{"d":"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"}],["path",{"d":"m9 12 2 2 4-4"}]],
  globe: [["circle",{"cx":"12","cy":"12","r":"10"}],["line",{"x1":"2","x2":"22","y1":"12","y2":"12"}],["path",{"d":"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"}]],
};

/** Decorative by default (aria-hidden); pass `title` to make it an image with a name. */
export default function Icon({ name, size = 18, className = "", title }) {
  const shapes = SHAPES[name];
  if (!shapes) return null;
  return (
    <svg
      className={`adm-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      aria-label={title}
      focusable="false"
    >
      {shapes.map(([Tag, attrs], i) => (
        <Tag key={i} {...attrs} />
      ))}
    </svg>
  );
}
