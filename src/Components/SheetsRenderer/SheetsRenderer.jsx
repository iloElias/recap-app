import React from "react";

export default function SheetsRenderer({ children, render }) {
    const text = render ?? children;
    const [renderedText, setRenderedText] = useState();

    return (
        <>
            {renderedText}
        </>
    );
}