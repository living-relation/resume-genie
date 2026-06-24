export default function Privacy() {
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
          top: "-20vh",
          left: "-10vw",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          backgroundColor: "#7C6BF0",
          opacity: 0.06,
          filter: "blur(9vw)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-25vh",
          right: "-12vw",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          backgroundColor: "#4F7FFF",
          opacity: 0.05,
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
              backgroundColor: "rgba(79, 127, 255, 0.15)",
              border: "1px solid rgba(79, 127, 255, 0.3)",
              borderRadius: "2vw",
              color: "#4F7FFF",
              fontSize: "0.9vw",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "2vh",
            }}
          >
            Privacy
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
            Private by default
          </h2>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.4vh 2.4vw" }}>
          {/* Card 1 */}
          <div style={{ padding: "3vh 2vw", backgroundColor: "#131726", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "1vw", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            <h4 style={{ fontSize: "1.4vw", fontWeight: 700, margin: 0, color: "#4F7FFF" }}>No login required</h4>
            <p style={{ fontSize: "1.05vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.7)", margin: 0, lineHeight: 1.5 }}>
              Each browser automatically gets its own private space &mdash; no account, no sign-up.
            </p>
          </div>

          {/* Card 2 */}
          <div style={{ padding: "3vh 2vw", backgroundColor: "#131726", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "1vw", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            <h4 style={{ fontSize: "1.4vw", fontWeight: 700, margin: 0, color: "#7C6BF0" }}>Visible only to you</h4>
            <p style={{ fontSize: "1.05vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.7)", margin: 0, lineHeight: 1.5 }}>
              Your documents, jobs, and generated applications are never shared with anyone else.
            </p>
          </div>

          {/* Card 3 */}
          <div style={{ padding: "3vh 2vw", backgroundColor: "#131726", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "1vw", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            <h4 style={{ fontSize: "1.4vw", fontWeight: 700, margin: 0, color: "#4F7FFF" }}>Erased when you leave</h4>
            <p style={{ fontSize: "1.05vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.7)", margin: 0, lineHeight: 1.5 }}>
              Anything you attach is tied to your local session, so the record stays private to you.
            </p>
          </div>

          {/* Card 4 */}
          <div style={{ padding: "3vh 2vw", backgroundColor: "#131726", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "1vw", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            <h4 style={{ fontSize: "1.4vw", fontWeight: 700, margin: 0, color: "#7C6BF0" }}>Isolated parallel agents</h4>
            <p style={{ fontSize: "1.05vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.7)", margin: 0, lineHeight: 1.5 }}>
              Each agent works on a single resume and cover letter &mdash; no cross-talk, no missing info.
            </p>
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
        04 / 05
      </div>
    </div>
  );
}
