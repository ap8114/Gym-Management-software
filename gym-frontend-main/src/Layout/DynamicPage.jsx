import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../Api/axiosInstance";

const DynamicPage = () => {
  const { slug, adminId } = useParams();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        // 1️⃣ Fetch App Settings
        const settingsRes = await axiosInstance.get(
          `/adminSettings/app-settings/admin/${adminId}`
        );

        const appSettings = settingsRes.data?.data;
        if (!appSettings) {
          setLoading(false);
          return;
        }

        const apiSlug = appSettings.url;

        // 2️⃣ Fix URL if slug missing / wrong
        if (!slug || slug !== apiSlug) {
          navigate(`/${apiSlug}/${adminId}`, { replace: true });
          return;
        }

        setSettings(appSettings);

        // 3️⃣ Fetch Plans
        const plansRes = await axiosInstance.get(
          `/MemberPlan?adminId=${adminId}`
        );

        setPlans(plansRes.data?.plans || []);
      } catch (err) {
        console.error("Dynamic page error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug, adminId, navigate]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <h4>Loading page...</h4>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center mt-5">
        <h3>Page Not Found</h3>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* ================= HERO SECTION ================= */}
      <div
        style={{
          background: "linear-gradient(135deg, #002d4d, #004b80)",
          color: "#fff",
          padding: "90px 20px",
        }}
      >
        <div className="container">
          <div className="row align-items-center">

            {/* LEFT CONTENT */}
            <div className="col-md-6 text-center text-md-start mb-5 mb-md-0">
              <h1 style={{ fontWeight: "800", letterSpacing: "1px" }}>
                {slug?.toUpperCase()}
              </h1>

              <p
                style={{
                  maxWidth: "520px",
                  marginTop: "18px",
                  lineHeight: "1.8",
                  opacity: 0.95,
                }}
              >
                {settings.description}
              </p>

              <button
                className="btn mt-4 px-4 py-2"
                style={{
                  background: "#ffffff",
                  color: "#002d4d",
                  fontWeight: "600",
                  borderRadius: "8px",
                }}
              >
                Join Now
              </button>
            </div>

            {/* RIGHT LOGO */}
            <div className="col-md-6 text-center">
              {settings.logo && (
                <div
                  style={{
                    background: "#ffffff",
                    padding: "35px",
                    borderRadius: "22px",
                    display: "inline-block",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
                  }}
                >
                  <img
                    src={settings.logo}
                    alt="logo"
                    style={{
                      width: "260px",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ================= PLANS SECTION ================= */}
      <div className="container py-5">
        <h2 className="text-center mb-4 fw-bold">
          Membership Plans
        </h2>

        {plans.length === 0 ? (
          <p className="text-center text-muted">
            No plans available
          </p>
        ) : (
          <div className="row">
            {plans.map((plan) => (
              <div className="col-md-4 mb-4" key={plan.id}>
                <div
                  className="card h-100 shadow-sm"
                  style={{ borderRadius: "14px" }}
                >
                  <div className="card-body text-center">
                    <h4 className="fw-bold">{plan.name}</h4>

                    <span
                      className="badge mb-3"
                      style={{
                        background: "#002d4d",
                        color: "#fff",
                        padding: "6px 14px",
                      }}
                    >
                      {plan.type}
                    </span>

                    <h2 className="my-3">
                      ₹{plan.price}
                      <small className="text-muted fs-6"> / plan</small>
                    </h2>

                    <ul className="list-unstyled text-muted mb-4">
                      <li>📅 Validity: {plan.validityDays} days</li>
                      <li>🏋️ Sessions: {plan.sessions}</li>
                    </ul>

                    <button
                      className="btn w-100"
                      style={{
                        background: "#002d4d",
                        color: "#fff",
                        borderRadius: "8px",
                      }}
                    >
                      Choose Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DynamicPage;
    