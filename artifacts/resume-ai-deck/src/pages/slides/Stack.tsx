export default function Stack() {
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
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw",
          height: "60vw",
          borderRadius: "50%",
          backgroundColor: "#4F7FFF",
          opacity: 0.07,
          filter: "blur(15vw)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20vh",
          right: "-10vw",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          backgroundColor: "#7C6BF0",
          opacity: 0.09,
          filter: "blur(8vw)",
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
          alignItems: "center",
          width: "84vw",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "5vh" }}>
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
            Under the Hood
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
            Built on a modern stack
          </h2>
        </div>

        {/* Stack cards */}
        <div style={{ display: "flex", gap: "2vw", width: "100%", justifyContent: "center", marginBottom: "4vh" }}>
          <div style={{ flex: 1, padding: "3vh 1.8vw", backgroundColor: "#131726", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "1vw", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            <div style={{ fontSize: "0.85vw", color: "#4F7FFF", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Frontend</div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, lineHeight: 1.35 }}>React + Vite</div>
            <div style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.5 }}>Tailwind &amp; shadcn/ui</div>
          </div>
          <div style={{ flex: 1, padding: "3vh 1.8vw", backgroundColor: "#131726", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "1vw", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            <div style={{ fontSize: "0.85vw", color: "#7C6BF0", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Backend</div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, lineHeight: 1.35 }}>Express + Postgres</div>
            <div style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.5 }}>Drizzle ORM</div>
          </div>
          <div style={{ flex: 1, padding: "3vh 1.8vw", backgroundColor: "#131726", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "1vw", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            <div style={{ fontSize: "0.85vw", color: "#4F7FFF", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>AI</div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, lineHeight: 1.35 }}>OpenAI gpt-5.1</div>
            <div style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.5 }}>via Replit AI Integrations</div>
          </div>
          <div style={{ flex: 1, padding: "3vh 1.8vw", backgroundColor: "#131726", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "1vw", display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            <div style={{ fontSize: "0.85vw", color: "#7C6BF0", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>API</div>
            <div style={{ fontSize: "1.3vw", fontWeight: 700, lineHeight: 1.35 }}>Contract-first</div>
            <div style={{ fontSize: "1vw", fontWeight: 300, color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.5 }}>OpenAPI codegen &amp; Zod</div>
          </div>
        </div>

        {/* Formats strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5vw",
            padding: "1.8vh 2.4vw",
            backgroundColor: "rgba(79, 127, 255, 0.08)",
            border: "1px solid rgba(79, 127, 255, 0.2)",
            borderRadius: "1vw",
          }}
        >
          <span style={{ fontSize: "1.1vw", fontWeight: 600, color: "rgba(255, 255, 255, 0.85)" }}>Download formats</span>
          <span style={{ width: "1px", height: "2vh", backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
          <span style={{ fontSize: "1.1vw", fontWeight: 700, color: "#4F7FFF" }}>PDF</span>
          <span style={{ fontSize: "1.1vw", fontWeight: 700, color: "#7C6BF0" }}>DOCX</span>
          <span style={{ fontSize: "1.1vw", fontWeight: 700, color: "#27C93F" }}>TXT</span>
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
        05 / 05
      </div>
    </div>
  );
}
