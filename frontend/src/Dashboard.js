function Dashboard() {
  return (

    <div>

      <h1>Dashboard</h1>

      <div style={{display:"flex",gap:"20px"}}>

        <div style={card}>⚽ Fields <h2>5</h2></div>

        <div style={card}>📅 Bookings <h2>12</h2></div>

        <div style={card}>👥 Users <h2>8</h2></div>

      </div>

    </div>

  );
}

const card = {
  background:"#f1f5f9",
  padding:"20px",
  borderRadius:"10px",
  width:"150px",
  textAlign:"center"
};

export default Dashboard;