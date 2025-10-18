import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabase/supabase';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'ChatScreen'>;

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  created_at: string;
}

const ChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const route = useRoute<ChatScreenRouteProp>();
  const { vetId, userId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);

        // Fetch existing messages
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${userId},receiver_id.eq.${vetId}),and(sender_id.eq.${vetId},receiver_id.eq.${userId})`)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
        } else if (data) {
          setMessages(data as Message[]);
        }
      }
    };

    fetchUserAndMessages();

    // Set up real-time subscription
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}` // Listen for messages where current user is the receiver
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only add message if it's from the current chat partner
          if ((newMessage.sender_id === vetId && newMessage.receiver_id === currentUserId) ||
              (newMessage.sender_id === currentUserId && newMessage.receiver_id === vetId)) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [vetId, userId]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim().length === 0 || !currentUserId) return;

    setLoading(true);
    const newMessage: Omit<Message, 'id' | 'created_at'> = {
      sender_id: currentUserId,
      receiver_id: vetId,
      message_text: inputText,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([newMessage])
      .select();

    if (error) {
      console.error('Error sending message:', error);
    } else if (data) {
      setMessages((prevMessages) => [...prevMessages, data[0] as Message]);
      setInputText('');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.messagesContainer}>
        {messages.map((message, index) => (
          <View key={index} style={[
            styles.messageBubble,
            message.sender_id === currentUserId ? styles.userBubble : styles.aiBubble,
            message.sender_id === currentUserId ? { backgroundColor: colors.buttonPrimary } : { backgroundColor: colors.inputBackground },
          ]}>
            {message.sender_id === currentUserId ? (
              <Text style={[styles.userText, { color: colors.buttonText }]}>
                {message.message_text}
              </Text>
            ) : (
              <Text style={[styles.aiText, { color: colors.text }]}>
                {message.message_text}
              </Text>
            )}
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: colors.inputBackground }]}>
            <Text style={[styles.aiText, { color: colors.text }]}>{t('ai_chat.typing')}</Text>
          </View>
        )}
      </ScrollView>
      <View style={[styles.inputContainer, { borderTopColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground, color: colors.text }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('ai_chat.enter_message')}
          placeholderTextColor={colors.secondaryText}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <Button title={t('ai_chat.send')} onPress={handleSendMessage} disabled={loading} color={colors.buttonPrimary} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 15,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000', // Keeping shadow color black
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  userText: {
    fontSize: 16,
  },
  aiText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
  },
});

export default ChatScreen;