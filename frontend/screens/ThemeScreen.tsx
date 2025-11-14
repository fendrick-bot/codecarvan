import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SectionList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ThemeSetting {
  id: string;
  name: string;
  value: string;
  icon: string;
}

export default function ThemeScreen({ navigation }: any) {
  const [selectedTheme, setSelectedTheme] = useState<string>('light');
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const themes: ThemeSetting[] = [
    { id: 'light', name: 'Light Mode', value: '#ffffff', icon: 'sunny' },
    { id: 'dark', name: 'Dark Mode', value: '#1a1a1a', icon: 'moon' },
    { id: 'auto', name: 'Auto (System)', value: '#f0f0f0', icon: 'settings' },
  ];

  const fontSizes: Array<{ id: 'small' | 'medium' | 'large'; name: string; size: number }> = [
    { id: 'small', name: 'Small', size: 14 },
    { id: 'medium', name: 'Medium', size: 16 },
    { id: 'large', name: 'Large', size: 18 },
  ];

  const getSectionData = () => [
    {
      title: 'Appearance',
      data: [{ type: 'theme' }],
    },
    {
      title: 'Display',
      data: [{ type: 'fontSize' }],
    },
    {
      title: 'Preferences',
      data: [{ type: 'preferences' }],
    },
  ];

  const renderThemeOption = (theme: ThemeSetting) => (
    <TouchableOpacity
      key={theme.id}
      style={[
        styles.themeOption,
        selectedTheme === theme.id && styles.selectedThemeOption,
      ]}
      onPress={() => setSelectedTheme(theme.id)}
    >
      <View style={[styles.themePreview, { backgroundColor: theme.value }]}>
        <Ionicons name={theme.icon as any} size={24} color="#6200ee" />
      </View>
      <Text style={styles.themeName}>{theme.name}</Text>
      {selectedTheme === theme.id && (
        <Ionicons name="checkmark-circle" size={24} color="#6200ee" />
      )}
    </TouchableOpacity>
  );

  const renderSectionContent = (section: any) => {
    if (section.type === 'theme') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Theme</Text>
          <View style={styles.themeGrid}>
            {themes.map((theme) => renderThemeOption(theme))}
          </View>
        </View>
      );
    }

    if (section.type === 'fontSize') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Text Size</Text>
          <View style={styles.fontSizeContainer}>
            {fontSizes.map((size) => (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.fontSizeOption,
                  fontSize === size.id && styles.selectedFontSize,
                ]}
                onPress={() => setFontSize(size.id)}
              >
                <Text style={[styles.fontSizePreview, { fontSize: size.size }]}>
                  {size.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Preview:</Text>
            <Text style={[styles.previewText, { fontSize: fontSize === 'small' ? 14 : fontSize === 'medium' ? 16 : 18 }]}>
              This is how your text will look like in the app.
            </Text>
          </View>
        </View>
      );
    }

    if (section.type === 'preferences') {
      return (
        <View style={styles.section}>
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLabel}>
              <Ionicons name="notifications" size={24} color="#6200ee" />
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Push Notifications</Text>
                <Text style={styles.preferenceDescription}>Receive app notifications</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ccc', true: '#81C784' }}
              thumbColor={notifications ? '#4CAF50' : '#f4f3f4'}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLabel}>
              <Ionicons name="volume-high" size={24} color="#6200ee" />
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Sound Effects</Text>
                <Text style={styles.preferenceDescription}>Enable notification sounds</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#ccc', true: '#81C784' }}
              thumbColor={soundEnabled ? '#4CAF50' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={styles.preferenceItem}
            onPress={() => {
              Alert.alert('Language', 'Select your preferred language', [
                { text: 'English', onPress: () => {} },
                { text: 'Hindi', onPress: () => {} },
                { text: 'Cancel', onPress: () => {} },
              ]);
            }}
          >
            <View style={styles.preferenceLabel}>
              <Ionicons name="language" size={24} color="#6200ee" />
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Language</Text>
                <Text style={styles.preferenceDescription}>English</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theme & Display</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.sectionListContainer}>
          {getSectionData().map((section, index) => (
            <View key={index}>
              <Text style={styles.groupTitle}>{section.title}</Text>
              {section.data.map((item, itemIndex) => (
                <View key={itemIndex}>{renderSectionContent(item)}</View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  sectionListContainer: {
    paddingHorizontal: 16,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  themeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  themeOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f9f9f9',
  },
  selectedThemeOption: {
    borderColor: '#6200ee',
    backgroundColor: '#f0f7ff',
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  fontSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  fontSizeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFontSize: {
    borderColor: '#6200ee',
    backgroundColor: '#f0f7ff',
  },
  fontSizePreview: {
    fontWeight: '600',
    color: '#333',
  },
  previewContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  previewText: {
    color: '#333',
    lineHeight: 20,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  preferenceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    marginLeft: 12,
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 13,
    color: '#999',
  },
});
