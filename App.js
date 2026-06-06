import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';

import { supabase, getProfile } from './src/supabase';
import { Colors } from './src/theme';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import BookRoomScreen from './src/screens/BookRoomScreen';

// Student Screens
import StudentHomeScreen from './src/screens/StudentHomeScreen';
import LaundryScreen from './src/screens/LaundryScreen';
import HousekeepingScreen from './src/screens/HousekeepingScreen';
import MenuScreen from './src/screens/MenuScreen';
import ComplaintsScreen from './src/screens/ComplaintsScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import WifiTestScreen from './src/screens/WifiTestScreen';

// Manager Screens
import ManagerHomeScreen from './src/screens/ManagerHomeScreen';
import ManagerLaundryScreen from './src/screens/ManagerLaundryScreen';
import ManagerServicesScreen from './src/screens/ManagerServicesScreen';
import ManagerMenuScreen from './src/screens/ManagerMenuScreen';
import ManagerComplaintsScreen from './src/screens/ManagerComplaintsScreen';

const Stack = createStackNavigator();

// Hardcoded admin/manager emails (same as web app)
const ADMIN_EMAILS = ['admin@dormdesk.com', 'bikjha2007@gmail.com'];
const MANAGER_EMAILS = ['manager@dormdesk.com', 'hostelmanager@nst.edu'];

function getRole(email, dbRole) {
  if (ADMIN_EMAILS.includes(email)) return 'admin';
  if (MANAGER_EMAILS.includes(email)) return 'manager';
  return dbRole || 'student';
}

const NAV_THEME = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.primary,
  },
};

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: Colors.surface, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 0 },
  headerTintColor: Colors.text,
  headerTitleStyle: { fontWeight: '700', fontSize: 17 },
  cardStyle: { backgroundColor: Colors.background, flex: 1 },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUser(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUser(session.user);
      } else {
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUser = async (authUser) => {
    setLoading(true);
    try {
      const profile = await getProfile(authUser.email);
      const role = getRole(authUser.email, profile?.role);
      setUserRole(role);
      setUser(authUser);
    } catch (e) {
      console.error('Error in handleUser:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async (authUser) => {
    await handleUser(authUser);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer theme={NAV_THEME}>
        <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
          {!user ? (
            // Auth Flow
            <Stack.Screen name="Auth" options={{ headerShown: false }}>
              {(props) => <AuthScreen {...props} onAuthSuccess={handleAuthSuccess} />}
            </Stack.Screen>
          ) : userRole === 'manager' || userRole === 'admin' ? (
            // Manager Flow
            <>
              <Stack.Screen
                name="ManagerHome"
                options={{
                  title: 'Manager Portal',
                  headerRight: () => (
                    <LogoutButton onPress={handleLogout} />
                  ),
                }}
              >
                {(props) => <ManagerHomeScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="ManagerLaundry"
                options={{ title: '🫧 Laundry Manager' }}
                component={ManagerLaundryScreen}
              />
              <Stack.Screen
                name="ManagerServices"
                options={{ title: '✨ Housekeeping Manager' }}
                component={ManagerServicesScreen}
              />
              <Stack.Screen
                name="ManagerMenu"
                options={{ title: '🍽️ Mess Menu Editor' }}
                component={ManagerMenuScreen}
              />
              <Stack.Screen
                name="ManagerComplaints"
                options={{ title: '📋 Student Complaints' }}
                component={ManagerComplaintsScreen}
              />
              <Stack.Screen
                name="WifiTest"
                options={{ title: '📶 WiFi Diagnostics' }}
                component={WifiTestScreen}
              />
            </>
          ) : (
            // Student Flow
            <>
              <Stack.Screen
                name="StudentHome"
                options={{
                  title: 'DormDesk',
                  headerRight: () => (
                    <LogoutButton onPress={handleLogout} />
                  ),
                }}
              >
                {(props) => <StudentHomeScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="Laundry"
                options={{ title: '🫧 Laundry Service' }}
              >
                {(props) => <LaundryScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="Housekeeping"
                options={{ title: '✨ Housekeeping' }}
              >
                {(props) => <HousekeepingScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="Menu"
                options={{ title: "🍽️ Today's Menu" }}
                component={MenuScreen}
              />
              <Stack.Screen
                name="Complaints"
                options={{ title: '📋 My Complaints' }}
              >
                {(props) => <ComplaintsScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen
                name="Payments"
                options={{ title: '💳 Payments' }}
                component={PaymentsScreen}
              />
              <Stack.Screen
                name="WifiTest"
                options={{ title: '📶 WiFi Speed Test' }}
                component={WifiTestScreen}
              />
              <Stack.Screen
                name="BookRoom"
                options={{ title: '🏠 Book Your Room' }}
              >
                {(props) => <BookRoomScreen {...props} user={user} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

// Simple logout button component
function LogoutButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginRight: 4, padding: 4 }}>
      <Text style={{ color: Colors.red, fontSize: 14, fontWeight: '700' }}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
