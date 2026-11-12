/** An error that is safe to show to the caller: it carries an HTTP status and a stable code. */
export class HttpError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}
