import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useTheme, spacing } from "../theme";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const periods = ["1", "2", "3", "4", "5", "6"] as const;
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
    const [startHour, startMin] = periodTimes[i]!.start.split(":").map(Number) as [number, number];
    const [endHour, endMin] = periodTimes[i]!.end.split(":").map(Number) as [number, number];
    if (currentTime >= startHour * 60 + startMin && currentTime <= endHour * 60 + endMin) return i;
  }
  return -1;
};

const TimeTableScreen = () => {
  const [currentDay, setCurrentDay] = useState("");
  const [currentPeriod, setCurrentPeriod] = useState(-1);
  const theme = useTheme();

  useEffect(() => {
    const now = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    setCurrentDay(dayNames[now.getDay()] ?? "");
    setCurrentPeriod(getCurrentPeriodIndex());
  }, []);

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 200 }}
          style={styles.header}
        >
          <Text style={[styles.heading, { color: theme.text }]}>Schedule</Text>
          <Text style={[styles.subheading, { color: theme.textMuted }]}>
            {currentDay ? `Today is ${currentDay}` : "Weekly timetable"}
          </Text>
        </MotiView>

        {/* Table Card */}
        <MotiView
          from={{ opacity: 0, translateY: 24 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", delay: 100, damping: 18, stiffness: 160 }}
          style={[
            styles.tableCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Column headers */}
          <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
            <View style={styles.timeColHeader} />
            {days.map((day) => {
              const isToday = currentDay.startsWith(
                day === "Mon" ? "Monday" :
                day === "Tue" ? "Tuesday" :
                day === "Wed" ? "Wednesday" :
                day === "Thu" ? "Thursday" : "Friday"
              );
              return (
                <View
                  key={day}
                  style={[
                    styles.dayHeader,
                    { borderLeftColor: theme.border },
                    isToday && { backgroundColor: theme.chip },
                  ]}
                >
                  {isToday ? (
                    <LinearGradient
                      colors={[theme.primary, theme.primaryDark]}
                      style={styles.todayBadge}
                    >
                      <Text style={styles.todayText}>{day}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={[styles.dayText, { color: theme.textMuted }]}>{day}</Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Period Rows */}
          {periods.map((period, rowIndex) => (
            <View
              key={rowIndex}
              style={[styles.periodRow, { borderBottomColor: theme.border }]}
            >
              {/* Time column */}
              <View style={styles.timeCell}>
                <Text style={[styles.periodNum, { color: theme.primary }]}>{period}</Text>
                <Text style={[styles.timeText, { color: theme.textMuted }]}>
                  {periodTimes[rowIndex]!.start}
                </Text>
              </View>

              {/* Subject cells */}
              {days.map((day) => {
                const isToday = currentDay.startsWith(
                  day === "Mon" ? "Monday" :
                  day === "Tue" ? "Tuesday" :
                  day === "Wed" ? "Wednesday" :
                  day === "Thu" ? "Thursday" : "Friday"
                );
                const isCurrent = isToday && currentPeriod === rowIndex;
                const subject = sampleData[day]?.[rowIndex] ?? "";

                return (
                  <View
                    key={`${day}-${rowIndex}`}
                    style={[
                      styles.subjectCell,
                      { borderLeftColor: theme.border },
                      isToday && { backgroundColor: `${theme.chip}` },
                    ]}
                  >
                    {isCurrent ? (
                      <MotiView
                        from={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        transition={{ loop: true, type: "timing", duration: 1000, repeatReverse: true }}
                        style={[StyleSheet.absoluteFill, { backgroundColor: theme.chip, borderRadius: 0 }]}
                      />
                    ) : null}
                    <Text
                      style={[
                        styles.subjectText,
                        { color: isCurrent ? theme.primary : theme.text },
                        isCurrent && { fontWeight: "700" },
                      ]}
                      numberOfLines={2}
                    >
                      {subject}
                    </Text>
                    {isCurrent && (
                      <View style={[styles.currentDot, { backgroundColor: theme.primary }]} />
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </MotiView>

        {/* Legend */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 400, type: "timing", duration: 500 }}
          style={styles.legend}
        >
          <View style={[styles.legendDot, { backgroundColor: theme.chip }]} />
          <Text style={[styles.legendText, { color: theme.textMuted }]}>
            Highlighted = current period
          </Text>
        </MotiView>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: {
    paddingBottom: 120,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subheading: {
    fontSize: 14,
    marginTop: 2,
  },
  tableCard: {
    marginHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  timeColHeader: {
    width: 54,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderLeftWidth: 1,
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
  },
  periodRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    minHeight: 52,
  },
  timeCell: {
    width: 54,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  periodNum: {
    fontSize: 14,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 9,
    marginTop: 2,
  },
  subjectCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    borderLeftWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  subjectText: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 14,
  },
  currentDot: {
    position: "absolute",
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
});

export default TimeTableScreen;

