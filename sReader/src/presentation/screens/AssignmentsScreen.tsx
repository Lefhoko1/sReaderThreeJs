import React from 'react';
import { View, StyleSheet, ScrollView, FlatList, Dimensions, ImageBackground } from 'react-native';
import { Card, Text, Button, useTheme, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

export const AssignmentsScreen = observer(({ onBack }: { onBack: () => void }) => {
  const theme = useTheme();
  const { dashboardVM } = useAppContext();

  if (!dashboardVM.dashboardData) return null;

  const { dashboardData } = dashboardVM;
  const scheduled = dashboardData.scheduledAssignments;
  const upcoming = dashboardData.upcomingAssignments;

  return (
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <Button
          icon="arrow-left"
          mode="text"
          onPress={onBack}
          textColor={theme.colors.onPrimaryContainer}
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer, flex: 1 }}>
          Assignments
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Scheduled Section */}
        {scheduled.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="calendar-check" size={20} color={theme.colors.primary} />
              <Text variant="titleSmall" style={{ marginLeft: 8 }}>
                Scheduled ({scheduled.length})
              </Text>
            </View>

            {scheduled.map((item) => (
              <AssignmentCard
                key={item.id}
                assignment={item.assignment}
                schedule={item}
                theme={theme}
              />
            ))}
          </View>
        )}

        {/* Upcoming Section */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color={theme.colors.tertiary} />
              <Text variant="titleSmall" style={{ marginLeft: 8 }}>
                Upcoming ({upcoming.length})
              </Text>
            </View>

            {upcoming.map((item) => (
              <Card key={item.id} style={styles.card}>
                <Card.Content>
                  <Text variant="titleSmall" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text
                    variant="bodySmall"
                    numberOfLines={2}
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                  >
                    {item.description}
                  </Text>
                  <Button mode="contained" compact style={{ marginTop: 12, alignSelf: 'flex-start' }}>
                    View
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
    </ImageBackground>
  );
});

const AssignmentCard = observer(({ assignment, schedule, theme }: any) => {
  const daysUntilDue = Math.ceil(
    (new Date(schedule.assignment.dueAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysUntilDue <= 2;

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: isUrgent ? theme.colors.errorContainer : theme.colors.surface,
          borderLeftWidth: 4,
          borderLeftColor: isUrgent ? theme.colors.error : theme.colors.primary,
        },
      ]}
    >
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" numberOfLines={1}>
              {assignment.title}
            </Text>
            <Text
              variant="bodySmall"
              numberOfLines={2}
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
            >
              {assignment.description}
            </Text>
          </View>
          {isUrgent && (
            <Chip icon="alert-circle" compact style={{ marginLeft: 8 }}>
              {daysUntilDue}d
            </Chip>
          )}
        </View>
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
          <Button
            mode="contained"
            compact
            style={{ flex: 1 }}
          >
            Start
          </Button>
          <Button
            mode="outlined"
            compact
            style={{ flex: 1 }}
          >
            Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
});
