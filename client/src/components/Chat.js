
import React from 'react';
import { ChatController, MuiChat } from 'chat-ui-react'



const Chat = ({ messages }) => {

    const [chatCtl] = React.useState(new ChatController());

    React.useMemo(async () => {
        // Chat content is displayed using ChatController
        messages && messages.forEach(async message => {
            await chatCtl.addMessage({
                type: 'text',
                content: message.body,
                self: message.fromMe,
            });
        })

    }, [chatCtl]);
    return (
        <MuiChat style={{ height: "500px", overflowY: "scroll" }} chatController={chatCtl} />
    );
}

export default Chat