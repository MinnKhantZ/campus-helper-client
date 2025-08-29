import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import EventList from "../components/EventList";
import Colors from "../constants/Colors";

const EventsScreen = ({ navigation }: { navigation: any }) => {
  const handlePress = () => {
    navigation.navigate("EventAdd");
  };

  return (
    <View style={styles.container}>
      <EventList />
      <TouchableOpacity style={styles.addButton} onPress={handlePress}>
        <Icon name="plus" size={40} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    padding: 10,
    elevation: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default EventsScreen;
