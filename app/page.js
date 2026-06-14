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
      const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000,
      );
      camera.position.set(0, 0.5, 5);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      while (mount.firstChild) mount.removeChild(mount.firstChild);
      container.appendChild(renderer.domElement);

      three.renderer = renderer;
      three.camera = camera;

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(3, 5, 5);
      scene.add(key);
      const fill = new THREE.PointLight(0x93c572, 0.7, 20);
      fill.position.set(-4, 2, 3);
      scene.add(fill);
      const rim = new THREE.PointLight(0xffd1dc, 0.5, 20);
      rim.position.set(0, -2, -3);
      scene.add(rim);

      // Materials
      const skin = new THREE.MeshPhongMaterial({
        color: 0xffdbac,
        shininess: 30,
      });
      const shirt = new THREE.MeshPhongMaterial({
        color: 0x5a9e32,
        shininess: 20,
      });
      const pants = new THREE.MeshPhongMaterial({ color: 0x2c3e6b });
      const bag = new THREE.MeshPhongMaterial({
        color: 0xffd1dc,
        shininess: 40,
      });
      const capM = new THREE.MeshPhongMaterial({
        color: 0x1a1a2e,
        shininess: 60,
      });
      const gold = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        shininess: 100,
      });
      const eyeM = new THREE.MeshPhongMaterial({ color: 0x111111 });
      const shoe = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a,
        shininess: 80,
      });

      const group = new THREE.Group();

      // Head + face
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), skin);
      head.position.y = 1.72;
      group.add(head);

      [-0.16, 0.16].forEach((x) => {
        const eyeball = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 16, 16),
          eyeM,
        );
        eyeball.position.set(x, 1.77, 0.38);
        group.add(eyeball);
      });

      const smileGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 16, Math.PI);
      const smileMesh = new THREE.Mesh(
        smileGeo,
        new THREE.MeshPhongMaterial({ color: 0xbb4422 }),
      );
      smileMesh.position.set(0, 1.6, 0.4);
      smileMesh.rotation.z = Math.PI;
      group.add(smileMesh);

      // Body
      const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.44, 1.1, 32),
        shirt,
      );
      torso.position.y = 0.86;
      group.add(torso);

      // Arms
      const armGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.72, 16);
      const leftArm = new THREE.Mesh(armGeo, shirt);
      leftArm.position.set(-0.54, 0.9, 0);
      leftArm.rotation.z = 0.35;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, shirt);
      rightArm.position.set(0.54, 0.9, 0);
      rightArm.rotation.z = -0.35;
      group.add(rightArm);

      [-0.8, 0.8].forEach((x) => {
        const h = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), skin);
        h.position.set(x, 0.54, 0);
        group.add(h);
      });

      const legGeo = new THREE.CylinderGeometry(0.15, 0.13, 0.85, 16);
      const lLeg = new THREE.Mesh(legGeo, pants);
      lLeg.position.set(-0.22, 0.05, 0);
      group.add(lLeg);
      const rLeg = new THREE.Mesh(legGeo, pants);
      rLeg.position.set(0.22, 0.05, 0);
      group.add(rLeg);

      [-0.22, 0.22].forEach((x) => {
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.38), shoe);
        s.position.set(x, -0.35, 0.07);
        group.add(s);
      });

      const bp = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.72, 0.26), bag);
      bp.position.set(0, 0.9, -0.42);
      group.add(bp);
      const bpPocket = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.26, 0.08),
        new THREE.MeshPhongMaterial({ color: 0xffaac0 }),
      );
      bpPocket.position.set(0, 0.74, -0.57);
      group.add(bpPocket);

      const capBrim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.12, 32),
        capM,
      );
      capBrim.position.y = 2.07;
      group.add(capBrim);
      const capBoard = new THREE.Mesh(
        new THREE.BoxGeometry(0.84, 0.065, 0.84),
        capM,
      );
      capBoard.position.y = 2.18;
      group.add(capBoard);

      const tBase = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), gold);
      tBase.position.set(0.33, 2.18, 0.33);
      group.add(tBase);
      const tLine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.36, 8),
        gold,
      );
      tLine.position.set(0.33, 2.0, 0.33);
      group.add(tLine);
      const tEnd = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), gold);
      tEnd.position.set(0.33, 1.82, 0.33);
      group.add(tEnd);

      group.scale.setScalar(1.4);

      scene.add(group);

      three.group = group;
      three.leftArm = leftArm;
      three.tLine = tLine;
      three.head = head;

      function animate() {
        three.animId = requestAnimationFrame(animate);
        const t = Date.now() * 0.001;
        group.position.y = -0.7 + Math.sin(t * 1.3) * 0.1;
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
        flexWrap: "wrap",
        minHeight: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
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
          .hero-panel {
  display: block;
  width: 100%;
  flex: 1;
  min-width: 320px;
  max-width: 460px;
  margin: 0 auto;
  padding: 32px 40px 32px 24px;
  box-sizing: border-box;
  background: transparent;
  text-align: center;
}
@media (min-width: 768px) {
  .hero-panel {
    flex: 1;
    max-width: none;
  }
}       
  .degree-gpa-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

@media (max-width: 640px) {
  .degree-gpa-grid {
    grid-template-columns: 1fr;
  }
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
        .sb {
  width: 100%;
  min-height: 52px;
  padding: 0 16px;

  border-radius: 12px;
  border: none;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;

  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.02em;

  transition: transform 0.18s, box-shadow 0.18s;

  min-width: 0;
  box-sizing: border-box;
}
        .sb:hover:not(:disabled)  { transform:translateY(-2px); box-shadow:0 10px 30px rgba(61,105,34,0.4); }
        .sb:active:not(:disabled) { transform:scale(0.98); }
      `}</style>

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

      {/* HERO CARD — mascot + title/CTA, centered */}
      <div className="hero-panel">
        <div
          ref={mountRef}
          style={{ width: "100%", height: "260px", position: "relative" }}
        />

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "2.4rem",
              fontWeight: 900,
              color: "#1c4008",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBottom: "0.4rem",
            }}
          >
            ScholarScout AI
          </div>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#3d6922",
              marginBottom: "1.4rem",
              fontWeight: 500,
              opacity: 0.88,
            }}
          >
            AI-powered scholarship discovery, tailored to you
          </p>
          <button className="cta-btn" onClick={() => setShowForm(true)}>
            Find My Scholarship →
          </button>
          <div
            style={{
              marginTop: "0.8rem",
              fontSize: "0.75rem",
              color: "#5a7a4a",
              opacity: 0.65,
            }}
          >
            Powered by Azure AI Foundry
          </div>
        </div>
      </div>

      {/* Form panel — slides in from right */}
      <div
        style={{
          width: showForm ? "100%" : "0",
          maxWidth: showForm ? "700px" : "0",
          height: "100%",
          overflow: showForm ? "auto" : "hidden",
          transition: "width 0.88s cubic-bezier(0.4,0,0.2,1)",
          flexShrink: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "flex-start",
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

              <div className="degree-gpa-grid">
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
