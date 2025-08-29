import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Colors from "../constants/Colors";

const days = ["", "Mon", "Tue", "Wed", "Thu", "Fri"];
const periods = ["1", "2", "3", "4", "5", "6"];
const periodTimes = [
  { start: "08:00", end: "08:50" },
  { start: "09:00", end: "09:50" },
  { start: "10:00", end: "10:50" },
  { start: "11:00", end: "11:50" },
  { start: "13:00", end: "13:50" },
  { start: "14:00", end: "14:50" },
] as const;

const sampleData: Record<string, string[]> = {
  Mon: ["Math", "Physics", "English", "—", "Biology", "Art"],
  Tue: ["History", "Chemistry", "Math", "CS", "—", "PE"],
  Wed: ["English", "—", "CS", "Math", "Art", "Biology"],
  Thu: ["Math", "—", "History", "Chemistry", "PE", "—"],
  Fri: ["Physics", "Biology", "English", "Math", "CS", "—"],
};

const getCurrentPeriodIndex = () => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < periodTimes.length; i++) {
  const [startHour, startMin] = periodTimes[i]!.start.split(":").map(Number) as [number | undefined, number | undefined];
  const [endHour, endMin] = periodTimes[i]!.end.split(":").map(Number) as [number | undefined, number | undefined];
  if (startHour == null || startMin == null || endHour == null || endMin == null) continue;
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;

    if (currentTime >= start && currentTime <= end) return i;
  }

  return -1;
};

const TimeTableScreen = () => {
  const [currentDay, setCurrentDay] = useState("");
  const [currentPeriod, setCurrentPeriod] = useState(-1);

  useEffect(() => {
    const now = new Date();
    const dayIndex = now.getDay();
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  setCurrentDay(weekdayNames[dayIndex] ?? "");
    setCurrentPeriod(getCurrentPeriodIndex());
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Weekly Schedule</Text>
      
      <View style={styles.tableContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.timeColumnHeader} />
          {days.slice(1).map((day) => (
            <View key={day} style={[
              styles.dayHeader,
              currentDay === day && styles.currentDayHeader
            ]}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Period Rows */}
        {periods.map((period, rowIndex) => (
          <View key={rowIndex} style={styles.periodRow}>
            <View style={styles.timeCell}>
              <Text style={styles.periodNumber}>{period}</Text>
              <Text style={styles.timeText}>
                {periodTimes[rowIndex]!.start} - {periodTimes[rowIndex]!.end}
              </Text>
            </View>
            
            {days.slice(1).map((day) => {
              const isCurrent = currentDay === day && currentPeriod === rowIndex;
              return (
                <View key={`${day}-${rowIndex}`} style={[
                  styles.subjectCell,
                  isCurrent && styles.currentSubjectCell
                ]}>
                  <Text style={styles.subjectText}>
                    {sampleData[day]?.[rowIndex] ?? ''}
                  </Text>
                  {isCurrent && <View style={styles.currentIndicator} />}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primaryDark,
    marginBottom: 20,
    textAlign: "center",
  },
  tableContainer: {
    borderRadius: 12,
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: "hidden",
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: Colors.primaryDark,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray + "30",
  },
  timeColumnHeader: {
    width: 80,
    paddingVertical: 12,
  },
  dayHeader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: Colors.gray + "30",
  },
  currentDayHeader: {
    backgroundColor: Colors.primaryLight + "15",
  },
  dayHeaderText: {
    fontWeight: "500",
    color: Colors.white,
  },
  periodRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray + "30",
  },
  timeCell: {
    width: 80,
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  periodNumber: {
    fontWeight: "500",
    color: Colors.black,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    color: Colors.gray,
  },
  subjectCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: Colors.gray + "30",
    position: "relative",
  },
  currentSubjectCell: {
    backgroundColor: Colors.primaryLight + "10",
  },
  subjectText: {
    color: Colors.black,
    fontSize: 14,
  },
  currentIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
  },
});

export default TimeTableScreen;
