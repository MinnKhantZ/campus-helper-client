import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EventsScreen from "./screens/EventsScreen";
import TimeTableScreen from "./screens/TimeTableScreen";
import MapScreen from "./screens/MapScreen";
import ClubsScreen from "./screens/ClubsScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MarketplaceScreen from "./screens/MarketplaceScreen";
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import EventAddScreen from "./screens/EventAddScreen";
import ClubInfoScreen from "./screens/ClubInfoScreen";
import ClubFormScreen from "./screens/ClubFormScreen";
import MarketDetailScreen from "./screens/MarketDetailScreen";
import MarketFormScreen from "./screens/MarketFormScreen";
import ClubChatScreen from "./screens/ClubChatScreen";
import Colors from "./constants/Colors";
import LoginScreen from "./screens/LoginScreen";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loadAuthFromStorage } from './features/authSlice';
import type { RootState, AppDispatch } from './store';
export type RootStackParamList = {
  Login: undefined;
  TabGroup: undefined;
  EventAdd: undefined;
  ClubInfo: undefined;
  ClubForm: undefined;
  MarketDetail: { id: number };
  MarketForm: { id?: number } | undefined;
  ClubChat: { id: number };
};

const Stack = createNativeStackNavigator();

const StackGroup = () => {
  const auth = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => { if (!auth.hydrated) { dispatch(loadAuthFromStorage()); } }, [auth.hydrated, dispatch]);
  const screenOptions = {
    headerShown: false,
  } as const;

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!auth.accessToken ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        [
          <Stack.Screen key="tab" name="TabGroup" component={DrawerGroup} />,
          <Stack.Screen key="addevent" name="EventAdd" component={EventAddScreen} />,
          <Stack.Screen key="clubinfo" name="ClubInfo" component={ClubInfoScreen} />,
          <Stack.Screen key="clubform" name="ClubForm" component={ClubFormScreen} />,
          <Stack.Screen key="clubchat" name="ClubChat" component={ClubChatScreen} />,
          <Stack.Screen key="marketdetail" name="MarketDetail" component={MarketDetailScreen} />,
          <Stack.Screen key="marketform" name="MarketForm" component={MarketFormScreen} />,
        ]
      )}
    </Stack.Navigator>
  );
};

const Drawer = createDrawerNavigator();

const DrawerGroup = () => {
  const user = useSelector((s: RootState) => s.auth?.user);
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        drawerActiveTintColor: Colors.drawerActive,
        drawerInactiveTintColor: Colors.drawerInactive,
        drawerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTitle: user ? `${user.name} (${user.role})` : undefined,
        drawerIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'shopping' : 'shopping-outline';
          } else if (route.name === 'Clubs') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          }

          return <Icon name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Drawer.Screen name="Home" component={TabGroup} />
      <Drawer.Screen name="Marketplace" component={MarketplaceScreen} />
      <Drawer.Screen name="Clubs" component={ClubsScreen} />
    </Drawer.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const TabGroup = () => {
  const screenOptions = {
    headerShown: false,
    tabBarLabel: () => null,
    tabBarStyle: {
      backgroundColor: Colors.tabBackground,
      borderTopColor: Colors.background,
      elevation: 5,
    },
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.gray,
  } as const;

  return (
    <Tab.Navigator screenOptions={screenOptions} backBehavior="history">
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="TimeTable"
        component={TimeTableScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="clock-time-four-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="map-marker" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
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
