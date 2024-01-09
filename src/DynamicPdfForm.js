import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import {
    TextField,
    ChoiceSelect,
    NumberInput,
    MultipleChoice,
} from "./FormComponents";
import { PDFDocument } from 'pdf-lib';
import { zip } from './utils';

const DEBUG = true;

const fieldTypes = {
    "text": function(field, formData, setFormData, handleChange) {
        const render = () => (
            <TextField
                key={field.name}
                label={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
            />
        );

        return { render }
    },
    "widetext": function(field, formData, setFormData, handleChange) {
        const render = () => (
            <TextField
                key={field.name}
                label={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                big={true}
            />
        );

        return { render }
    },
    "choice": function(field, formData, setFormData, handleChange) {
        const def = field.default || "";

        const render = () => (
            <ChoiceSelect
                key={field.name}
                label={field.name}
                name={field.name}
                options={field.options}
                value={formData[field.name] || def}
                onChange={handleChange}
            />
        );

        const init = () => {
            // Already put default value in formdata to
            // correctly output in case it is not present
            setFormData({
                ...formData,
                [field.name]: def,
            })
        }
        
        return { render, init }
    },
    "number": function(field, formData, setFormData, handleChange) {
        const render = () => (
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

        return { render }
    },
    "checkboxes": function(field, formData, setFormData, handleChange) {
        const render = () => (
            <MultipleChoice
                key={field.name}
                label={field.name}
                name={field.name}
                options={field.options}
                selectedOptions={formData[field.name] || []}
                onChange={handleChange}
            />
        );

        return { render }
    },
}

const DynamicPdfForm = ({ jsonUrl }) => {
    const [formData, setFormData] = useState({});
    const [pageDefs, setPageDefs] = useState([]);
    const [activePage, setActivePage] = useState(0);
    const [debugInfo, setDebugInfo] = useState({});
    const [pdfUrl, setPdfUrl] = useState(null);

    /** @type {function(): Promise<PDFDocument>} */
    const fetchPdfDoc = async () => {
        return await fetch(pdfUrl)
            .then((res) => res.arrayBuffer())
            .then((pdfBytes) => PDFDocument.load(pdfBytes))
    }

    const fetchJsonFile = async () => {
        try {
            fetch(jsonUrl)
                .then((res) => res.json())
                .then((data) => {
                    setPageDefs(data.pages);
                    setPdfUrl(data.pdf);

                    data.pages.forEach(page => {
                        page.entries.forEach(field => {
                            const { init } = fieldTypes[field.type](field, formData, setFormData, setFormData, handleChange);
                            if (init) {
                                init();
                            }
                        });
                    });
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
        const { render } = fieldTypes[field.type](field, formData, setFormData, handleChange)
        return render(field)
    };

    const renderPage = (page) => (
        <div className="formPage">
            {page.entries.map((field) => renderFormField(field))}
        </div>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form Data:", formData);

        // Generate pdf
        const pdfDoc = await fetchPdfDoc();
        const form = pdfDoc.getForm();

        /** @type {Array} */
        const mergedPageFields = pageDefs.flatMap(page => page.entries);

        // Merge fields by pdf key, ignore checkboxes for now
        const byPdfKey = Object.groupBy(mergedPageFields, (f) => f.pdfkey)
        delete byPdfKey["undefined"];

        Object.entries(byPdfKey).forEach(([key, fields]) => {
            const pdfField = form.getField(key);
            const val = fields.map(f => formData[f.name]).join(" ");
            pdfField.setText(val);
            console.log("Set", pdfField, key, "to", val);
        })

        zip([[]]);

        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = pdfUrl;
        link.click();
    };

    const debugRender = () => <div id="debug">
        DEBUG
        <button onClick={async (e) => {
            e.preventDefault();
            const pdfDoc = await fetchPdfDoc();
            const fieldNames = pdfDoc.getForm().getFields().map((f) => f.getName());
            setDebugInfo({
                ...debugInfo,
                'pdfFields': fieldNames,
            })
        }}>Elenca campi PDF (in alternativa Acrobat e altri programmi aiutano a farlo visivamente)</button>
        <ol>
            {(debugInfo.pdfFields || []).map((name) => <li key={name}>&quot;{name}&quot;</li>)}
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
