import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { generateUniqueId } from '../utils';
import LlamaService from '../services/LlamaService';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

const USER = { _id: 'usr1' };
const AI = { _id: 'ai' };

const MESSAGES = {
  INTRO: {
    role: 'system',
    content: 'Introduce yourself as helpful assistant!',
  },
};

function ChatScreen(): React.JSX.Element {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const onPartialCompletion = ({ token }: { token: string }) => {
    setMessages(prev =>
      prev.map((msg, index) => {
        if (index === 0) {
          return { ...msg, text: msg.text + token };
        }
        return msg;
      }),
    );
  };

  const addMessage = (user: User, text: string) => {
    setMessages(prev => {
      const message: IMessage = {
        _id: generateUniqueId(),
        createdAt: new Date(),
        user,
        text,
      };
      return [message, ...prev];
    });
  };

  const handleSendMessagePress = ([msg]: IMessage[]) => {
    addMessage(USER, msg.text);
    addMessage(AI, '');
    LlamaService.completion(
      [
        {
          role: 'user',
          content: msg.text,
        },
      ],
      onPartialCompletion,
    );
  };

  useEffect(() => {
    LlamaService.initialize().then(() => {
      addMessage(AI, '');
      LlamaService.completion([MESSAGES.INTRO], onPartialCompletion);
    });
    return () => {
      LlamaService.cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.container}>
          <GiftedChat
            messages={messages}
            onSend={handleSendMessagePress}
            renderAvatar={() => null}
            user={USER}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default ChatScreen;
