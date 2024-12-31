import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContex"; 
import { Snackbar } from "@mui/material";

type FormState = 0 | 1;

const blackTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#000000",
      paper: "#000000",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
    primary: {
      main: "#bb86fc",
    },
    secondary: {
      main: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

const Authentication: React.FC = () => {
  // State variables
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [message, setMessage] = React.useState<string>("");
  const [formState, setFormState] = React.useState<FormState>(0);
  const [open, setOpen] = React.useState<boolean>(false);
  
  // Access authentication functions from AuthContext
  const { handleRegister, handleLogin } = useAuth(); 

  // Handle authentication logic
  const handleAuth = async () => {
    try {
      if (formState === 0) {
        const result = await handleLogin(username, password);
        setMessage(result);
        setError("");
        setOpen(true);
      }
      if (formState === 1) {
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setUsername("");
        setError("");
        setFormState(0);
        setPassword("");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong!");
      setMessage(""); // Clear success message
      setOpen(true); // Show Snackbar
    }
  };

  return (
    <ThemeProvider theme={blackTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        {/* Left Side Image */}
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1733325600531-74f1899491a9?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Right Side Form */}
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar style={{ marginBottom: "20px" }} sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            <div style={{ gap: "2px" }}>
              <Button variant={formState === 0 ? "contained" : "text"} onClick={() => setFormState(0)}>
                Sign In
              </Button>
              <Button variant={formState === 1 ? "contained" : "text"} onClick={() => setFormState(1)}>
                Sign Up
              </Button>
            </div>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={name}
                  autoFocus
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />

              {error && <p style={{ color: "red" }}>{error}</p>}

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, bgcolor: "primary.main" }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)} // Close the Snackbar after 4 seconds
        message={message || error}
      />
    </ThemeProvider>
  );
};

export default Authentication;
