import React from "react";
import { Paper } from '@mui/material';
import { Masonry } from '@mui/lab';

export default function SheetsRenderer({ children, render }) {

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem"
        }}>
            <h1>#{render.project_name}</h1>
            <p>{render.project_synopsis}</p>
            <Masonry columns={3} spacing={4}>
                {render.subjects?.map((subject, subjectIndex) => (
                    <div key={subjectIndex} style={{
                        display: 'flex',
                        flexDirection: "column",
                        gap: '0.5rem'
                    }}>
                        <h2>{subject.subject_title}</h2>
                        {subject.cards?.map((card, cardIndex) => (
                            <Paper key={cardIndex} style={{
                                padding: '10px',
                                margin: "0 0 0.5rem 0"
                            }} >
                                <h3>{card.card_title}</h3>
                                {card.body?.map((item, itemIndex) => (
                                    <p key={itemIndex}>{item}</p>
                                ))}
                                <h4>{card.footer}</h4>
                            </Paper>
                        ))}
                    </div>
                ))}
            </Masonry>
        </div>
    );
}