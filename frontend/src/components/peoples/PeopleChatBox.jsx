import "../../styles/chat-app.scss";
import { useEffect, useRef, useState } from "react";
import { AppBar, Avatar, IconButton } from "@mui/material";
import {
  Menu as MenuIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuth } from "../../slices/authSlice";
import FilePreviewCard from "../FilePreviewCard";
import socket from "../../socket";
import PeopleInfoModal from "./PeopleInfoModal";

function PeopleChatBox({ receiverDetails, sidebarOpen, setSidebarOpen }) {
  const receiverId = receiverDetails?._id;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const { token } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.profile.user);

  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [isChatUserOnline, setIsChatUserOnline] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const textareaRef = useRef(null);

  const toggleInfoPanel = () => {
    setShowInfoPanel((prev) => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() || attachments.length > 0) {
        sendMessage();
      }
    }
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const fetchMessages = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API_BASE_URL}/messages/list?user_id=${receiverId}`,
        config
      );
      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (err) {
      console.error("Error loading messages", err);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("sender", user._id);
      formData.append("receiver", receiverId);
      formData.append("text", newMessage);

      attachments.forEach((file) => formData.append("attachments", file));

      const config = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.post(
        `${API_BASE_URL}/messages/send`,
        formData,
        config
      );

      if (response.data.success && response.data.data) {
        const enrichedMessages = response.data.data.map((data) => ({
          ...data,
          sender: user,
        }));

        setMessages((prev) => [...prev, ...enrichedMessages]);
        setNewMessage("");
        setAttachments([]);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      } else if (response.data.logout) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    } catch (e) {
      console.error("Failed to send message", e);
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  };

  useEffect(() => {
    fetchMessages();

    socket.emit("check-user-online", receiverId);

    socket.on("user-online-status", ({ userId, isOnline }) => {
      if (userId === receiverId) {
        setIsChatUserOnline(isOnline);
      }
    });

    socket.on(`private-message-${user._id}-${receiverId}`, (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off(`private-message-${user._id}-${receiverId}`);
      socket.off("user-online-status");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverId, user._id]);

  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("register", user._id);
    }
    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  let lastDate = null;

  const formatDateSeparator = (date) => {
    const d = new Date(date);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    const isYesterday =
      d.getDate() === today.getDate() - 1 &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFileExtension = (url) => url.split(".").pop().toLowerCase();

  return (
    <>
      <div className="chat-area d-flex flex-column flex-grow-1">
        <AppBar
          position="static"
          className="chat-appbar d-flex flex-row justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <IconButton className="d-md-none me-1" onClick={toggleSidebar} size="small">
              <MenuIcon />
            </IconButton>
            <div className="position-relative me-3">
              <Avatar
                src={
                  receiverDetails?.profileImage
                    ? `${API_BASE_URL}/${receiverDetails.profileImage}?v=${Date.now()}`
                    : "/assets/icons/profile.jpg"
                }
                style={{ width: 44, height: 44, borderRadius: 12 }}
              />
              {isChatUserOnline && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    right: -1,
                    width: 11,
                    height: 11,
                    backgroundColor: "#22c55e",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              )}
            </div>
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: "1rem", lineHeight: 1.2 }}>
                {receiverDetails?.name || "Unknown"}
              </div>
              <div style={{ fontSize: "0.75rem", color: isChatUserOnline ? "#16a34a" : "#94a3b8", fontWeight: 500 }}>
                {isChatUserOnline ? "Active now" : "Offline"}
              </div>
            </div>
          </div>
          <div>
            <IconButton onClick={toggleInfoPanel} size="small">
              <MoreVertIcon />
            </IconButton>
          </div>
        </AppBar>

        {/* Chat Body */}
        <div className="chat-messages-container flex-grow-1">
          {messages.map((msg) => {
            const currentDate = new Date(msg.timestamp).toDateString();
            const showDateSeparator = lastDate !== currentDate;
            lastDate = currentDate;
            const isOwn = (msg?.sender?._id || msg?.sender) === user._id;

            return (
              <>
                <div key={msg._id || Math.random()}>
                  {showDateSeparator && (
                    <div className="date-separator text-center my-3">
                      <span>{formatDateSeparator(msg.timestamp)}</span>
                    </div>
                  )}
                  <div
                    className={`message-container d-flex mb-4 ${
                      isOwn ? "own justify-content-end" : "other"
                    }`}
                  >
                    {/* {!isOwn && (
                    <Avatar
                      src={
                        msg?.profileImage
                          ? `${API_BASE_URL}/${
                              msg.profileImage
                            }?v=${Date.now()}`
                          : "/assets/icons/profile.jpg"
                      }
                      className="me-2"
                    />
                  )} */}
                    <div className="message-text-block" style={{ maxWidth: "80%" }}>
                      {msg.text && (
                        <div className="message-bubble">
                          <div className="message-content">
                            <span className="message-text">
                              {msg.text}
                            </span>
                            <span className="message-time">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      )}
                      {msg.attachments &&
                        msg.attachments.map((file, idx) => {
                          const url = `${API_BASE_URL}/${file}`;
                          const ext = getFileExtension(url);
                          const isImage = [
                            "jpg",
                            "jpeg",
                            "png",
                            "gif",
                            "bmp",
                          ].includes(ext);

                          return isImage ? (
                            <div key={idx} className="mt-2">
                              <img
                                src={url}
                                alt="preview"
                                className="image-thumbnail rounded"
                                style={{ width: 150, cursor: "pointer" }}
                              />
                              <div className="small text-muted mt-1 d-flex align-items-center">
                                {formatDateSeparator(msg.timestamp)}
                                <a
                                  href={url}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <IconButton size="small" className="ms-1">
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div key={idx}>
                              <FilePreviewCard
                                fullUrl={url}
                                fileName={file.split("/").pop()}
                                fileExtension={ext}
                              />
                              <div className="small text-muted mt-1 d-flex align-items-center">
                                {formatDateSeparator(msg.timestamp)}
                                <a
                                  href={url}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <IconButton size="small" className="ms-1">
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
                <div ref={bottomRef} />
              </>
            );
          })}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="chat-input-area"
        >
          {attachments.length > 0 && (
            <div className="attachments-preview-bar">
              {attachments.map((file, idx) => {
                const fileURL = URL.createObjectURL(file);
                const ext = file.name.split(".").pop().toLowerCase();
                const isImage = [
                  "jpg",
                  "jpeg",
                  "png",
                  "gif",
                  "bmp",
                  "webp",
                ].includes(ext);

                return (
                  <div key={idx} className="position-relative" style={{ display: "inline-block" }}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        zIndex: 2,
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        padding: 2,
                        width: 18,
                        height: 18,
                        fontSize: 10,
                      }}
                    >
                      ✕
                    </IconButton>
                    {isImage ? (
                      <img
                        src={fileURL}
                        alt="preview"
                        className="rounded"
                        style={{ width: 64, height: 64, objectFit: "cover", border: "1px solid #cbd5e1" }}
                      />
                    ) : (
                      <div
                        className="rounded bg-white p-2 text-center"
                        style={{
                          width: 120,
                          fontSize: "0.75rem",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        📄 {file.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="input-form-wrapper">
            <input
              type="file"
              id="fileInput"
              multiple
              hidden
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files);
                setAttachments((prev) => [...prev, ...selectedFiles]);
                e.target.value = "";
              }}
            />
            <IconButton
              size="small"
              onClick={() => document.getElementById("fileInput").click()}
              style={{ color: "#64748b" }}
            >
              <AttachFileIcon />
            </IconButton>

            <textarea
              ref={textareaRef}
              rows={1}
              className="text-input-field"
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              value={newMessage}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
            />

            <button
              type="submit"
              className="btn-send"
              disabled={!newMessage.trim() && attachments.length === 0}
            >
              <SendIcon style={{ fontSize: "18px" }} />
            </button>
          </div>
        </form>
      </div>
      <PeopleInfoModal
        open={showInfoPanel}
        onClose={toggleInfoPanel}
        user={receiverDetails}
      />
    </>
  );
}

export default PeopleChatBox;
