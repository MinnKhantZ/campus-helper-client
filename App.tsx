import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './app/Navigation';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import store from './app/store';
import useNotiSetup from './app/hooks/useNotiSetup';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function App() {
  useNotiSetup();

  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <SafeAreaProvider>
          <PaperProvider>
            <Navigation />
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

