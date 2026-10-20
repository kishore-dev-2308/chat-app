import React from "react";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { BsChatDotsFill } from "react-icons/bs";
import { FaUserPlus, FaUsers } from "react-icons/fa";

const Welcome = ({ setSidebarOpen, sidebarOpen }) => {
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: "32px",
        position: "relative",
        textAlign: "center",
      }}
    >
      {/* Mobile Hamburger toggle */}
      <IconButton
        className="d-md-none"
        onClick={toggleSidebar}
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Hero Icon */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "24px",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: "36px",
          boxShadow: "0 12px 24px -6px rgba(79, 70, 229, 0.35)",
          marginBottom: "24px",
        }}
      >
        <BsChatDotsFill />
      </div>

      <h3
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "8px",
        }}
      >
        Welcome to your workspace
      </h3>
      <p
        style={{
          color: "#64748b",
          fontSize: "0.95rem",
          maxWidth: "400px",
          lineHeight: 1.5,
          marginBottom: "28px",
        }}
      >
        Select a chat from the sidebar to start messaging, share media, or collaborate in groups.
      </p>

      {/* Feature cards hint */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "480px",
        }}
      >
        <div
          style={{
            flex: "1 1 200px",
            background: "#ffffff",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "#eef2ff",
              color: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FaUserPlus size={16} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>
              Direct Chats
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Connect with friends 1-on-1
            </div>
          </div>
        </div>

        <div
          style={{
            flex: "1 1 200px",
            background: "#ffffff",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "#fdf2f8",
              color: "#db2777",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FaUsers size={16} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>
              Group Channels
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Collaborate with teams
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
