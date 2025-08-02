import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { WorkspacesSection } from '@/components/dashboard/WorkspacesSection';
import { WidgetsSection } from '@/components/dashboard/WidgetsSection';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { SettingsSection } from '@/components/dashboard/SettingsSection';

export const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('workspaces');

  const renderSection = () => {
    switch (activeSection) {
      case 'workspaces':
        return <WorkspacesSection />;
      case 'widgets':
        return <WidgetsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <WorkspacesSection />;
    }
  };

  return (
    <DashboardLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
    >
      {renderSection()}
    </DashboardLayout>
  );
};