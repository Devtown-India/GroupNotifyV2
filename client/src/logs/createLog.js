import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
/*
log typpes 
"LOGIN"
"LOGUT"
"SEND_MESSAGE"
"NEW_SESSION"
"RESUME_SESSION"
*/


export const log = async (type, message, metadata) => {
    try {
        await addDoc(collection(db, "logs"), {
            type,
            message,
            metadata: JSON.stringify(metadata)
        });

    } catch (error) {
        console.log(error)
    }
}