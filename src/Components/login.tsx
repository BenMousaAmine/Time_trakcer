import {useState} from "react";
import {TextField, MenuItem, Button, Box, Snackbar, Alert} from "@mui/material";
import Cookies from 'js-cookie';

export const months = [
    { name: 'Gennaio', value: '01' },
    { name: 'Febbraio', value: '02' },
    { name: 'Marzo', value: '03' },
    { name: 'Aprile', value: '04' },
    { name: 'Maggio', value: '05' },
    { name: 'Giugno', value: '06' },
    { name: 'Luglio', value: '07' },
    { name: 'Agosto', value: '08' },
    { name: 'Settembre', value: '09' },
    { name: 'Ottobre', value: '10' },
    { name: 'Novembre', value: '11' },
    { name: 'Dicembre', value: '12' }
];
const Login = () => {


    const [formData, setFormData] = useState({ nome: '', cognome: '', email: '', mese: '' });

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");


    const handleChange = (e ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const isValidEmail = (email: string) => {
        return email.endsWith("@cloudbits.it");
    };
    const handleSubmit = () => {
        if (!formData.nome || !formData.cognome || !formData.email || !formData.mese) {
            setSnackbarMessage("Compila tutti i campi!");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        if (!isValidEmail(formData.email)) {
            setSnackbarMessage("L'email deve terminare con @cloudbits.it");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }
         Cookies.set("month", formData.mese);
        Cookies.set("formData.dati", JSON.stringify(formData.nome + " " + formData.cognome ), { path: '/', expires: 1 });
        Cookies.set("formData.email", formData.email);
        Cookies.set("isGenerate", JSON.stringify(true), { path: '/', expires: 1 });
        setSnackbarMessage("Welcome " + formData.nome + " !");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        window.location.reload();
    };


    return (

                <Box
                    className="flex flex-col items-center justify-center min-h-screen p-6"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "100vh",
                    }}
                >
                    <Box
                        sx={{
                            border: "1px solid black",
                            width: "40%",
                            height: "60vh",
                            borderRadius: "10px",
                            padding: "1rem",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "white",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.9)",
                        }}
                    >
                        <h3 className="text-2xl font-bold mb-6" style={{ color: "black" }}>
                            Inserisci i tuoi dati
                        </h3>

                        <Box className="w-full max-w-sm space-y-4" sx={{ width: "100%", maxWidth: 400 }}>
                            <TextField
                                label="Nome"
                                name="nome"
                                variant="outlined"
                                fullWidth
                                onChange={handleChange}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "blue",
                                        },
                                    },
                                    paddingBottom: "1rem",
                                }}
                            />

                            <TextField
                                label="Cognome"
                                name="cognome"
                                variant="outlined"
                                fullWidth
                                onChange={handleChange}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "blue",
                                        },
                                    },
                                    paddingBottom: "1rem",
                                }}
                            />
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                variant="outlined"
                                fullWidth
                                onChange={handleChange}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "blue",
                                        },
                                    },
                                    paddingBottom: "1rem",
                                }}
                            />

                            <TextField
                                select
                                label="Mese"
                                name="mese"
                                variant="outlined"
                                fullWidth
                                onChange={handleChange}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        "&.Mui-focused fieldset": {
                                            borderColor: "blue",
                                        },
                                    },
                                    paddingBottom: "1rem",
                                }}

                            >
                                {months.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>
                                        {m.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            sx={{
                                marginTop: "1rem",
                                backgroundColor: "blue",
                                color: "white",
                                "&:hover": {
                                    backgroundColor: "white",
                                    color: "blue",
                                    border: "1px solid blue",
                                },
                            }}
                        >
                            Genera
                        </Button>
                    </Box>
                    <Snackbar
                        open={openSnackbar}
                        autoHideDuration={3000}
                        onClose={() => setOpenSnackbar(false)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Box>



    );
}

export default Login
