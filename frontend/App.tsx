import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import SubjectsScreen from './screens/SubjectsScreen';
import LessonScreen from './screens/LessonScreen';
import MenuScreen from './screens/MenuScreen';
import QuizScreen from './screens/QuizScreen';
import ResultsScreen from './screens/ResultsScreen';
import AIAssistantScreen from './screens/AIAssistantScreen';
import ResourcesScreen from './screens/ResourcesScreen';
import ProfileScreenNew from './screens/ProfileScreenNew';
import HistoryScreen from './screens/HistoryScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import NotificationScreen from './screens/NotificationScreen';
import ThemeScreen from './screens/ThemeScreen';
import ClearCacheScreen from './screens/ClearCacheScreen';
import ContactUsScreen from './screens/ContactUsScreen';
import AboutScreen from './screens/AboutScreen';
import PDFViewerScreen from './screens/PDFViewerScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#6200ee',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ title: 'Login' }}
    />
    <Stack.Screen
      name="Signup"
      component={SignupScreen}
      options={{ title: 'Sign Up' }}
    />
  </Stack.Navigator>
);

const commonScreenOptions = {
  headerStyle: { backgroundColor: '#6200ee' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Exam Prep' }} />
    <Stack.Screen name="Subjects" component={SubjectsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Lesson" component={LessonScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PDFViewer" component={PDFViewerScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const QuizStack = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen 
      name="QuizMain" 
      component={QuizScreen} 
      options={{ title: 'Quiz' }}
      initialParams={{ questions: [] }}
    />
    <Stack.Screen name="Results" component={ResultsScreen as unknown as React.ComponentType<any>} options={{ title: 'Results' }} />
  </Stack.Navigator>
);

const ResourcesStack = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="ResourcesMain" component={ResourcesScreen} options={{ title: 'Resources' }} />
  </Stack.Navigator>
);

const AIStack = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="AI" component={AIAssistantScreen} options={{ title: 'AI Assistant' }} />
  </Stack.Navigator>
);

const MenuStack = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="MenuMain" component={MenuScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Profile" component={ProfileScreenNew} options={{ headerShown: false }} />
    <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Theme" component={ThemeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ClearCache" component={ClearCacheScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ContactUs" component={ContactUsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#6200ee',
      tabBarInactiveTintColor: '#999',
      tabBarIcon: ({ color, size }) => {
        let iconName: string = '';
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Learn') iconName = 'book';
        else if (route.name === 'AI Assistant') iconName = 'sparkles';
        else if (route.name === 'Quiz') iconName = 'clipboard';
        else if (route.name === 'Menu') iconName = 'menu';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Home' }} />
    <Tab.Screen name="Learn" component={ResourcesStack} options={{ title: 'Learn' }} />
    <Tab.Screen name="AI Assistant" component={AIStack} options={{ title: 'AI' }} />
    <Tab.Screen name="Quiz" component={QuizStack} options={{ title: 'Quiz' }} />
    <Tab.Screen name="Menu" component={MenuStack} options={{ title: 'Menu' }} />
  </Tab.Navigator>
);

const Navigation = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

