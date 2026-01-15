/**
 * Student Enrollments & Requests Management
 * Shows student their pending requests and active enrollments
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { TutoringViewModel } from '../../../../application/viewmodels/TutoringViewModel';
import { StudentRegistrationRequest, StudentSubjectEnrollment } from '../../../../domain/entities/tutoring';
import { ID } from '../../../../shared/types';

export interface StudentEnrollmentsProps {
  viewModel: TutoringViewModel;
  studentId: ID;
}

const { width } = Dimensions.get('window');

export const StudentEnrollments: React.FC<StudentEnrollmentsProps> = observer(({
  viewModel,
  studentId,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'enrollments'>('requests');
  const [expandedRequestId, setExpandedRequestId] = useState<ID | null>(null);

  useEffect(() => {
    viewModel.loadMyRegistrationRequests(studentId);
    viewModel.loadMyEnrollments(studentId);
  }, [studentId]);

  const handleWithdrawRequest = (request: StudentRegistrationRequest) => {
    Alert.alert(
      'Withdraw Registration Request',
      `Are you sure you want to withdraw your request for this class?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Withdraw',
          onPress: async () => {
            const result = await viewModel.withdrawRegistrationRequest(request.id);
            if (result.ok) {
              Alert.alert('Success', 'Request withdrawn');
            } else {
              Alert.alert('Error', result.error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDropSubject = (enrollment: StudentSubjectEnrollment) => {
    Alert.alert(
      'Drop Class',
      'Are you sure you want to drop this class? This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Drop',
          onPress: async () => {
            const result = await viewModel.removeStudentFromClass(enrollment.id);
            if (result.ok) {
              Alert.alert('Success', 'You have been dropped from the class');
            } else {
              Alert.alert('Error', result.error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#ffc107';
      case 'APPROVED':
        return '#28a745';
      case 'REJECTED':
        return '#dc3545';
      case 'WITHDRAWN':
        return '#6c757d';
      default:
        return '#007AFF';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'APPROVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      case 'WITHDRAWN':
        return '↩️';
      default:
        return 'ℹ️';
    }
  };

  const renderRegistrationRequest = (request: StudentRegistrationRequest) => (
    <View key={request.id} style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          setExpandedRequestId(
            expandedRequestId === request.id ? null : request.id
          )
        }
        style={styles.cardHeader}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.statusIcon}>
            {getStatusIcon(request.status)}
          </Text>
          <View style={styles.headerInfo}>
            <Text style={styles.requestTitle}>
              Class Registration Request
            </Text>
            <Text style={styles.requestDate}>
              Requested: {new Date(request.requestedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) },
          ]}
        >
          <Text style={styles.statusText}>{request.status}</Text>
        </View>
      </TouchableOpacity>

      {expandedRequestId === request.id && (
        <View style={styles.cardExpanded}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cost Term</Text>
            <Text style={styles.value}>{request.costTerm || 'Not specified'}</Text>
          </View>

          {request.costAmount && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Cost Amount</Text>
              <Text style={styles.value}>${request.costAmount}</Text>
            </View>
          )}

          {request.enrollmentStartDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Enrollment Start</Text>
              <Text style={styles.value}>
                {new Date(request.enrollmentStartDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {request.enrollmentEndDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Enrollment End</Text>
              <Text style={styles.value}>
                {new Date(request.enrollmentEndDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {request.rejectionReason && (
            <View style={styles.rejectionBox}>
              <Text style={styles.rejectionLabel}>Rejection Reason</Text>
              <Text style={styles.rejectionText}>{request.rejectionReason}</Text>
            </View>
          )}

          <View style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>Payment Status</Text>
            <Text
              style={[
                styles.paymentStatus,
                {
                  color:
                    request.paymentStatus === 'PAID'
                      ? '#28a745'
                      : request.paymentStatus === 'PENDING'
                      ? '#ffc107'
                      : '#dc3545',
                },
              ]}
            >
              {request.paymentStatus}
            </Text>
          </View>

          {request.status === 'PENDING' && (
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.withdrawButton]}
                onPress={() => handleWithdrawRequest(request)}
              >
                <Text style={styles.withdrawButtonText}>Withdraw Request</Text>
              </TouchableOpacity>
            </View>
          )}

          {request.status === 'APPROVED' && request.paymentStatus !== 'PAID' && (
            <TouchableOpacity style={styles.paymentButton}>
              <Text style={styles.paymentButtonText}>💳 Complete Payment</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderEnrollment = (enrollment: StudentSubjectEnrollment) => (
    <View key={enrollment.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.statusIcon}>✅</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.requestTitle}>Active Enrollment</Text>
            <Text style={styles.requestDate}>
              Since: {new Date(enrollment.enrolledAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                enrollment.paymentStatus === 'PAID' ? '#28a745' : '#ffc107',
            },
          ]}
        >
          <Text style={styles.statusText}>{enrollment.paymentStatus}</Text>
        </View>
      </View>

      <View style={styles.cardExpanded}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Class ID</Text>
          <Text style={styles.value}>{enrollment.subjectId}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Cost Paid</Text>
          <Text style={styles.value}>${enrollment.costPaid}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Cost Term</Text>
          <Text style={styles.value}>{enrollment.costTerm}</Text>
        </View>

        {enrollment.nextPaymentDueDate && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Next Payment Due</Text>
            <Text style={styles.value}>
              {new Date(enrollment.nextPaymentDueDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {enrollment.enrollmentEndDate && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Enrollment Ends</Text>
            <Text style={styles.value}>
              {new Date(enrollment.enrollmentEndDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={styles.cardActions}>
          {enrollment.paymentStatus !== 'PAID' && (
            <TouchableOpacity style={styles.paymentButton}>
              <Text style={styles.paymentButtonText}>💳 Make Payment</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.dropButton]}
            onPress={() => handleDropSubject(enrollment)}
          >
            <Text style={styles.dropButtonText}>Drop Class</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (viewModel.loading && viewModel.registrationRequests.length === 0 && viewModel.studentEnrollments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'requests' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'requests' && styles.tabLabelActive,
            ]}
          >
            📝 Requests ({viewModel.registrationRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'enrollments' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('enrollments')}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'enrollments' && styles.tabLabelActive,
            ]}
          >
            ✅ Classes ({viewModel.studentEnrollments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'requests' ? (
          // Registration Requests View
          <>
            {viewModel.registrationRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyTitle}>No Registration Requests</Text>
                <Text style={styles.emptySubtext}>
                  Browse classes and submit registration requests
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {viewModel.registrationRequests.map(renderRegistrationRequest)}
              </View>
            )}
          </>
        ) : (
          // Enrollments View
          <>
            {viewModel.studentEnrollments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyTitle}>No Active Enrollments</Text>
                <Text style={styles.emptySubtext}>
                  You are not enrolled in any classes yet
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {viewModel.studentEnrollments.map(renderEnrollment)}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Messages */}
      {viewModel.successMessage && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>✓ {viewModel.successMessage}</Text>
        </View>
      )}

      {viewModel.error && (
        <View style={styles.errorMessage}>
          <Text style={styles.errorText}>✕ {viewModel.error}</Text>
        </View>
      )}
    </View>
  );
});

StudentEnrollments.displayName = 'StudentEnrollments';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  tabLabelActive: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusIcon: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardExpanded: {
    padding: 16,
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    color: '#212529',
    fontWeight: '500',
  },
  rejectionBox: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 3,
    borderLeftColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    marginVertical: 12,
  },
  rejectionLabel: {
    fontSize: 12,
    color: '#721c24',
    fontWeight: '600',
    marginBottom: 6,
  },
  rejectionText: {
    fontSize: 13,
    color: '#721c24',
    lineHeight: 18,
  },
  paymentInfo: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
  },
  paymentStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  withdrawButton: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  withdrawButtonText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 13,
  },
  dropButton: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  dropButtonText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 13,
  },
  paymentButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  paymentButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  successMessage: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    padding: 12,
    margin: 12,
    borderRadius: 4,
  },
  successText: {
    color: '#155724',
    fontWeight: '600',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    padding: 12,
    margin: 12,
    borderRadius: 4,
  },
  errorText: {
    color: '#721c24',
    fontWeight: '600',
  },
});
