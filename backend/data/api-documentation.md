# CyberSIO Platform API Documentation

## Overview

The CyberSIO Platform is a comprehensive security information and event management (SIEM) and user entity behavior analytics (UEBA) solution. This documentation provides detailed information about platform features, UI navigation, and user workflows.

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [tbSIEM Module](#tbsiem-module)
3. [tbUEBA Module](#tbueba-module)
4. [Dashboards](#dashboards)
5. [Alerts Management](#alerts-management)
6. [Anomaly Detection](#anomaly-detection)
7. [Detection Rules](#detection-rules)
8. [Investigations](#investigations)
9. [Reports](#reports)
10. [User Interface Navigation](#user-interface-navigation)

---

## Platform Overview

### What is CyberSIO?

CyberSIO is an integrated security platform combining Threat-Based SIEM (tbSIEM) and Threat-Based UEBA (tbUEBA) capabilities. The platform provides:

- **Real-time Security Monitoring**: Continuous monitoring of security events and threats
- **Behavioral Analytics**: Advanced user and entity behavior analysis
- **Threat Detection**: Automated detection of security threats and anomalies
- **Incident Management**: Comprehensive investigation and response workflows
- **Compliance Reporting**: Automated compliance and audit reporting

### Main Navigation

The platform's main navigation is located at the top of the screen and includes:

- **Dashboard**: Access to all dashboard views
- **tbSIEM**: Security Information and Event Management module
- **tbUEBA**: User Entity Behavior Analytics module
- **Alerts**: Security alerts and notifications
- **Investigations**: Security investigation cases
- **Reports**: Report generation and scheduling
- **Settings**: Platform configuration and user settings

---

## tbSIEM Module

### Overview

tbSIEM (Threat-Based SIEM) is the Security Information and Event Management module that provides log collection, analysis, threat detection, and incident management capabilities.

### Key Features

#### 1. Log Collection and Analysis

**Navigation**: Main Menu → tbSIEM → Logs

**How to Access**:
1. Click on "tbSIEM" in the main navigation
2. Select "Logs" from the left sidebar
3. View collected logs in the table view

**Features**:
- Real-time log ingestion from multiple sources
- Log parsing and normalization
- Search and filter capabilities
- Export logs for analysis

**UI Steps**:
1. Navigate to tbSIEM → Logs
2. Use the search bar to find specific logs
3. Apply filters (time range, source, severity)
4. Click on a log entry to view details
5. Use "Export" button to download logs

#### 2. Threat Detection and Correlation

**Navigation**: Main Menu → tbSIEM → Threats

**How to Access**:
1. Click on "tbSIEM" in the main navigation
2. Select "Threats" from the left sidebar
3. View detected threats in the dashboard

**Features**:
- Automated threat detection
- Threat correlation and scoring
- Threat timeline visualization
- Threat investigation workflows

**UI Steps**:
1. Navigate to tbSIEM → Threats
2. Review the threat dashboard
3. Click on a threat to view details
4. Use "Investigate" button to start investigation
5. Assign threats to team members

#### 3. Incident Management

**Navigation**: Main Menu → tbSIEM → Incidents

**How to Access**:
1. Click on "tbSIEM" in the main navigation
2. Select "Incidents" from the left sidebar
3. View active and resolved incidents

**Features**:
- Incident creation and tracking
- Incident assignment and escalation
- Incident response workflows
- Incident reporting

**UI Steps**:
1. Navigate to tbSIEM → Incidents
2. Click "New Incident" to create one
3. Fill in incident details
4. Assign to team members
5. Track incident status and updates

#### 4. Compliance Reporting

**Navigation**: Main Menu → tbSIEM → Compliance

**How to Access**:
1. Click on "tbSIEM" in the main navigation
2. Select "Compliance" from the left sidebar
3. View compliance reports

**Features**:
- Pre-built compliance templates (SOC 2, ISO 27001, GDPR, etc.)
- Custom compliance reports
- Automated compliance checks
- Compliance dashboard

**UI Steps**:
1. Navigate to tbSIEM → Compliance
2. Select a compliance framework
3. Review compliance status
4. Generate compliance reports
5. Schedule automated compliance checks

---

## tbUEBA Module

### Overview

tbUEBA (Threat-Based User Entity Behavior Analytics) provides advanced behavioral analytics to detect anomalies and threats based on user and entity behavior patterns.

### Key Features

#### 1. User Behavior Profiling

**Navigation**: Main Menu → tbUEBA → Users

**How to Access**:
1. Click on "tbUEBA" in the main navigation
2. Select "Users" from the left sidebar
3. View user behavior profiles

**Features**:
- User behavior baseline establishment
- Behavior pattern analysis
- Risk scoring for users
- User activity timeline

**UI Steps**:
1. Navigate to tbUEBA → Users
2. Search for a specific user
3. Click on a user to view behavior profile
4. Review behavior baseline and patterns
5. Check risk score and anomalies

#### 2. Anomaly Detection

**Navigation**: Main Menu → tbUEBA → Anomalies

**How to Access**:
1. Click on "tbUEBA" in the main navigation
2. Select "Anomalies" from the left sidebar
3. View detected anomalies

**Features**:
- Real-time anomaly detection
- Anomaly scoring and prioritization
- Anomaly investigation workflows
- Anomaly timeline visualization

**UI Steps**:
1. Navigate to tbUEBA → Anomalies
2. Review the anomalies dashboard
3. Filter anomalies by severity, type, or user
4. Click on an anomaly to investigate
5. Use timeline view to understand sequence of events

#### 3. Risk Scoring

**Navigation**: Main Menu → tbUEBA → Risk Scores

**How to Access**:
1. Click on "tbUEBA" in the main navigation
2. Select "Risk Scores" from the left sidebar
3. View risk scores for users and entities

**Features**:
- Automated risk calculation
- Risk score trends
- Risk-based alerting
- Risk score reports

**UI Steps**:
1. Navigate to tbUEBA → Risk Scores
2. View risk score dashboard
3. Filter by risk level (High, Medium, Low)
4. Click on a user/entity to view detailed risk analysis
5. Export risk score reports

#### 4. Entity Timeline Analysis

**Navigation**: Main Menu → tbUEBA → Timeline

**How to Access**:
1. Click on "tbUEBA" in the main navigation
2. Select "Timeline" from the left sidebar
3. View entity activity timelines

**Features**:
- Chronological activity visualization
- Event correlation
- Timeline filtering and search
- Timeline export

**UI Steps**:
1. Navigate to tbUEBA → Timeline
2. Search for a user or entity
3. Select time range
4. Review timeline of activities
5. Click on events to view details

---

## Dashboards

### Overview

Dashboards provide visual overviews of security metrics, threats, and system status. Multiple dashboard types are available for different use cases.

### Dashboard Types

#### 1. Security Overview Dashboard

**Navigation**: Main Menu → Dashboards → Security Overview

**How to Access**:
1. Click on "Dashboards" in the main navigation
2. Select "Security Overview" from the dashboard list
3. View security metrics and KPIs

**Features**:
- Real-time security metrics
- Threat count and trends
- Alert summary
- System health status

**UI Steps**:
1. Navigate to Dashboards → Security Overview
2. Review key security metrics
3. Use time range selector to change period
4. Click on widgets to drill down
5. Customize dashboard layout

#### 2. Threat Dashboard

**Navigation**: Main Menu → Dashboards → Threats

**How to Access**:
1. Click on "Dashboards" in the main navigation
2. Select "Threats" from the dashboard list
3. View threat-related metrics

**Features**:
- Threat detection trends
- Threat severity distribution
- Top threat sources
- Threat response metrics

**UI Steps**:
1. Navigate to Dashboards → Threats
2. Review threat metrics
3. Filter by threat type or severity
4. Click on charts for detailed views
5. Export dashboard data

#### 3. User Activity Dashboard

**Navigation**: Main Menu → Dashboards → User Activity

**How to Access**:
1. Click on "Dashboards" in the main navigation
2. Select "User Activity" from the dashboard list
3. View user activity metrics

**Features**:
- User activity trends
- Top active users
- Activity by department
- Anomalous activity indicators

**UI Steps**:
1. Navigate to Dashboards → User Activity
2. Review activity metrics
3. Filter by user, department, or time
4. Identify unusual patterns
5. Drill down into specific user activities

### Dashboard Customization

**How to Customize**:
1. Open any dashboard
2. Click "Customize" button in the top right
3. Add or remove widgets
4. Resize and rearrange widgets
5. Save custom dashboard layout

---

## Alerts Management

### Overview

Alerts are security events that require attention. The alerts management system provides tools to view, filter, investigate, and respond to security alerts.

### Alert Types

#### 1. Security Alerts

**Navigation**: Main Menu → Alerts → Security

**How to Access**:
1. Click on "Alerts" in the main navigation
2. Select "Security" tab
3. View security-related alerts

**Features**:
- Real-time alert notifications
- Alert severity levels (Critical, High, Medium, Low)
- Alert filtering and search
- Alert actions (Acknowledge, Resolve, Assign)

**UI Steps**:
1. Navigate to Alerts → Security
2. Review alert list
3. Use filters to find specific alerts
4. Click on an alert to view details
5. Take action: Acknowledge, Resolve, or Assign

#### 2. Anomaly Alerts

**Navigation**: Main Menu → Alerts → Anomalies

**How to Access**:
1. Click on "Alerts" in the main navigation
2. Select "Anomalies" tab
3. View anomaly-based alerts

**Features**:
- Anomaly detection alerts
- Behavioral anomaly notifications
- Anomaly investigation links
- Risk score changes

**UI Steps**:
1. Navigate to Alerts → Anomalies
2. Review anomaly alerts
3. Filter by user or anomaly type
4. Click to investigate anomaly
5. Link to related investigations

### Alert Actions

#### Acknowledging Alerts

**UI Steps**:
1. Select one or more alerts
2. Click "Acknowledge" button
3. Optionally add a note
4. Alert status changes to "Acknowledged"

#### Resolving Alerts

**UI Steps**:
1. Select an alert
2. Click "Resolve" button
3. Select resolution reason
4. Add resolution notes
5. Alert status changes to "Resolved"

#### Assigning Alerts

**UI Steps**:
1. Select an alert
2. Click "Assign" button
3. Select team member or team
4. Add assignment notes
5. Alert is assigned and notification sent

### Alert Filters

**Available Filters**:
- Severity (Critical, High, Medium, Low)
- Status (New, Acknowledged, Resolved, Assigned)
- Time Range
- Source
- Alert Type
- Assigned To

**How to Use Filters**:
1. Open Alerts page
2. Click "Filters" button
3. Select filter criteria
4. Click "Apply Filters"
5. View filtered results

---

## Anomaly Detection

### Overview

Anomaly detection identifies unusual patterns in user and entity behavior that may indicate security threats.

### Anomaly Types

#### 1. User Behavior Anomalies

**Navigation**: Main Menu → tbUEBA → Anomalies → User Behavior

**How to Access**:
1. Navigate to tbUEBA → Anomalies
2. Select "User Behavior" tab
3. View user behavior anomalies

**Features**:
- Unusual login patterns
- Abnormal data access
- Atypical activity times
- Geographic anomalies

**UI Steps**:
1. Navigate to tbUEBA → Anomalies → User Behavior
2. Review anomaly list
3. Filter by user or anomaly type
4. Click on anomaly to investigate
5. Review behavior timeline

#### 2. Entity Anomalies

**Navigation**: Main Menu → tbUEBA → Anomalies → Entities

**How to Access**:
1. Navigate to tbUEBA → Anomalies
2. Select "Entities" tab
3. View entity-related anomalies

**Features**:
- Unusual entity access patterns
- Abnormal resource usage
- Atypical communication patterns
- Configuration changes

**UI Steps**:
1. Navigate to tbUEBA → Anomalies → Entities
2. Review entity anomalies
3. Filter by entity type
4. Investigate specific anomalies
5. View entity timeline

### Anomaly Investigation

**UI Steps**:
1. Click on an anomaly
2. Review anomaly details and score
3. View related events in timeline
4. Compare with baseline behavior
5. Create investigation if needed
6. Assign for review

---

## Detection Rules

### Overview

Detection rules define conditions that trigger security alerts. Rules can be created, edited, tested, and managed through the rules interface.

### Rule Types

#### 1. Correlation Rules

**Navigation**: Main Menu → Rules → Correlation

**How to Access**:
1. Click on "Rules" in the main navigation
2. Select "Correlation" tab
3. View correlation rules

**Features**:
- Event correlation logic
- Multi-event pattern matching
- Time-based correlations
- Rule performance metrics

**UI Steps**:
1. Navigate to Rules → Correlation
2. Review existing rules
3. Click "New Rule" to create
4. Define correlation conditions
5. Test rule before enabling

#### 2. Threshold Rules

**Navigation**: Main Menu → Rules → Threshold

**How to Access**:
1. Click on "Rules" in the main navigation
2. Select "Threshold" tab
3. View threshold-based rules

**Features**:
- Count-based thresholds
- Rate-based thresholds
- Time window configuration
- Threshold alerts

**UI Steps**:
1. Navigate to Rules → Threshold
2. Review threshold rules
3. Create new threshold rule
4. Set threshold values
5. Configure alert actions

### Creating a Rule

**UI Steps**:
1. Navigate to Rules
2. Click "New Rule" button
3. Select rule type
4. Define rule conditions
5. Set alert actions
6. Test rule with sample data
7. Enable rule when ready

### Rule Management

**Actions Available**:
- Enable/Disable rules
- Edit rule configuration
- Test rules
- View rule performance
- Delete rules
- Clone rules

**UI Steps**:
1. Navigate to Rules
2. Select a rule
3. Use action menu (three dots)
4. Choose action (Edit, Test, Enable/Disable, Delete)
5. Confirm action

---

## Investigations

### Overview

Investigations allow security teams to track and manage security cases, collect evidence, and document findings.

### Creating an Investigation

**Navigation**: Main Menu → Investigations

**How to Access**:
1. Click on "Investigations" in the main navigation
2. Click "New Investigation" button
3. Fill in investigation details

**UI Steps**:
1. Navigate to Investigations
2. Click "New Investigation"
3. Enter investigation title and description
4. Select priority level
5. Assign to team members
6. Link related alerts or anomalies
7. Save investigation

### Investigation Workflow

#### 1. Evidence Collection

**UI Steps**:
1. Open an investigation
2. Go to "Evidence" tab
3. Click "Add Evidence"
4. Upload files or link alerts/anomalies
5. Add evidence notes
6. Save evidence

#### 2. Notes and Findings

**UI Steps**:
1. Open an investigation
2. Go to "Notes" tab
3. Click "Add Note"
4. Enter findings or observations
5. Tag team members if needed
6. Save note

#### 3. Status Updates

**UI Steps**:
1. Open an investigation
2. Click status dropdown
3. Select new status (Open, In Progress, Resolved, Closed)
4. Add status change notes
5. Save status update

### Investigation Actions

**Available Actions**:
- Add evidence
- Create notes
- Update status
- Assign team members
- Link related items
- Generate report
- Close investigation

---

## Reports

### Overview

Reports provide summarized security insights, compliance status, and audit trails. Reports can be generated on-demand or scheduled for automatic delivery.

### Report Types

#### 1. Security Summary Reports

**Navigation**: Main Menu → Reports → Security Summary

**How to Access**:
1. Click on "Reports" in the main navigation
2. Select "Security Summary"
3. Configure report parameters

**Features**:
- Security event summary
- Threat overview
- Alert statistics
- Incident summary

**UI Steps**:
1. Navigate to Reports → Security Summary
2. Select time range
3. Choose report format (PDF, Excel, CSV)
4. Configure filters
5. Click "Generate Report"
6. Download or email report

#### 2. Compliance Reports

**Navigation**: Main Menu → Reports → Compliance

**How to Access**:
1. Click on "Reports" in the main navigation
2. Select "Compliance"
3. Choose compliance framework

**Features**:
- Compliance status reports
- Audit trail reports
- Compliance gap analysis
- Regulatory reports

**UI Steps**:
1. Navigate to Reports → Compliance
2. Select compliance framework
3. Configure report parameters
4. Generate report
5. Review and export

#### 3. User Activity Reports

**Navigation**: Main Menu → Reports → User Activity

**How to Access**:
1. Click on "Reports" in the main navigation
2. Select "User Activity"
3. Configure user and time range

**Features**:
- User activity summary
- Login activity reports
- Data access reports
- Anomaly reports

**UI Steps**:
1. Navigate to Reports → User Activity
2. Select users or groups
3. Choose time range
4. Select report type
5. Generate and download

### Scheduling Reports

**UI Steps**:
1. Navigate to Reports
2. Select a report template
3. Configure report parameters
4. Click "Schedule" button
5. Set schedule frequency (Daily, Weekly, Monthly)
6. Add email recipients
7. Save schedule

---

## User Interface Navigation

### Main Menu Structure

The main menu is organized into the following sections:

1. **Dashboard**: Quick access to all dashboards
2. **tbSIEM**: SIEM-related features (Logs, Threats, Incidents, Compliance)
3. **tbUEBA**: UEBA features (Users, Anomalies, Risk Scores, Timeline)
4. **Alerts**: All security alerts
5. **Investigations**: Security investigation cases
6. **Reports**: Report generation and scheduling
7. **Settings**: Platform and user settings

### Common UI Elements

#### Search Functionality

**Location**: Top navigation bar

**How to Use**:
1. Click on search icon or press Ctrl+K
2. Type search query
3. Select from search results
4. Navigate to selected item

#### Filters

**Location**: Most list views and dashboards

**How to Use**:
1. Click "Filters" button
2. Select filter criteria
3. Click "Apply"
4. View filtered results

#### Time Range Selector

**Location**: Dashboards and reports

**How to Use**:
1. Click time range selector
2. Choose preset (Last 24 hours, Last 7 days, etc.)
3. Or select custom range
4. Apply time range

### Keyboard Shortcuts

- **Ctrl+K**: Open search
- **Ctrl+/**: Show keyboard shortcuts
- **Esc**: Close modals/dialogs
- **Ctrl+F**: Find in page
- **Ctrl+S**: Save (in forms)

---

## Best Practices

### Dashboard Usage

1. **Customize Dashboards**: Create custom dashboards for your team's needs
2. **Set Time Ranges**: Always review appropriate time ranges for context
3. **Drill Down**: Use widget click-through to investigate details
4. **Regular Review**: Review dashboards regularly for trends

### Alert Management

1. **Prioritize by Severity**: Focus on Critical and High severity alerts first
2. **Use Filters**: Leverage filters to find relevant alerts quickly
3. **Document Actions**: Always add notes when acknowledging or resolving
4. **Assign Appropriately**: Assign alerts to the right team members

### Investigation Workflow

1. **Start Early**: Create investigations as soon as threats are identified
2. **Collect Evidence**: Document all evidence systematically
3. **Update Status**: Keep investigation status current
4. **Collaborate**: Use notes to collaborate with team members

### Report Generation

1. **Schedule Regular Reports**: Set up automated reports for routine reviews
2. **Customize Templates**: Create custom report templates for your needs
3. **Review Before Sending**: Always review reports before distribution
4. **Archive Reports**: Keep historical reports for compliance

---

## Troubleshooting

### Common Issues

#### Cannot Access Dashboards

**Solution**:
1. Check user permissions
2. Verify dashboard exists
3. Clear browser cache
4. Contact administrator

#### Alerts Not Showing

**Solution**:
1. Check alert filters
2. Verify time range
3. Check user permissions
4. Review alert configuration

#### Reports Not Generating

**Solution**:
1. Verify report parameters
2. Check data availability for time range
3. Review report template
4. Check system logs

---

## Support and Resources

### Getting Help

- **In-App Help**: Click help icon (?) in top navigation
- **Documentation**: Access full documentation from Settings → Documentation
- **Support Portal**: Contact support through Settings → Support
- **Training**: Access training materials from Settings → Training

### Additional Resources

- User guides and tutorials
- Video training materials
- API documentation (for developers)
- Community forums
- Knowledge base articles

---

*This documentation is continuously updated. Last updated: 2024*

