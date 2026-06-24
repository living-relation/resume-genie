export default function Problem() {
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
          right: "-10vw",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          backgroundColor: "#4F7FFF",
          opacity: 0.05,
          filter: "blur(8vw)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-30vh",
          left: "-15vw",
          width: "60vw",
          height: "60vw",
          borderRadius: "50%",
          backgroundColor: "#7C6BF0",
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

      {/* Content Area */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          width: "80vw",
          height: "66vh",
          alignItems: "center",
          gap: "6vw",
        }}
      >
        {/* Left Text */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3vh" }}>
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
              alignSelf: "flex-start",
            }}
          >
            The Problem
          </div>
          <h2
            style={{
              fontSize: "3.8vw",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            One resume doesn&rsquo;t{" "}
            <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>fit every job.</span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "2.4vh", marginTop: "1vh" }}>
            <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
              <div style={{ marginTop: "0.4vh", color: "#7C6BF0", fontSize: "1.4vw", fontWeight: 700, lineHeight: 1 }}>&#8594;</div>
              <p style={{ fontSize: "1.25vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.8)", margin: 0, lineHeight: 1.5 }}>
                Every posting wants different keywords and emphasis.
              </p>
            </div>
            <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
              <div style={{ marginTop: "0.4vh", color: "#7C6BF0", fontSize: "1.4vw", fontWeight: 700, lineHeight: 1 }}>&#8594;</div>
              <p style={{ fontSize: "1.25vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.8)", margin: 0, lineHeight: 1.5 }}>
                Manually rewriting your resume per application is slow.
              </p>
            </div>
            <div style={{ display: "flex", gap: "1vw", alignItems: "flex-start" }}>
              <div style={{ marginTop: "0.4vh", color: "#7C6BF0", fontSize: "1.4vw", fontWeight: 700, lineHeight: 1 }}>&#8594;</div>
              <p style={{ fontSize: "1.25vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.8)", margin: 0, lineHeight: 1.5 }}>
                Generic applications get filtered out before a human reads them.
              </p>
            </div>
          </div>
        </div>

        {/* Right emphasis card */}
        <div
          style={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: "5vh 3vw",
              backgroundColor: "#131726",
              border: "1px solid rgba(124, 107, 240, 0.25)",
              borderRadius: "1.2vw",
              boxShadow: "0 2vh 5vh rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
            }}
          >
            <div style={{ fontSize: "1vw", color: "#7C6BF0", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>
              The difference
            </div>
            <div style={{ fontSize: "2.3vw", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              Beats any resume app you&rsquo;ve tried.
            </div>
            <div style={{ fontSize: "1.2vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.6 }}>
              And you only have to set it up once &mdash; then every job gets its own tailored
              resume and cover letter, automatically.
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
        02 / 05
      </div>
    </div>
  );
}
