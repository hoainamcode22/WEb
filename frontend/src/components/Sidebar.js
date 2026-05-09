import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div style={{
      width: "220px",
      height: "100vh",
      background: "#1e293b",
      color: "white",
      padding: "20px",
      position: "fixed"
    }}>

      <h2>⚽ Football</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>

        <li>
          <Link to="/" style={linkStyle}>Dashboard</Link>
        </li>

        <li>
          <Link to="/users" style={linkStyle}>Users</Link>
        </li>

        <li>
          <Link to="/fields" style={linkStyle}>Fields</Link>
        </li>
        <li>
          <Link to="/bookings" style={linkStyle}>Bookings</Link>
        </li>

      </ul>

    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  display: "block",
  padding: "10px 0"
};

export default Sidebar;