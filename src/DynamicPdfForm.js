import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import {
    TextField,
    ChoiceSelect,
    NumberInput,
    MultipleChoice,
} from "./FormComponents";
import { PDFDocument } from 'pdf-lib';

const DEBUG = true;

const DynamicPdfForm = ({ jsonUrl }) => {
    const [formData, setFormData] = useState({});
    const [pageDefs, setPageDefs] = useState([]);
    const [activePage, setActivePage] = useState(0);
    /**
     * @type {[PDFDocument, function]}
     */
    const [pdfDoc, setPdfDoc] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});

    const fetchJsonFile = async () => {
        try {
            fetch(jsonUrl)
                .then((res) => res.json())
                .then((data) => {
                    setPageDefs(data.pages);
                    fetch(data.pdf)
                        .then((res) => res.arrayBuffer())
                        .then((pdfBytes) => PDFDocument.load(pdfBytes))
                        .then((pdfDoc_) => setPdfDoc(pdfDoc_));
                });
        } catch (error) {
            console.error("Error reading the file:", error);
        }
    };

    useEffect(() => {
        fetchJsonFile();
    }, []);

    const handleChange = (event, name, value) => {
        // console.log("NAME", name);
        // console.log("VALUE", value);
        // console.log("FORMDATA", formData);
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const renderFormField = (field) => {
        switch (field.type) {
            case "text":
                return (
                    <TextField
                        key={field.name}
                        label={field.name}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                    />
                );
            case "widetext":
                return (
                    <TextField
                        key={field.name}
                        label={field.name}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        big={true}
                    />
                );
            case "choice":
                return (
                    <ChoiceSelect
                        key={field.name}
                        label={field.name}
                        name={field.name}
                        options={field.options}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                    />
                );
            case "number":
                return (
                    <NumberInput
                        key={field.name}
                        label={field.name}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        min={field.range[0]}
                        max={field.range[1]}
                    />
                );
            case "checkboxes":
                return (
                    <MultipleChoice
                        key={field.name}
                        label={field.name}
                        name={field.name}
                        options={field.options}
                        selectedOptions={formData[field.name] || []}
                        onChange={handleChange}
                    />
                );
            default:
                return null;
        }
    };

    const renderPage = (page) => (
        <div className="formPage">
            {page.entries.map((field) => renderFormField(field))}
        </div>
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);
        // TODO: generate pdf
    };

    const debugRender = () => <div id="debug">
        DEBUG
        <button onClick={() => {
            const fieldNames = pdfDoc.getForm().getFields().map((f) => f.getName());
            setDebugInfo({
                ...debugInfo,
                'pdfFields': fieldNames,
            })
        }}>Elenca campi PDF</button>
        <ol>
            {(debugInfo.pdfFields || []).map((name) => <li key={name}>{name}</li>)}
        </ol>
    </div>

    return (
        <form onSubmit={handleSubmit}>
            {pageDefs.length > 0 ? renderPage(pageDefs[activePage]) : ""}
            <div id="pageSelect">
                <button className="navButton" id="prevPage" disabled={activePage == 0} onClick={() => setActivePage((x) => x - 1)}>&lt;</button>
                <button className="navButton" id="nextPage" disabled={activePage == pageDefs.length - 1} onClick={() => setActivePage((x) => x + 1)}>&gt;</button>
            </div>
            {DEBUG ? debugRender() : null}
            <button type="submit">Submit</button>
        </form>
    );
};

DynamicPdfForm.propTypes = {
    jsonUrl: PropTypes.string,
};

export default DynamicPdfForm;
