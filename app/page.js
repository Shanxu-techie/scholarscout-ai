"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const mountRef = useRef(null);
  const threeRef = useRef({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    field: "",
    nationality: "",
    degree: "Masters",
    gpa: "",
    financialNeed: false,
    preferredCountry: "",
  });
  const router = useRouter();

 useEffect(() => {
  const mount = mountRef.current;
  const three = threeRef.current;

  async function init() {
    if (!mount) return;                          
    const THREE = await import("three");
    const container = mount;                     

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    three.renderer = renderer;
    three.camera = camera;

    three.group = group;
    three.leftArm = leftArm;
    three.tLine = tLine;
    three.head = head;

    function animate() {
      three.animId = requestAnimationFrame(animate);   
      const t = Date.now() * 0.001;
      group.position.y = Math.sin(t * 1.3) * 0.1;
      group.rotation.y = Math.sin(t * 0.7) * 0.18;
      leftArm.rotation.z = 0.35 + Math.sin(t * 2.5) * 0.22;
      tLine.rotation.z = Math.sin(t * 2.2) * 0.12;
      head.rotation.z = Math.sin(t * 1.0) * 0.04;
      renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      if (!mount || !three.renderer) return;          
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      three.renderer.setSize(w, h);
      three.camera.aspect = w / h;
      three.camera.updateProjectionMatrix();
    });
    ro.observe(container);
    three.ro = ro;
  }

  init();

  return () => {
    if (three.animId) cancelAnimationFrame(three.animId);
    if (three.ro) three.ro.disconnect();
    if (three.renderer) {
      three.renderer.dispose();
      try {
        mount?.removeChild(three.renderer.domElement);
      } catch (_) {}
    }
  };
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const studentProfile = {
      fieldOfStudy: formData.field,
      nationality: formData.nationality,
      degreeLevel: formData.degree,
      gpa: Number(formData.gpa),
      financialNeed: formData.financialNeed,
      preferredCountry: formData.preferredCountry,
    };

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfile,
        }),
      });

      const data = await res.json();

      console.log("API response:", data);
      console.log("Results:", data.results);
      console.log("Profile:", studentProfile);

      sessionStorage.setItem(
        "scholarscout_results",
        JSON.stringify(data.results),
      );

      sessionStorage.setItem(
        "scholarscout_profile",
        JSON.stringify(studentProfile),
      );

      router.push("/results");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "linear-gradient(135deg, #eef6e8 0%, #fce8ef 100%)",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
      }}
    >
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ctaFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 8px 30px rgba(61,105,34,0.38); }
          50%      { box-shadow: 0 8px 55px rgba(61,105,34,0.65), 0 0 0 10px rgba(61,105,34,0.08); }
        }
        .cta-btn {
          background: linear-gradient(135deg, #3d6922, #6ab040);
          color: #fff; border: none;
          padding: 1rem 2.6rem; border-radius: 50px;
          font-size: 1.1rem; font-weight: 700; cursor: pointer;
          animation: pulseGlow 2.6s ease-in-out infinite;
          transition: transform 0.18s; font-family: inherit; letter-spacing: 0.02em;
        }
        .cta-btn:hover  { transform: translateY(-3px) scale(1.04); }
        .cta-btn:active { transform: scale(0.97); }
        .fi { width:100%; height:46px; padding:0 14px; border-radius:10px;
              border:1.5px solid #cde4b8; background:rgba(255,255,255,0.85);
              font-size:14px; color:#1a3a0a; outline:none; box-sizing:border-box;
              transition:border-color .2s,box-shadow .2s,background .2s; font-family:inherit; }
        .fi:focus { border-color:#3d6922; background:#fff; box-shadow:0 0 0 3px rgba(61,105,34,0.1); }
        .fl { display:block; font-size:11px; font-weight:700; color:#3d6922;
              margin-bottom:5px; letter-spacing:.07em; text-transform:uppercase; }
        .sb { width:100%; height:52px; border-radius:12px; border:none;
              font-size:1rem; font-weight:700; cursor:pointer; font-family:inherit;
              transition:transform .18s,box-shadow .18s; letter-spacing:.02em; }
        .sb:hover:not(:disabled)  { transform:translateY(-2px); box-shadow:0 10px 30px rgba(61,105,34,0.4); }
        .sb:active:not(:disabled) { transform:scale(0.98); }
      `}</style>

      {/* Background blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {[
          {
            top: "-15%",
            left: "-10%",
            w: "55vw",
            color: "#7dc456",
            blur: 90,
            op: 0.28,
          },
          {
            bottom: "-15%",
            right: "-10%",
            w: "60vw",
            color: "#ffb6c1",
            blur: 100,
            op: 0.3,
          },
          {
            top: "30%",
            right: "15%",
            w: "28vw",
            color: "#93c572",
            blur: 60,
            op: 0.2,
          },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...b,
              width: b.w,
              height: b.w,
              background: b.color,
              borderRadius: "50%",
              filter: `blur(${b.blur}px)`,
              opacity: b.op,
            }}
          />
        ))}
      </div>

      {/* Three.js canvas — shrinks left on transition */}
      <div
        ref={mountRef}
        style={{
          width: showForm ? "48%" : "100%",
          height: "100%",
          transition: "width 0.88s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
        }}
      />

      {/* Landing CTA — only visible before form */}
      {!showForm && (
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            zIndex: 10,
            pointerEvents: "all",
            animation: "ctaFadeIn 1s ease-out 0.4s both",
          }}
        >
          <div
            style={{
              fontSize: "3.8rem",
              fontWeight: 900,
              color: "#1c4008",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBottom: "0.5rem",
              textShadow: "0 2px 30px rgba(255,255,255,0.55)",
            }}
          >
            🎓 ScholarScout AI
          </div>
          <p
            style={{
              fontSize: "1.15rem",
              color: "#3d6922",
              marginBottom: "2.2rem",
              fontWeight: 500,
              opacity: 0.88,
            }}
          >
            AI-powered scholarship discovery, tailored to you
          </p>
          <button className="cta-btn" onClick={() => setShowForm(true)}>
            Find My Scholarship &nbsp;→
          </button>
          <div
            style={{
              marginTop: "0.9rem",
              fontSize: "0.78rem",
              color: "#5a7a4a",
              opacity: 0.65,
            }}
          >
            Powered by Azure AI Foundry
          </div>
        </div>
      )}

      {/* Form panel — slides in from right */}
      <div
        style={{
          width: showForm ? "52%" : "0%",
          height: "100%",
          overflow: showForm ? "auto" : "hidden",
          transition: "width 0.88s cubic-bezier(0.4,0,0.2,1)",
          flexShrink: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: showForm ? "2rem 2.5rem 2rem 1.5rem" : "0",
        }}
      >
        {showForm && (
          <div
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.72)",
              borderRadius: "28px",
              padding: "2.5rem",
              width: "100%",
              maxWidth: "460px",
              boxShadow:
                "0 24px 64px rgba(61,105,34,0.13),0 2px 12px rgba(0,0,0,0.06)",
              animation:
                "fadeSlideIn 0.65s cubic-bezier(0.2,0.8,0.2,1) 0.38s both",
            }}
          >
            <div style={{ marginBottom: "1.5rem" }}>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "#1c4008",
                  margin: 0,
                }}
              >
                Your Profile
              </h2>
              <p
                style={{
                  color: "#5a7a4a",
                  marginTop: "0.4rem",
                  fontSize: "0.9rem",
                }}
              >
                We will match you with the best scholarships worldwide.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label className="fl">
                  Field of Study <span style={{ color: "#e53935" }}>*</span>
                </label>
                <input
                  className="fi"
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={formData.field}
                  onChange={(e) =>
                    setFormData({ ...formData, field: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="fl">
                  Nationality <span style={{ color: "#e53935" }}>*</span>
                </label>
                <input
                  className="fi"
                  type="text"
                  placeholder="e.g. Pakistani"
                  value={formData.nationality}
                  onChange={(e) =>
                    setFormData({ ...formData, nationality: e.target.value })
                  }
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.8rem",
                }}
              >
                <div>
                  <label className="fl">
                    Degree <span style={{ color: "#e53935" }}>*</span>
                  </label>
                  <select
                    className="fi"
                    value={formData.degree}
                    onChange={(e) =>
                      setFormData({ ...formData, degree: e.target.value })
                    }
                  >
                    <option>Bachelors</option>
                    <option>Masters</option>
                    <option>PhD</option>
                    <option>Post-Doc</option>
                  </select>
                </div>
                <div>
                  <label className="fl">
                    GPA <span style={{ color: "#e53935" }}>*</span>
                  </label>
                  <input
                    className="fi"
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    placeholder="0.0 – 4.0"
                    value={formData.gpa}
                    onChange={(e) =>
                      setFormData({ ...formData, gpa: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="fl">
                  Preferred Country
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: "11px",
                      opacity: 0.6,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    {" "}
                    (optional)
                  </span>
                </label>
                <input
                  className="fi"
                  type="text"
                  placeholder="e.g. United Kingdom"
                  value={formData.preferredCountry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredCountry: e.target.value,
                    })
                  }
                />
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  padding: "2px 0",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.financialNeed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      financialNeed: e.target.checked,
                    })
                  }
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: "#3d6922",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    color: "#2a5010",
                    fontWeight: 500,
                  }}
                >
                  I have financial need
                </span>
              </label>

              <button
                className="sb"
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "0.4rem",
                  background: loading
                    ? "#a8c896"
                    : "linear-gradient(135deg,#3d6922 0%,#6ab040 100%)",
                  color: "white",
                  boxShadow: loading
                    ? "none"
                    : "0 6px 24px rgba(61,105,34,0.32)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Finding your matches..." : "Find My Scholarships →"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
