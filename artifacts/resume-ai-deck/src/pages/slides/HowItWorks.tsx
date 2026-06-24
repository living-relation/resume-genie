export default function HowItWorks() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "#0C0F1A",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#FFFFFF",
      }}
    >
      {/* Background Accent Shapes */}
      <div
        style={{
          position: "absolute",
          top: "10vh",
          left: "20vw",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          backgroundColor: "#7C6BF0",
          opacity: 0.08,
          filter: "blur(12vw)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10vh",
          right: "10vw",
          width: "45vw",
          height: "45vw",
          borderRadius: "50%",
          backgroundColor: "#4F7FFF",
          opacity: 0.06,
          filter: "blur(10vw)",
        }}
      />

      {/* Grid Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "4vw 4vw",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      {/* Header Info */}
      <div
        style={{
          position: "absolute",
          top: "5vh",
          left: "5vw",
          display: "flex",
          alignItems: "center",
          gap: "1vw",
          zIndex: 10,
        }}
      >
        <div style={{ width: "2vw", height: "2vw", backgroundColor: "#4F7FFF", borderRadius: "0.4vw" }} />
        <div style={{ fontSize: "1.2vw", fontWeight: 700, letterSpacing: "-0.02em" }}>Resume AI</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "5vh",
          right: "5vw",
          fontSize: "1vw",
          fontWeight: 400,
          color: "rgba(255, 255, 255, 0.5)",
          zIndex: 10,
        }}
      >
        2026
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          width: "84vw",
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: "4vh" }}>
          <div
            style={{
              display: "inline-block",
              padding: "0.5vh 1vw",
              backgroundColor: "rgba(124, 107, 240, 0.15)",
              border: "1px solid rgba(124, 107, 240, 0.3)",
              borderRadius: "2vw",
              color: "#7C6BF0",
              fontSize: "0.9vw",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "2vh",
            }}
          >
            The Workflow
          </div>
          <h2
            style={{
              fontSize: "3.6vw",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            How it works
          </h2>
        </div>

        {/* Steps grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "4vw", rowGap: "2.6vh" }}>
          {/* Step 1 */}
          <div style={{ display: "flex", gap: "1.4vw", alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: "2.6vw", height: "2.6vw", borderRadius: "0.6vw", backgroundColor: "rgba(79, 127, 255, 0.15)", border: "1px solid rgba(79, 127, 255, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F7FFF", fontWeight: 700, fontSize: "1.2vw" }}>1</div>
            <div>
              <h4 style={{ fontSize: "1.4vw", fontWeight: 700, margin: "0 0 0.5vh 0" }}>Upload</h4>
              <p style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
                Paste your resumes, cover letters, writing samples, profiles, or anything that describes your skills.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: "flex", gap: "1.4vw", alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: "2.6vw", height: "2.6vw", borderRadius: "0.6vw", backgroundColor: "rgba(79, 127, 255, 0.15)", border: "1px solid rgba(79, 127, 255, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F7FFF", fontWeight: 700, fontSize: "1.2vw" }}>2</div>
            <div>
              <h4 style={{ fontSize: "1.4vw", fontWeight: 700, margin: "0 0 0.5vh 0" }}>Add jobs</h4>
              <p style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
                Paste job listing URLs or plain text; the app scrapes the company, keywords, and full description.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: "flex", gap: "1.4vw", alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: "2.6vw", height: "2.6vw", borderRadius: "0.6vw", backgroundColor: "rgba(124, 107, 240, 0.15)", border: "1px solid rgba(124, 107, 240, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C6BF0", fontWeight: 700, fontSize: "1.2vw" }}>3</div>
            <div>
              <h4 style={{ fontSize: "1.4vw", fontWeight: 700, margin: "0 0 0.5vh 0" }}>Add your details</h4>
              <p style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
                Add name and contact info in settings, or leave blank to fill in manually after download.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{ display: "flex", gap: "1.4vw", alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: "2.6vw", height: "2.6vw", borderRadius: "0.6vw", backgroundColor: "rgba(124, 107, 240, 0.15)", border: "1px solid rgba(124, 107, 240, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C6BF0", fontWeight: 700, fontSize: "1.2vw" }}>4</div>
            <div>
              <h4 style={{ fontSize: "1.4vw", fontWeight: 700, margin: "0 0 0.5vh 0" }}>Tune the output</h4>
              <p style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
                Set the truthfulness scale, the style, and the verbosity before you generate.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div style={{ display: "flex", gap: "1.4vw", alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: "2.6vw", height: "2.6vw", borderRadius: "0.6vw", backgroundColor: "rgba(39, 201, 63, 0.15)", border: "1px solid rgba(39, 201, 63, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#27C93F", fontWeight: 700, fontSize: "1.2vw" }}>5</div>
            <div>
              <h4 style={{ fontSize: "1.4vw", fontWeight: 700, margin: "0 0 0.5vh 0" }}>Generate</h4>
              <p style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
                The AI reads your documents and each job, then writes a tailored resume and cover letter &mdash; all in parallel.
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div style={{ display: "flex", gap: "1.4vw", alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: "2.6vw", height: "2.6vw", borderRadius: "0.6vw", backgroundColor: "rgba(39, 201, 63, 0.15)", border: "1px solid rgba(39, 201, 63, 0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "#27C93F", fontWeight: 700, fontSize: "1.2vw" }}>6</div>
            <div>
              <h4 style={{ fontSize: "1.4vw", fontWeight: 700, margin: "0 0 0.5vh 0" }}>Download</h4>
              <p style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.6)", margin: 0, lineHeight: 1.5 }}>
                Copy the plain-text result, or download each as a finished, formatted, stylized document.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          position: "absolute",
          bottom: "5vh",
          left: "5vw",
          fontSize: "0.9vw",
          fontWeight: 400,
          color: "rgba(255, 255, 255, 0.4)",
          letterSpacing: "0.1em",
        }}
      >
        TAILORED RESUMES &amp; COVER LETTERS
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "5vh",
          right: "5vw",
          fontSize: "0.9vw",
          fontWeight: 400,
          color: "rgba(255, 255, 255, 0.4)",
          letterSpacing: "0.05em",
        }}
      >
        03 / 05
      </div>
    </div>
  );
}
