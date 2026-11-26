import assert from "node:assert/strict";
import { once } from "node:events";
import type { Server } from "node:http";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";

process.env.SESSION_SECRET ??= "test-session-secret";
delete process.env.DATABASE_URL;

const { default: app } = await import("../src/app");

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function multipart(file: { filename: string; contentType: string; content: Buffer }) {
  const boundary = "----rgformboundary";
  const typeLine = file.contentType ? `Content-Type: ${file.contentType}\r\n` : "";
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.filename}"\r\n${typeLine}\r\n`,
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  return {
    body: Buffer.concat([head, file.content, tail]),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

async function start(): Promise<{ server: Server; base: string }> {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address() as AddressInfo;
  return { server, base: `http://127.0.0.1:${port}` };
}

async function readJson(response: Response): Promise<{ status: number; body: { error?: string; text?: string }; contentType: string; setCookie: string }> {
  const text = await response.text();
  assert.equal(text.includes("<html"), false, text.slice(0, 180));
  let body: { error?: string; text?: string } = {};
  if (text) body = JSON.parse(text) as { error?: string; text?: string };
  return {
    status: response.status,
    body,
    contentType: response.headers.get("content-type") ?? "",
    setCookie: response.headers.get("set-cookie") ?? "",
  };
}

describe("document upload errors", { concurrency: false }, () => {
  let server: Server;
  let base: string;
  const savedDatabaseUrl = process.env.DATABASE_URL;
  const savedCookieSecure = process.env.COOKIE_SECURE;

  before(async () => {
    delete process.env.DATABASE_URL;
    delete process.env.COOKIE_SECURE;
    ({ server, base } = await start());
  });

  after(async () => {
    server.close();
    await once(server, "close");
    if (savedDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedDatabaseUrl;
    if (savedCookieSecure === undefined) delete process.env.COOKIE_SECURE;
    else process.env.COOKIE_SECURE = savedCookieSecure;
  });

  it("returns JSON when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;
    const response = await fetch(`${base}/api/documents`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Resume", type: "resume", content: "Hello" }),
    });
    const result = await readJson(response);
    assert.equal(result.status, 500);
    assert.match(result.contentType, /application\/json/);
    assert.match(result.body.error ?? "", /DATABASE_URL is not set/);
    assert.match(result.body.error ?? "", /restart the API/);
  });

  it("returns JSON when the database cannot be reached", async () => {
    process.env.DATABASE_URL = "postgres://resume:resume@127.0.0.1:1/resume_genie_missing";
    process.env.DATABASE_SSL = "false";
    const response = await fetch(`${base}/api/documents`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Resume", type: "resume", content: "Hello" }),
    });
    const result = await readJson(response);
    assert.equal(result.status, 500);
    assert.match(result.contentType, /application\/json/);
    assert.match(result.body.error ?? "", /database could not be reached/);
    assert.doesNotMatch(result.body.error ?? "", /postgres:\/\//);
    delete process.env.DATABASE_URL;
  });

  it("rejects a file over 10 MB with JSON", async () => {
    const form = multipart({
      filename: "big.txt",
      contentType: "text/plain",
      content: Buffer.alloc(10 * 1024 * 1024 + 1, 0x61),
    });
    const response = await fetch(`${base}/api/documents/extract-pdf`, {
      method: "POST",
      headers: { "content-type": form.contentType },
      body: form.body,
    });
    const result = await readJson(response);
    assert.equal(result.status, 400);
    assert.match(result.contentType, /application\/json/);
    assert.match(result.body.error ?? "", /10 MB/);
  });

  it("rejects an unsupported type and a MIME/extension conflict as JSON", async () => {
    const png = multipart({
      filename: "pic.png",
      contentType: "image/png",
      content: Buffer.from("not-a-png"),
    });
    const unsupported = await readJson(
      await fetch(`${base}/api/documents/extract-pdf`, {
        method: "POST",
        headers: { "content-type": png.contentType },
        body: png.body,
      }),
    );
    assert.equal(unsupported.status, 400);
    assert.match(unsupported.body.error ?? "", /Unsupported file type/);

    const conflict = multipart({
      filename: "notes.txt",
      contentType: "application/pdf",
      content: Buffer.from("hello"),
    });
    const rejected = await readJson(
      await fetch(`${base}/api/documents/extract-pdf`, {
        method: "POST",
        headers: { "content-type": conflict.contentType },
        body: conflict.body,
      }),
    );
    assert.equal(rejected.status, 400);
    assert.match(rejected.body.error ?? "", /extension and MIME type disagree/);
  });

  it("extracts TXT sent as an empty MIME or octet-stream, and real PDF/DOCX/DOC names", async () => {
    const cases = [
      { filename: "plain.txt", contentType: "application/octet-stream", content: "octet text" },
      { filename: "empty.txt", contentType: "", content: "empty mime" },
      { filename: "also.txt", contentType: "text/plain", content: "plain text" },
    ];
    for (const sample of cases) {
      const form = multipart({ ...sample, content: Buffer.from(sample.content) });
      const headers: Record<string, string> = {};
      if (form.contentType) headers["content-type"] = form.contentType;
      const result = await readJson(
        await fetch(`${base}/api/documents/extract-pdf`, { method: "POST", headers, body: form.body }),
      );
      assert.equal(result.status, 200, `${sample.filename} ${sample.contentType} ${result.body.error}`);
      assert.equal(result.body.text, sample.content);
    }

    const named = [
      { filename: "resume.pdf", contentType: "application/pdf" },
      { filename: "resume.docx", contentType: DOCX },
      { filename: "resume.doc", contentType: "application/msword" },
    ];
    for (const sample of named) {
      const form = multipart({ ...sample, content: Buffer.from("this is not a real document") });
      const result = await readJson(
        await fetch(`${base}/api/documents/extract-pdf`, {
          method: "POST",
          headers: { "content-type": form.contentType },
          body: form.body,
        }),
      );
      assert.equal(result.status, 400, sample.filename);
      assert.match(result.contentType, /application\/json/);
      assert.doesNotMatch(result.body.error ?? "", /Unsupported file type/);
      assert.doesNotMatch(result.body.error ?? "", /disagree/);
    }
  });

  it("sets the session cookie for HTTP LAN, COOKIE_SECURE, and a reverse proxy", async () => {
    delete process.env.COOKIE_SECURE;
    const lan = await fetch(`${base}/api/healthz`);
    assert.equal(lan.status, 200);
    const lanCookie = await readJson(await fetch(`${base}/api/documents`, { method: "GET" }));
    assert.equal(lanCookie.status, 500);
    assert.match(lanCookie.contentType, /application\/json/);
    assert.match(lanCookie.setCookie, /rg_sid=/);
    assert.doesNotMatch(lanCookie.setCookie, /;\s*Secure/i);

    process.env.COOKIE_SECURE = "true";
    const forced = await readJson(await fetch(`${base}/api/documents`, { method: "GET" }));
    assert.match(forced.setCookie, /;\s*Secure/i);

    delete process.env.COOKIE_SECURE;
    const proxied = await readJson(
      await fetch(`${base}/api/documents`, {
        method: "GET",
        headers: { "x-forwarded-proto": "https" },
      }),
    );
    assert.match(proxied.setCookie, /;\s*Secure/i);
  });
});
