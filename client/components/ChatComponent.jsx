import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import axios from 'axios';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window
} from 'stream-chat-react';

const StreamChatComponent = ({ userId, allUserIds }) => {
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);

  const generateChannelId = (userId1, userId2) => {
    const shortId1 = userId1.substring(0, 8);
    const shortId2 = userId2.substring(0, 8);
    const sortedIds = [shortId1, shortId2].sort();
    return `chat-${sortedIds[0]}-${sortedIds[1]}`;
  };

  useEffect(() => {
    let client;
    const initChat = async () => {
      try {
        const currentUser = allUserIds.find(user => user.id === userId);
        
        if (!currentUser) {
          throw new Error('Current user not found');
        }

        const response = await axios.post('http://localhost:3001/api/stream/token', {
          userId: currentUser.id,
          username: currentUser.username
        });

        const { token, apiKey } = response.data;

        client = StreamChat.getInstance(apiKey);

        await client.connectUser(
          {
            id: currentUser.id,
            name: currentUser.username,
          },
          token
        );

        setChatClient(client);
        setError(null);
      } catch (error) {
        console.error('Error connecting to Stream:', error);
        setError(error.message);
      }
    };

    if (userId && allUserIds?.length > 0) {
      initChat();
    }

    return () => {
      const cleanup = async () => {
        if (client) {
          await client.disconnectUser();
        }
      };
      cleanup();
    };
  }, [userId, allUserIds]);

  const startNewChat = async (otherUserId) => {
    if (!chatClient) return;

    try {
      const otherUser = allUserIds.find(user => user.id === otherUserId);
      
      if (!otherUser) {
        throw new Error('Selected user not found');
      }

      const channelId = generateChannelId(userId, otherUserId);

      const newChannel = chatClient.channel('messaging', channelId, {
        members: [userId, otherUserId],
        name: `Chat with ${otherUser.username}`,
        customData: {
          member1Id: userId,
          member2Id: otherUserId
        }
      });

      await newChannel.watch();
      setChannel(newChannel);
      setSelectedUser(otherUserId);
      setError(null);
    } catch (error) {
      console.error('Error creating chat channel:', error);
      setError(error.message);
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!chatClient) {
    return <div className="p-4">Loading chat...</div>;
  }

  return (
    <div className="flex h-[600px] str-chat">
      <div className="user-list">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        {allUserIds.map((user) => (
          user.id !== userId && (
            <button
              key={user.id}
              onClick={() => startNewChat(user.id)}
              className={`user-button ${selectedUser === user.id ? 'active' : ''}`}
            >
              {user.username}
            </button>
          )
        ))}
      </div>

      <div className="chat-window">
        {channel ? (
          <Chat client={chatClient} theme="messaging light">
            <Channel channel={channel}>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamChatComponent;
