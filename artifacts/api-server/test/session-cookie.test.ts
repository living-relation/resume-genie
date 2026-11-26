import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldUseSecureCookie } from "../src/lib/session";

describe("shouldUseSecureCookie", () => {
  it("keeps a home LAN on HTTP insecure", () => {
    assert.equal(
      shouldUseSecureCookie({ cookieSecure: undefined, requestSecure: false, forwardedProto: undefined }),
      false,
    );
    assert.equal(
      shouldUseSecureCookie({ cookieSecure: "", requestSecure: false, forwardedProto: "http" }),
      false,
    );
  });

  it("sets Secure for a direct HTTPS request", () => {
    assert.equal(
      shouldUseSecureCookie({ cookieSecure: undefined, requestSecure: true, forwardedProto: undefined }),
      true,
    );
  });

  it("honors a reverse proxy's X-Forwarded-Proto, including a multi-hop list", () => {
    assert.equal(
      shouldUseSecureCookie({ cookieSecure: undefined, requestSecure: false, forwardedProto: "https" }),
      true,
    );
    assert.equal(
      shouldUseSecureCookie({
        cookieSecure: undefined,
        requestSecure: false,
        forwardedProto: "HTTPS, http",
      }),
      true,
    );
    assert.equal(
      shouldUseSecureCookie({
        cookieSecure: undefined,
        requestSecure: false,
        forwardedProto: ["https", "http"],
      }),
      true,
    );
    assert.equal(
      shouldUseSecureCookie({ cookieSecure: undefined, requestSecure: false, forwardedProto: "http" }),
      false,
    );
  });

  it("forces Secure when COOKIE_SECURE=true even on plain HTTP", () => {
    assert.equal(
      shouldUseSecureCookie({ cookieSecure: "true", requestSecure: false, forwardedProto: "http" }),
      true,
    );
    assert.equal(
      shouldUseSecureCookie({ cookieSecure: " TRUE ", requestSecure: false, forwardedProto: undefined }),
      true,
    );
  });
});
