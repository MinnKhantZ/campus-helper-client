import { View, StyleSheet, Text } from "react-native";

const ClubsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Clubs Screen</Text>
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

export default ClubsScreen;
