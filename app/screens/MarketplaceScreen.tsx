import { View, StyleSheet, Text } from "react-native";

const MarketplaceScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Marketplace Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MarketplaceScreen;
