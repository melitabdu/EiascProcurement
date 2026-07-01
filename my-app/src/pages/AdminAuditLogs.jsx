import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminAuditLogs.css";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/audit-logs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setLogs(res.data);
  } catch (err) {
    console.log(err);
  }
};



  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="audit-container">

      <h2 className="audit-title">System Audit Logs</h2>

      <input
        className="audit-search"
        placeholder="Search action..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="audit-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Role</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Description</th>
            <th>IP</th>
          </tr>
        </thead>

        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log._id}>
              <td>
                {new Date(log.createdAt).toLocaleString()}
              </td>

              <td>
                {log.userId?.fullName || "System"}
              </td>

              <td>{log.userRole}</td>

              <td className="audit-action">
                {log.action}
              </td>

              <td>{log.entityType}</td>

              <td>{log.description}</td>

              <td>{log.ipAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default AdminAuditLogs;