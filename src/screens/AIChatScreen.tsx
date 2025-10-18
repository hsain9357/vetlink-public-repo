import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sendMessageToGemini, startNewChat } from '../services/gemini';
import Markdown from 'react-native-markdown-display';
import { supabase } from '../supabase/supabase';
import { useTheme } from '../context/ThemeContext';

const AIChatScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const chatSession = useRef<any>(null);

  useEffect(() => {
    chatSession.current = startNewChat();
    const fetchUserType = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single();
        if (error) {
          console.error('Error fetching user type:', error);
        } else if (data) {
          setUserType(data.user_type);
        }
      }
    };
    fetchUserType();
  }, []);

  const handleSendMessage = async () => {
    if (inputText.trim().length === 0) return;

    const userMessage = { text: inputText, sender: 'user' as const };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      if (!chatSession.current) {
        console.error(t('ai_chat.chat_session_not_initialized'));
        setMessages((prevMessages) => [...prevMessages, { text: t('ai_chat.chat_session_not_initialized'), sender: 'ai' }]);
        return;
      }
      const aiResponse = await sendMessageToGemini(chatSession.current, inputText, userType);
      setMessages((prevMessages) => [...prevMessages, { text: aiResponse, sender: 'ai' }]);
    } catch (error) {
      console.error(t('ai_chat.error_sending_message_to_ai'), error);
      setMessages((prevMessages) => [...prevMessages, { text: t('ai_chat.could_not_get_response'), sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
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
            message.sender === 'user' ? styles.userBubble : styles.aiBubble,
            message.sender === 'user' ? { backgroundColor: colors.buttonPrimary } : { backgroundColor: colors.inputBackground },
          ]}>
            {message.sender === 'user' ? (
              <Text style={[styles.userText, { color: colors.buttonText }]}>
                {message.text}
              </Text>
            ) : (
              <Markdown style={{ body: { color: colors.text, fontSize: 16 } }}>
                {message.text}
              </Markdown>
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

export default AIChatScreen;