// src/Chatbot.js
import axios from 'axios';
import React, { useState } from 'react';

function ChatbotOpenAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    // Add the user message to the messages array
    setMessages([...messages, { role: 'user', text: input }]);

    try {
        // Send the user message to the ChatGPT API
        const apiKey ='';
        const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            'model': 'gpt-4o-mini',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a helpful assistant.'
                  },
                  {
                    'role': 'user',
                    'content': `${input}`
                  }
            ]
        },
        {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            },
        }
        );

        // Extract the bot response from the API response
        const botResponse = response.data.choices[0].message.content;

        // Add the bot response to the messages array
        setMessages([...messages, { role: 'bot', text: botResponse }]);

        // Clear the input field
        setInput('');
    } catch (error) {
        console.error('Error sending message:', error);
    }
  };

  // Inside the Chatbot component
const chatbotStyles = {
    chatbot: {
      width: '300px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '5px',
      margin: '0 auto',
      padding: '10px',
    },
    chatbox: {
      display: 'flex',
      flexDirection: 'column',
    },
    messages: {
      maxHeight: '300px',
      overflowY: 'scroll',
    },
    message: {
      marginBottom: '10px',
    },
    botMessage: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      marginLeft: 'auto',
    },
    userMessage: {
      backgroundColor: '#e0e0e0',
      padding: '5px 10px',
      borderRadius: '5px',
      marginRight: 'auto',
    },
    input: {
      width: '100%',
      padding: '5px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      marginBottom: '10px',
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '5px',
      cursor: 'pointer',
    },
  };

  return (
    <div className="chatbot">
      <div className="chatbox">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className="message">
              {message.role === 'bot' ? (
                <div className="bot-message">{message.text}</div>
              ) : (
                <div className="user-message">{message.text}</div>
              )}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          style={chatbotStyles.input}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatbotOpenAI;