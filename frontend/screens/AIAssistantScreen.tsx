import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function AIAssistantScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Assistant</Text>
      <Text style={styles.body}>
        This is a lightweight AI assistant tailored for offline / low-bandwidth
        use in rural contexts. Provide guidance, ask questions, or start a
        micro-lesson.
      </Text>
      <Button title="Start a chat" onPress={() => { /* placeholder */ }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  body: { fontSize: 16, marginBottom: 20 },
});
