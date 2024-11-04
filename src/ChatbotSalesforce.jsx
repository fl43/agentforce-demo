// src/Chatbot.js
// import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {api} from './Api';
import { useAuth } from './hooks/AuthProvider';

function ChatbotSalesforce() {
  const {isAuthenticated} = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  /*
  const getStream = () => {
    axios.get('https://my-domain.com/api/getStream', {
      headers: {
        'Accept': 'text/event-stream',
      },
      responseType: 'stream',
      adapter: 'fetch', // <- this option can also be set in axios.create()
    })
      .then(async (response) => {
        console.log('axios got a response');
        const stream = response.data;      
  
        // consume response
        const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          console.log(value);
        }
      })
      // catch/etc.
  };
  */

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    // Add the user message to the messages array
    setMessages((prevMessages) => [...prevMessages, { role: 'user', text: input }]);

    try {
        // Send the user message to the ChatGPT API
        const data = {
          "id": uuidv4(),
          "messageType":"StaticContentMessage",
          "staticContent":{
            "formatType":"Text",
            "text": `${input}`
          }
        };
        const response = await api.post(`/iamessage/v1/conversation/${conversationId}/message`, data)

        console.log('Sent message response: ', response);

        /* no response from Agentforce synchronously
        // Extract the bot response from the API response
        const botResponse = response.data.choices[0].message.content;

        // Add the bot response to the messages array
        setMessages([...messages, { role: 'bot', text: botResponse }]);
        */

        // Clear the input field
        setInput('');
    } catch (error) {
        console.error('Error sending message:', error);
    }
  };

  // const auth = useAuth();

  useEffect(() => {
    const startConversation = async () => {
      try {
        const data = {"routingAttributes":{}, "conversationId": uuidv4()};
  
        console.log('Headers for StartConversation ', api.axiosInstance.defaults.headers.common);
  
        const response = await api.post('/iamessage/v1/conversation', data);
        console.log('Conversation-Id: ', response.conversationId);
        return response.conversationId;
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };

    let isSubscribed = true;

    const subscribeEvents = async (baseURI, orgId) => {
      // Create a new EventSource instance
      console.log('subscribe events - base URL: ', baseURI);
      console.log('subscribe events - orgId: ', orgId);
      
      const token = api.axiosInstance.defaults.headers.common['Authorization'];
      console.log('subscribe events - token: ', token);
  
      // const eventSource = new EventSource(`${api.axiosInstance.getUri()}/eventrouter/v1/sse?_ts=1729113310931`);
      const response = await fetch(`${baseURI}/eventrouter/v1/sse?_ts=${Date.now()}`, {
        headers: {
          'Authorization': `${token}`,
          'Accept': 'text/event-stream', // Required for SSE streams
          'X-Org-Id': `${orgId}`
        },
      });

      if (!response.ok) {
        console.error('Failed to connect to SSE stream');
        return;
      }

      const reader = response.body.getReader(); // Get the stream reader
      const decoder = new TextDecoder('utf-8'); // Decodes the stream into text

      let buffer = ''; // Used to accumulate partial chunks of data

      // Keep reading from the stream

      console.log('Subscribed: ', isSubscribed);

      while (isSubscribed) {
        const { done, value } = await reader.read(); // Read the next chunk of data
        if (done) break; // End of the stream, exit loop

        // Decode the stream value (Uint8Array) into a string
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk; // Append the chunk to the buffer

        // Process the buffer to extract full SSE events
        let boundaryIndex;
        while ((boundaryIndex = buffer.indexOf('\n\n')) > -1) {
          // console.log('Buffer: ', buffer);
          // console.log('Boundary index: ', boundaryIndex);

          const fullEvent = buffer.slice(0, boundaryIndex).trim(); // Get a full event
          buffer = buffer.slice(boundaryIndex + 2); // Remove the event from the buffer

          // console.log('Full event: ', fullEvent);

          // extract "id:???"
          const idPos = fullEvent.indexOf('id:');
          const idPosEnd = fullEvent.indexOf('\n', idPos + 3);
          const eventId = (-1 !== idPos) && (-1 !== idPosEnd) ? fullEvent.slice(idPos + 6, idPosEnd).trim() : undefined;
          console.log('Event ID: ', eventId ? eventId : '-');

          // extract "event:NAME" --> CONVERSATION_MESSAGE
          const eventPos = fullEvent.indexOf('event:');
          const eventPosEnd = fullEvent.indexOf('\n', eventPos + 6);
          const eventName = (-1 !== eventPos) && (-1 !== eventPosEnd) ? fullEvent.slice(eventPos + 6, eventPosEnd).trim() : undefined;
          console.log('Event name: ', eventName);

          // extract "data:JSON"
          const dataPos = fullEvent.indexOf('data:');
          const eventData = (-1 !== dataPos) ? fullEvent.substring(dataPos + 5).trim() : undefined;
          // console.log('Event data: ', eventData);

          if (eventName && eventData && eventName === 'CONVERSATION_MESSAGE') {
            const parsedEvent = JSON.parse(eventData); // Assuming event data is JSON

            if (isSubscribed) {
              // console.log('Event: ', parsedEvent);
              const sender = parsedEvent.conversationEntry.sender.role;
              const payload = parsedEvent.conversationEntry.entryPayload;
              console.log('Sender: ', sender);
              // console.log('Payload: ', payload);

              if (sender !== 'EndUser') {
                const parsedPayload = JSON.parse(payload);
                // console.log('Message: ', parsedPayload);
  
                const newResponse = parsedPayload.abstractMessage.staticContent.text;
                console.log('Message: ', newResponse);
  
                // Add the bot response to the messages array
                setMessages((prevMessages) => [...prevMessages, { role: 'bot', text: newResponse }]);
                // setEvents((prevEvents) => [...prevEvents, parsedEvent]); // Update state with new event
              }
            }
          }
        }
      }

      // Cleanup the EventSource on component unmount
      return () => {
        isSubscribed = false;
      };
    };
    
    const initializeConnection = async (baseURI) => {
      setInitializing(true);
      try {
        const cId = await startConversation();
        setConversationId(cId);

        subscribeEvents(baseURI, '00DKd000004WqBE');
      } catch (error) {
        setError(error.message);
      } finally {
        setInitializing(false);
      }
    };

    if (isAuthenticated) {
      const baseURI = api.axiosInstance.getUri();
      initializeConnection(baseURI);
    }
    
  }, [isAuthenticated]);

  // Inside the Chatbot component
  const chatbotStyles = {
    chatArea: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center'
    },
    chatbot: {
      width: '70%',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '5px',
      margin: '0 auto',
    },
    chatbox: {
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
    },
    messages: {
      height: '450px',
      overflowY: 'scroll',
      display: 'flex',
      flexDirection: 'column',
    },
    botMessage: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '8px 15px',
      borderRadius: '5px',
      alignSelf: 'flex-start',
      marginBottom: '10px',
      maxWidth: '80%',
      textAlign: 'left'
    },
    userMessage: {
      backgroundColor: 'rgb(178, 178, 178)',
      padding: '8px 15px',
      borderRadius: '5px',
      alignSelf: 'flex-end',
      marginBottom: '10px',
      maxWidth: '80%',
      textAlign: 'left'
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '10px',
    },
    input: {
      flex: 1,
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      fontSize: '18px'
      },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '5px',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      marginLeft: '10px',
      fontSize: '18px'
    },
  };

  if (initializing) return <p>Initializing...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={chatbotStyles.chatArea}>
      <div style={chatbotStyles.chatbot}>
        <div style={chatbotStyles.chatbox}>
          <div style={chatbotStyles.messages}>
            {messages.map((message, index) => {
                if (message.role === 'bot') {
                  return (
                  <div style={chatbotStyles.botMessage} key={index}>{message.text}</div>
                )} else {return (
                  <div style={chatbotStyles.userMessage} key={index}>{message.text}</div>
                )}}
            )}
          </div>
          <div style={chatbotStyles.container}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            style={chatbotStyles.input}
          />
          <button onClick={handleSendMessage} style={chatbotStyles.button}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotSalesforce;