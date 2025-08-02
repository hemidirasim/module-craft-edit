import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { BarChart3, Globe, Clock, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  totalUsage: number;
  activeWidgets: number;
  topDomains: { domain: string; count: number }[];
  usageToday: number;
  recentActivity: any[];
}

export const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsage: 0,
    activeWidgets: 0,
    topDomains: [],
    usageToday: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      // Get total widget usage count
      const { data: widgets, error: widgetsError } = await (supabase as any)
        .from('editor_widgets')
        .select(`
          usage_count,
          is_active,
          workspaces!inner(user_id)
        `)
        .eq('workspaces.user_id', user?.id);

      if (widgetsError) throw widgetsError;

      // Get recent usage data
      const { data: usageData, error: usageError } = await (supabase as any)
        .from('widget_usage')
        .select(`
          domain,
          created_at,
          editor_widgets!inner(
            workspaces!inner(user_id)
          )
        `)
        .eq('editor_widgets.workspaces.user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (usageError) throw usageError;

      // Calculate analytics
      const totalUsage = widgets?.reduce((sum, widget) => sum + (widget.usage_count || 0), 0) || 0;
      const activeWidgets = widgets?.filter(widget => widget.is_active).length || 0;

      // Get today's usage
      const today = new Date().toISOString().split('T')[0];
      const usageToday = usageData?.filter(usage => 
        usage.created_at.startsWith(today)
      ).length || 0;

      // Get top domains
      const domainCounts = usageData?.reduce((acc, usage) => {
        acc[usage.domain] = (acc[usage.domain] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topDomains = Object.entries(domainCounts)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalytics({
        totalUsage,
        activeWidgets,
        topDomains,
        usageToday,
        recentActivity: usageData?.slice(0, 10) || []
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">
          Monitor your widget usage and performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              Across all widgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Widgets</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeWidgets}</div>
            <p className="text-xs text-muted-foreground">
              Currently deployed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.usageToday}</div>
            <p className="text-xs text-muted-foreground">
              Widget loads today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Domain</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.topDomains[0]?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.topDomains[0]?.domain || 'No data yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Domains */}
      <Card>
        <CardHeader>
          <CardTitle>Top Domains</CardTitle>
          <CardDescription>
            Domains where your widgets are most used
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topDomains.length > 0 ? (
            <div className="space-y-4">
              {analytics.topDomains.map((domain, index) => (
                <div key={domain.domain} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">#{index + 1}</span>
                    <span>{domain.domain}</span>
                  </div>
                  <span className="text-muted-foreground">{domain.count} uses</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No usage data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest widget usage across your domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <span className="font-medium">{activity.domain}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};