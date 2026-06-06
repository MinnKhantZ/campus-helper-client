import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EventsScreen from "./screens/EventsScreen";
import TimeTableScreen from "./screens/TimeTableScreen";
import MapScreen from "./screens/MapScreen";
import ClubsScreen from "./screens/ClubsScreen";
import MarketplaceScreen from "./screens/MarketplaceScreen";
import EventAddScreen from "./screens/EventAddScreen";
import ClubInfoScreen from "./screens/ClubInfoScreen";
import ClubFormScreen from "./screens/ClubFormScreen";
import MarketDetailScreen from "./screens/MarketDetailScreen";
import MarketFormScreen from "./screens/MarketFormScreen";
import ClubChatScreen from "./screens/ClubChatScreen";
import LoginScreen from "./screens/LoginScreen";
import TabBar from "./components/ui/TabBar";
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loadAuthFromStorage } from './features/authSlice';
import { useTheme } from './theme';
import type { RootState, AppDispatch } from './store';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  EventAdd: undefined;
  ClubInfo: { id: number };
  ClubForm: { id?: number } | undefined;
  MarketDetail: { id: number };
  MarketForm: { id?: number } | undefined;
  ClubChat: { id: number };
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <TabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Events" component={EventsScreen} />
    <Tab.Screen name="TimeTable" component={TimeTableScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
    <Tab.Screen name="Clubs" component={ClubsScreen} />
  </Tab.Navigator>
);

const LoadingScreen = () => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.gradientStart }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
};

const StackGroup = () => {
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (!auth.hydrated) {
      dispatch(loadAuthFromStorage());
    }
  }, [auth.hydrated, dispatch]);

  if (!auth.hydrated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!auth.accessToken ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="EventAdd" component={EventAddScreen} />
          <Stack.Screen name="ClubInfo" component={ClubInfoScreen} />
          <Stack.Screen name="ClubForm" component={ClubFormScreen} />
          <Stack.Screen name="ClubChat" component={ClubChatScreen} />
          <Stack.Screen name="MarketDetail" component={MarketDetailScreen} />
          <Stack.Screen name="MarketForm" component={MarketFormScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <StackGroup />
    </NavigationContainer>
  );
};

export default Navigation;

