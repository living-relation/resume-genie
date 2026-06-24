export default function Title() {
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

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "72vw",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.6vh 1.2vw",
            backgroundColor: "rgba(124, 107, 240, 0.15)",
            border: "1px solid rgba(124, 107, 240, 0.3)",
            borderRadius: "2vw",
            color: "#7C6BF0",
            fontSize: "1vw",
            fontWeight: 600,
            marginBottom: "4vh",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          AI-Powered Resume Builder
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "7vw",
            fontWeight: 800,
            margin: "0 0 2vh 0",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
          }}
        >
          Resume AI
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "2vw",
            fontWeight: 600,
            color: "#FFFFFF",
            margin: "0 0 3vh 0",
            lineHeight: 1.3,
          }}
        >
          The last resume tool you&rsquo;ll need.
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: "1.4vw",
            fontWeight: 300,
            color: "rgba(255, 255, 255, 0.7)",
            margin: "0 0 5vh 0",
            lineHeight: 1.6,
            maxWidth: "52vw",
          }}
        >
          Upload your r&eacute;sum&eacute;s, letters, and writing samples. Attach 1 to 20 job
          listings, and parallel agents generate a tailored r&eacute;sum&eacute; and cover letter
          for each one &mdash; written in your own voice.
        </p>

        {/* Feature Pills */}
        <div style={{ display: "flex", gap: "1.5vw" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6vw",
              padding: "1vh 1.6vw",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "0.5vw",
              fontSize: "1vw",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.85)",
            }}
          >
            <span style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#4F7FFF" }} />
            Customizable
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6vw",
              padding: "1vh 1.6vw",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "0.5vw",
              fontSize: "1vw",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.85)",
            }}
          >
            <span style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#7C6BF0" }} />
            Your style &amp; voice
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6vw",
              padding: "1vh 1.6vw",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "0.5vw",
              fontSize: "1vw",
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.85)",
            }}
          >
            <span style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#27C93F" }} />
            Tuned for accuracy
          </div>
        </div>
      </div>

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
        01 / 05
      </div>
    </div>
  );
}
