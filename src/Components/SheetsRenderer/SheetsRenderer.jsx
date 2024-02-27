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
                    <Masonry columns={3} spacing={4}>
                        {subject.cards?.map((card, cardIndex) => (
                            <div className="rendered-card">
                                <h3 className="rendered-card-title">{card.card_title}</h3>
                                <Paper className="rendered-card-body" key={cardIndex} >
                                    {card.body?.map((item, itemIndex) => (
                                        <p key={itemIndex}>{item}</p>
                                    ))}
                                    <h4 className="rendered-card-footer">{card.footer}</h4>
                                </Paper>
                            </div>
                        ))}
                    </Masonry>
                </div>
            ))}
        </div>
    );
}