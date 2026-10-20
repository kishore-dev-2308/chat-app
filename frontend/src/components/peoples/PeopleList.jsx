import React, { useCallback, useEffect, useRef, useState } from "react";
import "./peopleList.scss";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setAuth } from "../../slices/authSlice";

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const m = moment(isoString);
  if (m.isSame(moment(), "day")) {
    return m.format("h:mm A");
  }
  return m.format("MMM D");
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PeopleList = ({ onSelect, searchFriend, activeId }) => {
  const dispatch = useDispatch();
  const [peoples, setPeoples] = useState([]);
  const getPeoplesRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPeoples = useCallback(async () => {
    try {
      setLoading(true);
      getPeoplesRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: getPeoplesRef.current.signal,
      };

      const response = await axios.get(`${API_BASE_URL}/friends/list`, config);
      const responseData = response.data;

      if (responseData.success && responseData.data) {
        setPeoples(responseData.data);
      } else if (responseData.logout) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    } catch (e) {
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, token, navigate]);

  useEffect(() => {
    getPeoples();
  }, [getPeoples]);

  const filteredPeople = peoples.filter((p) =>
    p.name?.toLowerCase().includes(searchFriend?.toLowerCase() || "")
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        <span className="spinner-border spinner-border-sm text-primary" />
      </div>
    );
  }

  if (filteredPeople.length === 0) {
    return (
      <div className="empty-state">
        {searchFriend ? "No matching friends found" : "No friends added yet"}
      </div>
    );
  }

  return (
    <div className="people-list">
      {filteredPeople.map((people) => (
        <div
          key={people._id}
          onClick={() => onSelect && onSelect(people)}
          className={`people-item d-flex align-items-center ${
            activeId === people._id ? "active" : ""
          }`}
        >
          <div className="people-avatar-wrapper">
            <img
              src={
                people?.profileImage
                  ? `${API_BASE_URL}/${people.profileImage}?v=${Date.now()}`
                  : "/assets/icons/profile.jpg"
              }
              onError={(e) => (e.target.src = "/assets/icons/profile.jpg")}
              alt={people.name}
              className="people-avatar"
            />
          </div>
          <div className="people-info">
            <div className="people-header d-flex justify-content-between align-items-center">
              <span className="people-name text-truncate">
                {people.name}
              </span>
              {people.lastMessageTime && (
                <span className="people-time">
                  {formatDateTime(people.lastMessageTime)}
                </span>
              )}
            </div>
            <div className="people-message d-flex justify-content-between align-items-center">
              <span className="text-truncate">
                {people?.lastMessage ||
                  (people?.lastAttachment?.length > 0
                    ? `📎 Attachment`
                    : "No messages yet")}
              </span>
              {people.unreadCount > 0 && (
                <span className="unread-count">{people.unreadCount}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PeopleList;
