import { useState, useEffect } from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function History() {

    const [history, setHistory] = useState([])
    const getTimeline = async () => {
        const nq = query(collection(db, 'history'), orderBy('time', 'desc'));
        const querySnapshot = await getDocs(nq);
        // const querySnapshot = await getDocs(collection(db, "history"));
        let h = []
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            h.push(doc.data())
        });
        setHistory(h)
    }

    useEffect(() => {
        getTimeline()
    }, [])


    return (
        <>
            <Timeline position="alternate">
                {
                    history && history.map(h => <TimelineItem>
                        <TimelineOppositeContent style={{ color: "magenta" }}>
                            {h.time}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                            <TimelineDot />
                            <TimelineConnector />
                        </TimelineSeparator>
                        <TimelineContent>
                            <h5>By, {h.email}</h5> {"  "}
                            To, {h.groups.length} Groups
                            {'=>'}<br />
                            <div>{h.message}</div>
                        </TimelineContent>
                    </TimelineItem>)
                }

            </Timeline>
        </>
    );
}
