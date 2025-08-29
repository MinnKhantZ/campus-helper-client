import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './app/Navigation';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import store from './app/store';
import useNotiSetup from './app/hooks/useNotiSetup';

export default function App() {
  useNotiSetup();

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider>
          <Navigation />
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
