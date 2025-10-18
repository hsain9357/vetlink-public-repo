import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabase/supabase';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';

interface ChatPartner {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
}

const ChatListScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchChats = async () => {
      setLoading(true);
      // Fetch messages where current user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, message_text, created_at')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat messages:', error);
        Alert.alert('Error', 'Could not fetch chat list.');
        setLoading(false);
        return;
      }

      if (messages) {
        const uniqueChatPartnersMap = new Map<string, ChatPartner>();

        for (const message of messages) {
          const partnerId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;

          if (!uniqueChatPartnersMap.has(partnerId)) {
            // Fetch partner's profile to get their name
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('name') // Changed from full_name to name
              .eq('id', partnerId)
              .single();

            if (profileError) {
              console.error('Error fetching partner profile:', profileError);
              continue;
            }

            uniqueChatPartnersMap.set(partnerId, {
              id: partnerId,
              name: profile?.name || 'Unknown', // Changed from full_name to name
              lastMessage: message.message_text,
              lastMessageTime: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          } else {
            // Update last message and time if a newer message is found
            const existingPartner = uniqueChatPartnersMap.get(partnerId)!;
            if (new Date(message.created_at) > new Date(existingPartner.lastMessageTime)) {
              existingPartner.lastMessage = message.message_text;
              existingPartner.lastMessageTime = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          }
        }
        setChatPartners(Array.from(uniqueChatPartnersMap.values()));
      }
      setLoading(false);
    };

    fetchChats();

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel('chat_list')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(receiver_id.eq.${currentUserId},sender_id.eq.${currentUserId})` // Listen for messages where current user is sender or receiver
        },
        (payload) => {
          // Re-fetch chats to update the list with the new message
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUserId]);

  const renderItem = ({ item }: { item: ChatPartner }) => (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: colors.inputBackground, shadowColor: colors.text }]}
      onPress={() => navigation.navigate('ChatScreen', { vetId: item.id, userId: currentUserId! })}
    >
      <View style={styles.chatContent}>
        <Text style={[styles.chatPartnerName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.lastMessage, { color: colors.secondaryText }]} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Text style={[styles.lastMessageTime, { color: colors.secondaryText }]}>{item.lastMessageTime}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>{t('chat_list.loading_chats')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {chatPartners.length === 0 ? (
        <Text style={[styles.noChatsText, { color: colors.secondaryText }]}>{t('chat_list.no_chats')}</Text>
      ) : (
        <FlatList
          data={chatPartners}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chatContent: {
    flex: 1,
    marginRight: 10,
  },
  chatPartnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
  },
  lastMessageTime: {
    fontSize: 12,
  },
  noChatsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  listContent: {
    paddingVertical: 10,
  },
});

export default ChatListScreen;