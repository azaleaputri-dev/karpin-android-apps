import React from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {useAuth} from '../context/AuthContext';
import ChildDetailScreen from '../screens/ChildDetailScreen';
import ChildrenScreen from '../screens/ChildrenScreen';
import CreateChildScreen from '../screens/CreateChildScreen';
import CreateMeasurementScreen from '../screens/CreateMeasurementScreen';
import HomeScreen from '../screens/HomeScreen';
import IoTDevicesScreen from '../screens/IoTDevicesScreen';
import LoginScreen from '../screens/LoginScreen';
import MeasurementsScreen from '../screens/MeasurementsScreen';
import PosyanduScreen from '../screens/PosyanduScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScannerScreen from '../screens/ScannerScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import colors from '../theme/colors';
import {isReadOnlyViewer} from '../utils/permissions';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const ChildrenStack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.white,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

const screenOptions = {
  headerShadowVisible: false,
  headerStyle: {backgroundColor: colors.white},
  headerTitleStyle: {fontWeight: '800', fontSize: 17, color: colors.text},
  contentStyle: {backgroundColor: colors.background},
};

function AppNavigator() {
  const {isAuthenticated} = useAuth();
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} options={{headerShown: false}} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabIcons = {
  Dashboard: ({color, size}) => <Ionicons name="home-outline" size={size} color={color} />,
  DataAnak: ({color, size}) => <Ionicons name="people-outline" size={size} color={color} />,
  Scanner: ({color, size}) => <Ionicons name="scan-outline" size={size} color={color} />,
  Pengukuran: ({color, size}) => <Ionicons name="analytics-outline" size={size} color={color} />,
};

function MainTabs() {
  const {user} = useAuth();
  const readOnlyViewer = isReadOnlyViewer(user);

  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: {height: 60, paddingBottom: 6, paddingTop: 6, backgroundColor: colors.white, borderTopWidth: 0, elevation: 0, shadowOpacity: 0},
      tabBarLabelStyle: {fontWeight: '700', fontSize: 11},
    }}>
      <Tab.Screen name="Dashboard" component={DashboardStackScreen} options={{tabBarLabel: 'Beranda', tabBarIcon: tabIcons.Dashboard}} />
      <Tab.Screen name="DataAnak" component={ChildrenStackScreen} options={{tabBarLabel: 'Anak', tabBarIcon: tabIcons.DataAnak}} />
      {!readOnlyViewer ? <Tab.Screen name="Scanner" component={ScannerScreen} options={{tabBarLabel: 'Scan', tabBarIcon: tabIcons.Scanner}} /> : null}
      <Tab.Screen name="Pengukuran" component={MeasurementsScreen} options={{tabBarLabel: 'Riwayat', tabBarIcon: tabIcons.Pengukuran}} />
    </Tab.Navigator>
  );
}

function DashboardStackScreen() {
  const {user} = useAuth();
  const readOnlyViewer = isReadOnlyViewer(user);

  return (
    <DashboardStack.Navigator screenOptions={screenOptions}>
      <DashboardStack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
      <DashboardStack.Screen name="Profile" component={ProfileScreen} options={{title: 'Profil Saya'}} />
      {!readOnlyViewer ? <DashboardStack.Screen name="Posyandu" component={PosyanduScreen} options={{title: 'Posyandu'}} /> : null}
      {!readOnlyViewer ? <DashboardStack.Screen name="UserManagement" component={UserManagementScreen} options={{title: 'Manajemen User'}} /> : null}
      {!readOnlyViewer ? <DashboardStack.Screen name="IoTDevices" component={IoTDevicesScreen} options={{title: 'Perangkat IoT'}} /> : null}
    </DashboardStack.Navigator>
  );
}

function ChildrenStackScreen() {
  const {user} = useAuth();
  const readOnlyViewer = isReadOnlyViewer(user);

  return (
    <ChildrenStack.Navigator screenOptions={screenOptions}>
      <ChildrenStack.Screen name="ChildrenList" component={ChildrenScreen} options={{title: 'Data Anak'}} />
      {!readOnlyViewer ? <ChildrenStack.Screen name="CreateChild" component={CreateChildScreen} options={{title: 'Tambah Anak'}} /> : null}
      <ChildrenStack.Screen name="ChildDetail" component={ChildDetailScreen} options={({route}) => ({title: route.params?.title || 'Detail Anak'})} />
      {!readOnlyViewer ? <ChildrenStack.Screen name="CreateMeasurement" component={CreateMeasurementScreen} options={{title: 'Tambah Pengukuran'}} /> : null}
    </ChildrenStack.Navigator>
  );
}

export default AppNavigator;
