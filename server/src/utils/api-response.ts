// ── Response Shape ──────────────────────────────────────────────────────
export interface ApiResponseBody<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}

// ── ApiException – throwable HTTP error ─────────────────────────────────
export class ApiException extends Error {
  public readonly statusCode: number;
  public readonly errors: string[];

  constructor(message: string, statusCode?: number, errors?: string[]);
  constructor(statusCode: number, message: string, errors?: string[]);
  constructor(
    arg1: string | number,
    arg2?: string | number,
    errors: string[] = []
  ) {
    let msg = "";
    let code = 500;

    if (typeof arg1 === "number") {
      code = arg1;
      msg = typeof arg2 === "string" ? arg2 : "";
    } else {
      msg = arg1;
      code = typeof arg2 === "number" ? arg2 : 500;
    }

    super(msg);
    this.name = "ApiException";
    this.statusCode = code;
    this.errors = errors;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiException.prototype);
  }
}

