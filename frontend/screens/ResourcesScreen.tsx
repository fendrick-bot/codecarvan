import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function ResourcesScreen({ navigation }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Learning Resources</Text>
      <Text style={styles.body}>
        Curated lessons, PDFs, and short videos suited for low-bandwidth
        environments. Tap an item to open details.
      </Text>

      <TouchableOpacity style={styles.card} onPress={() => { /* open resource */ }}>
        <Text style={styles.cardTitle}>Basic Math: Number Sense</Text>
        <Text style={styles.cardSubtitle}>PDF · 10 pages</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => { /* open resource */ }}>
        <Text style={styles.cardTitle}>Reading Practice: Short Stories</Text>
        <Text style={styles.cardSubtitle}>Audio · 5 minutes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  body: { fontSize: 15, marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 13, color: '#666' },
});
