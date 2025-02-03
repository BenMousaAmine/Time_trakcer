import './App.css'

import {useEffect, useState} from "react";
import Cookies from 'js-cookie';
import Login from "./Components/login.tsx";
import GeneratePdf from "./Components/generate-pdf.tsx";


function App() {
    const [isGenerate , setIsGenerate] = useState<boolean>(false);

    useEffect(() => {
        const isGenerateCookie = Cookies.get("isGenerate");
        if (isGenerateCookie !== undefined && isGenerateCookie === "true") {
            setIsGenerate(true);
        }
    }, []);



    return (
        <>
            {isGenerate ? (
                    <GeneratePdf />
            ) : (
                <Login />
            )}
        </>


    );
}

export default App
