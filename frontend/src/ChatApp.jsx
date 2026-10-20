import React, { useState } from "react";
import "./styles/chat-app.scss";
import { IconButton, Tooltip } from "@mui/material";
import { Close as CloseIcon, Logout as LogoutIcon, Settings as SettingsIcon } from "@mui/icons-material";
import GroupList from "./components/groups/GroupList";
import PeopleList from "./components/peoples/PeopleList";
import GroupChatBox from "./components/groups/GroupChatBox";
import PeopleChatBox from "./components/peoples/PeopleChatBox";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuth } from "./slices/authSlice";
import axios from "axios";
import Welcome from "./components/Welcome";
import EditProfileModal from "./components/peoples/EditProfileModal";
import FindFriendsModal from "./components/peoples/FindFriendsModal";
import CreateGroupModal from "./components/groups/CreateGroupModal";

const ChatApp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [menu, setMenu] = useState("group");
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const user = useSelector((state) => state.profile.user);
  const { token } = useSelector((state) => state.auth);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [searchFriend, setSearchFriend] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [groupRefresh, setGroupRefresh] = useState(false);

  const handleLogout = async () => {
    try {
      if (token) {
        await axios.get(`${API_BASE_URL}/auth/logout`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      dispatch(setAuth({ login: false, token: null }));
      navigate("/sign-in");
    }
  };

  return (
    <div className="chat-ui-wrapper">
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* User Profile Bar */}
        <div className="sidebar-header d-flex justify-content-between align-items-center">
          <div
            className="d-flex align-items-center"
            style={{ cursor: "pointer", flex: 1, minWidth: 0 }}
            onClick={() => setOpenProfileModal(true)}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={
                  user?.profileImage
                    ? `${API_BASE_URL}/${user?.profileImage}?v=${Date.now()}`
                    : "/assets/icons/profile.jpg"
                }
                onError={(e) => (e.target.src = "/assets/icons/profile.jpg")}
                alt={user?.profilename || "Profile"}
                className="people-avatar"
              />
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: 8,
                  width: 10,
                  height: 10,
                  backgroundColor: "#22c55e",
                  borderRadius: "50%",
                  border: "2px solid #0f172a",
                }}
              />
            </div>
            <div style={{ minWidth: 0, paddingRight: 8 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.925rem",
                  color: "#f8fafc",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.profilename || user?.username || "My Profile"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                @{user?.username || "user"}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <Tooltip title="Edit Profile">
              <IconButton
                size="small"
                onClick={() => setOpenProfileModal(true)}
                style={{ color: "#94a3b8" }}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Log Out">
              <IconButton
                size="small"
                onClick={handleLogout}
                style={{ color: "#f87171", marginLeft: 4 }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              className="d-md-none"
              onClick={toggleSidebar}
              style={{ color: "#94a3b8", marginLeft: 4 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="sidebar-tabs">
          <button
            type="button"
            className={`tab-btn ${menu === "group" ? "active" : ""}`}
            onClick={() => setMenu("group")}
          >
            Groups
          </button>
          <button
            type="button"
            className={`tab-btn ${menu === "people" ? "active" : ""}`}
            onClick={() => setMenu("people")}
          >
            Direct Messages
          </button>
        </div>

        {/* Search Field */}
        <div className="sidebar-search">
          <div className="search-input-wrap">
            <input
              type="text"
              placeholder={menu === "group" ? "Search groups..." : "Search friends..."}
              value={menu === "group" ? searchGroup : searchFriend}
              onChange={(e) =>
                menu === "group"
                  ? setSearchGroup(e.target.value)
                  : setSearchFriend(e.target.value)
              }
            />
          </div>
        </div>

        {/* Section Action Bar */}
        <div className="sidebar-action-header">
          <span className="section-title">
            {menu === "group" ? "Group Channels" : "Friends"}
          </span>
          <button
            type="button"
            className="btn-add-action"
            onClick={() =>
              menu === "group"
                ? setOpenCreateGroup(true)
                : setShowFriendsModal(true)
            }
          >
            {menu === "group" ? "+ New Group" : "+ Add Friend"}
          </button>
        </div>

        {/* Lists Container */}
        <div className="list-container">
          {menu === "group" ? (
            <>
              <CreateGroupModal
                open={openCreateGroup}
                onClose={() => setOpenCreateGroup(false)}
                onGroupCreated={() => setGroupRefresh((prev) => !prev)}
              />
              <GroupList
                onSelect={(group) => {
                  setSelectedChat({ type: "group", data: group });
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
                searchGroup={searchGroup}
                refresh={groupRefresh}
              />
            </>
          ) : (
            <>
              <FindFriendsModal
                open={showFriendsModal}
                onClose={() => setShowFriendsModal(false)}
              />
              <PeopleList
                onSelect={(person) => {
                  setSelectedChat({ type: "person", data: person });
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
                searchFriend={searchFriend}
              />
            </>
          )}
        </div>
      </div>

      {/* Main Conversation Pane */}
      {!selectedChat ? (
        <Welcome sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      ) : selectedChat.type === "person" ? (
        <PeopleChatBox
          key={selectedChat.data?._id}
          receiverDetails={selectedChat.data}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      ) : (
        <GroupChatBox
          key={selectedChat.data?._id}
          groupDetails={selectedChat.data}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
      />
    </div>
  );
};

export default ChatApp;
