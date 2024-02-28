import React from "react";
import { Paper } from '@mui/material';
import { Masonry } from '@mui/lab';
import "./SheetsRenderer.css";

export default function SheetsRenderer({ children, render }) {

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
        }}>
            <h1 className="project-name">{render.project_name}</h1>
            <p className="project-synopsis">{render.project_synopsis}</p>
            {render.subjects?.map((subject, subjectIndex) => (
                <div className="card-outer-container" key={subjectIndex}>
                    <h2 className="subject-name">{subject.subject_title}</h2>
                    <Masonry columns={3} spacing={3} >
                        {subject.cards?.map((card, cardIndex) => (
                            <Paper className="rendered-card">
                                <h3 className="rendered-card-title">{card.card_title}</h3>
                                {card.header && (<p className="rendered-card-header">{card.header}</p>)}
                                <div className="rendered-card-body" key={cardIndex} >
                                    {card.body?.map((item, itemIndex) => (
                                        <p key={itemIndex}>{item}</p>
                                    ))}
                                    <h4 className="rendered-card-footer">{card.footer}</h4>
                                </div>
                            </Paper>
                        ))}
                        <AddCardHologram />
                    </Masonry>
                </div>
            ))}
            <AddSubjectHologram />
        </div>
    );
}

function AddCardHologram() {

    return (
        <div className="hologram card-hologram">
            +
        </div>
    );
}

function AddSubjectHologram() {

    return (
        <div className="hologram subject-hologram">
            +
        </div>
    );
}