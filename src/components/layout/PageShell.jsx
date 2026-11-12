import Footer from "../common/Footer";

/**
 * Every page body: dark canvas, main landmark, shared footer.
 */
function PageShell({ children, className = "" }) {
  return (
    <div className={`flex min-h-screen flex-col bg-ink-900 ${className}`}>
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default PageShell;
