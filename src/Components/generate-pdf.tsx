import { useState } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Select,
    MenuItem,
    Typography,
    Snackbar, Alert
} from "@mui/material";
import Cookies from "js-cookie";
import logo from "../assets/cloudbits.png";
import emailjs from 'emailjs-com';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const giorniSettimana = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

const festivitaItaliane = ["1-01", "6-01", "25-04", "1-05", "2-06", "15-08", "1-11", "8-12", "25-12", "26-12"];

const GeneratePdf = () => {
    const nome = JSON.parse(Cookies.get("formData.dati") || '""');
    const email = Cookies.get("formData.email") || "";
    const mese = Cookies.get("month") || "01";
    const anno = new Date().getFullYear();
    const [isPDF, setIsPDF] = useState(false);
    const [pdf64 , setPdf64] = useState();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };

    const giorniNelMese = getDaysInMonth(parseInt(mese), anno);

    const [presenze, setPresenze] = useState(
        Array.from({ length: giorniNelMese }, (_, i) => ({
            giorno: i + 1,
            entrataMattina: "09:00",
            uscitaMattina: "13:00",
            entrataPomeriggio: "14:00",
            uscitaPomeriggio: "18:00",
            note: "",
            assente: false,
        }))
    );

    const handleChange = (index, field, value) => {
        setPresenze((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value, assente: field === "assente" ? value : row.assente } : row
            )
        );
    };
    const calcolaOreTotali = (row) => {
        if (row.assente) return 0;

        const [emH, emM] = row.entrataMattina.split(":").map(Number);
        const [umH, umM] = row.uscitaMattina.split(":").map(Number);
        const [epH, epM] = row.entrataPomeriggio.split(":").map(Number);
        const [upH, upM] = row.uscitaPomeriggio.split(":").map(Number);

        const mattinaMinuti = (umH * 60 + umM) - (emH * 60 + emM);

        const pomeriggioMinuti = (upH * 60 + upM) - (epH * 60 + epM);

        const totaleMinuti = mattinaMinuti + pomeriggioMinuti;

        return Math.floor(totaleMinuti / 60);
    };

    const calcolaTotaleOreLavorate = () => {
        return presenze.reduce((totale, row) => {
            const dataCompleta = new Date(anno, parseInt(mese) - 1, row.giorno);
            const isFestivo = festivitaItaliane.includes(`${row.giorno}-${mese}`);
            const isWeekend = dataCompleta.getDay() === 0 || dataCompleta.getDay() === 6;

            if (isFestivo || isWeekend) {
                return totale;
            }

            return totale + calcolaOreTotali(row);
        }, 0);
    };
    const generaPdf = () => {
        const doc = new jsPDF();

        const imgWidth = 40;
        const imgHeight = 20;
        doc.addImage(logo, "PNG", 150, 10, imgWidth, imgHeight);

        doc.setFontSize(18);
        doc.text(`Foglio Presenze - ${mese}/${anno}`, 10, 20);
        doc.setFontSize(14);
        doc.text(`Nome: ${nome}`, 10, 30);
        doc.text(`Email: ${email}`, 10, 40);
        doc.text(`Azienda: CloudBits`, 10, 50);

        const headers = [["Data", "Ent-Mat", "Usci-Mat", "Ent-Pom", "Usci-Pom", "Totale", "Note", "Presenza"]];
        const rows = presenze.map((row) => {
            const nomeGiorno = giorniSettimana[new Date(anno, parseInt(mese) - 1, row.giorno).getDay()];
            const isFestivo = festivitaItaliane.includes(`${row.giorno}-${mese}`);
            const isWeekend = [0, 6].includes(new Date(anno, parseInt(mese) - 1, row.giorno).getDay());

            return [
                `${nomeGiorno} ${row.giorno}`,
                isFestivo || isWeekend ? "" : row.entrataMattina,
                isFestivo || isWeekend ? "" : row.uscitaMattina,
                isFestivo || isWeekend ? "" : row.entrataPomeriggio,
                isFestivo || isWeekend ? "" : row.uscitaPomeriggio,
                isFestivo || isWeekend ? "" : calcolaOreTotali(row),
                isFestivo ? "FESTA" : isWeekend ? "Riposo settimanale" : row.note,
                isFestivo || isWeekend ? "" : (row.assente ? "Assente" : "Presente"),
            ];
        });
        const totalHours = calcolaTotaleOreLavorate();
        rows.push(["", "", "", "", "TOTALE ORE", totalHours, "", ""]);
        autoTable(doc, {
            head: headers,
            body: rows,
            startY: 60,
        });
        doc.save(`Foglio_Presenze_${mese}_${anno}.pdf`);

        const pdfBlob = doc.output("blob");

        const pdfUrl = URL.createObjectURL(pdfBlob);

        setPdf64(pdfUrl);
        setIsPDF(true);
    };


    const inviaEmail = () => {
        if (!pdf64) {
            console.error("⚠️ Nessun PDF generato!");
            return;
        }
        const templateParams = {
            to_email: "amine.benmoussa1994@gmail.com",
            from_name:  nome,
            from_email: email,
            message: `In allegato il foglio presenze per il mese ${mese}/${anno}.`,
            attachment: pdf64,
        };

        emailjs
            .send("service_8hadeub", "template_59pfj4m", templateParams, "X4C5CrGOtUzyaEPuG")
            .then((response) => {
                console.log("📩 Email inviata con successo!", response.status, response.text);
                setSnackbarMessage("📩 Email inviata con successo!");
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
            })
            .catch((err) => {
                console.error("❌ Errore durante l'invio dell'email:", err);
                setSnackbarMessage("❌ Errore durante l'invio dell'email!");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
            });
    };
    return (
        <Box
            className="flex flex-col items-center justify-center min-h-screen p-6"
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f4f4f4",
                padding: "2rem",
            }}
        >
            <Typography variant="h4" sx={{ marginBottom: "1rem", fontWeight: "bold", color: "#333" }}>
                Foglio Presenze - {mese}/{anno}
            </Typography>
            <Typography variant="h6" sx={{ marginBottom: "2rem", color: "#555" }}>
                {nome} ({email})
            </Typography>

            <TableContainer component={Paper} sx={{ width: "90%", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}>


                <Table>
                    <TableHead sx={{ backgroundColor: "#1976d2" }}>
                        <TableRow>
                            {["Data", "Entrata Mattina", "Uscita Mattina", "Entrata Pomeriggio", "Uscita Pomeriggio", "totale", "Note", "Assente"].map((header) => (
                                <TableCell key={header} sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {presenze.map((row, index) => {
                            const data = `${row.giorno}-${mese}`;
                            const dataCompleta = new Date(anno, parseInt(mese) - 1, row.giorno);
                            const nomeGiorno = giorniSettimana[dataCompleta.getDay()];
                            const isFestivo = festivitaItaliane.includes(data);
                            const isWeekend = dataCompleta.getDay() === 0 || dataCompleta.getDay() === 6;

                            return (
                                <TableRow
                                    key={index}
                                    sx={{
                                        backgroundColor: isFestivo ? "#4fc3f7" : isWeekend ? "#4fc3f7" : "white",
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                                        {nomeGiorno} {row.giorno}-{mese}
                                    </TableCell>
                                    <TableCell>
                                        {!isFestivo && !isWeekend && (
                                            <input
                                                type="time"
                                                value={row.entrataMattina}
                                                onChange={(e) => handleChange(index, "entrataMattina", e.target.value)}
                                                disabled={row.assente}
                                                style={{ width: "100%", padding: "5px" , backgroundColor:'#b3e5fc' ,borderRadius: '5px'}}
                                            />
                                        ) }

                                    </TableCell>
                                    <TableCell>
                                        {!isFestivo && !isWeekend && (
                                        <input
                                            type="time"
                                            value={row.uscitaMattina}
                                            onChange={(e) => handleChange(index, "uscitaMattina", e.target.value)}
                                            disabled={row.assente}
                                            style={{ width: "100%", padding: "5px" , backgroundColor:'#b3e5fc' ,borderRadius: '5px'}}
                                        />) }
                                    </TableCell>
                                    <TableCell>
                                        {!isFestivo && !isWeekend && (
                                        <input
                                            type="time"
                                            value={row.entrataPomeriggio}
                                            onChange={(e) => handleChange(index, "entrataPomeriggio", e.target.value)}
                                            disabled={row.assente}
                                            style={{ width: "100%", padding: "5px" , backgroundColor:'#b3e5fc' ,borderRadius: '5px'}}
                                        />)}
                                    </TableCell>
                                    <TableCell>
                                        {!isFestivo && !isWeekend && (
                                        <input
                                            type="time"
                                            value={row.uscitaPomeriggio}
                                            onChange={(e) => handleChange(index, "uscitaPomeriggio", e.target.value)}
                                            disabled={row.assente}
                                            style={{ width: "100%", padding: "5px" , backgroundColor:'#b3e5fc' ,borderRadius: '5px'}}
                                        />)}
                                    </TableCell>
                                    <TableCell  sx={{ textAlign: "center" }}>
                                        {!isFestivo && !isWeekend && (
                                        calcolaOreTotali(row)
                                            )}
                                  </TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                        {isFestivo && <h3>FESTA</h3>}
                                        {!isFestivo && !isWeekend && (
                                        <input

                                            type="text"
                                            value={row.note}
                                            onChange={(e) => handleChange(index, "note", e.target.value)}
                                            style={{ width: "100%", padding: "5px" , textAlign:'center' }}
                                        />)}
                                    </TableCell>
                                    <TableCell>

                                        {!isFestivo && !isWeekend && (
                                            <Select
                                                value={row.assente}
                                                onChange={(e) => handleChange(index, "assente", e.target.value)}
                                                sx={{
                                                    width: "100%",
                                                    height: "30px",
                                                    padding: "0",
                                                    margin: "0",
                                                    fontSize: "0.85rem",
                                                    "& .MuiSelect-select": {
                                                        padding: "0 8px",
                                                    },
                                                }}
                                            >
                                                <MenuItem value={false} sx={{ fontSize: "0.85rem", padding: "4px 8px" }}>
                                                    Presente
                                                </MenuItem>
                                                <MenuItem value={true} sx={{ fontSize: "0.85rem", padding: "4px 8px" }}>
                                                    Assente
                                                </MenuItem>
                                            </Select>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        <TableRow sx={{ backgroundColor: "#d9edf7", fontWeight: "bold" }}>
                            <TableCell colSpan={4} sx={{ textAlign: "right", fontSize: "1rem", fontWeight: "bold" }}>
                                Totale Ore Lavorate:
                            </TableCell>
                            <TableCell sx={{ textAlign: "center", fontSize: "1rem", fontWeight: "bold" }}>
                                {calcolaTotaleOreLavorate()} ore
                            </TableCell>
                            <TableCell colSpan={3} />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

<Box>
    <Button
        onClick={() => {generaPdf()}}
        variant="contained"
        sx={{
            marginTop: "2rem",
            backgroundColor: "#1976d2",
            color: "white",
            fontWeight: "bold",
            "&:hover": {
                backgroundColor: "#125699",
            },
            marginRight: '2rem'
        }}
    >
        📤 Genera PDF
    </Button>
{/*    <Button
        disabled={!isPDF}
        onClick={() => {inviaEmail()}}
        variant="contained"
        sx={{
            marginTop: "2rem",
            backgroundColor: "#1976d2",
            color: "white",
            fontWeight: "bold",
            "&:hover": {
                backgroundColor: "#125699",
            },
        }}
    >
        📤 Send
    </Button>*/}
</Box>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GeneratePdf;