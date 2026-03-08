import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Achievement } from '@/types/achievement';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = 220;

interface ChartDataPoint {
  label: string;
  count: number;
}

function getWeeklyData(achievements: Achievement[]): ChartDataPoint[] {
  const today = new Date();
  const weekData: Record<string, number> = {};

  // 지난 12주 데이터 생성
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    weekData[label] = 0;
  }

  // 완료 기록 집계
  achievements.forEach((achievement) => {
    achievement.completionHistory.forEach((dateStr) => {
      const date = new Date(dateStr);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
      if (label in weekData) {
        weekData[label]++;
      }
    });
  });

  return Object.entries(weekData).map(([label, count]) => ({ label, count }));
}

function getMonthlyData(achievements: Achievement[]): ChartDataPoint[] {
  const today = new Date();
  const monthData: Record<string, number> = {};

  // 지난 12개월 데이터 생성
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const label = `${date.getMonth() + 1}월`;
    monthData[label] = 0;
  }

  // 완료 기록 집계
  achievements.forEach((achievement) => {
    achievement.completionHistory.forEach((dateStr) => {
      const date = new Date(dateStr);
      const label = `${date.getMonth() + 1}월`;
      if (label in monthData) {
        monthData[label]++;
      }
    });
  });

  return Object.entries(monthData).map(([label, count]) => ({ label, count }));
}

interface CompletionChartProps {
  achievements: Achievement[];
  chartType: 'weekly' | 'monthly';
}

export function CompletionChart({ achievements, chartType }: CompletionChartProps) {
  const { chartData, maxCount } = useMemo(() => {
    const data = chartType === 'weekly' ? getWeeklyData(achievements) : getMonthlyData(achievements);
    const counts = data.map((d) => d.count);
    const max = Math.max(...counts, 5);
    return { chartData: data, maxCount: max };
  }, [achievements, chartType]);

  if (chartData.every((d) => d.count === 0)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>아직 완료 기록이 없습니다</Text>
      </View>
    );
  }

  // 차트 렌더링을 위한 계산
  const barWidth = CHART_WIDTH / chartData.length;
  const padding = 8;
  const barActualWidth = barWidth - padding * 2;
  const maxBarHeight = CHART_HEIGHT - 60; // 레이블 공간 제외

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        {/* Y축 레이블 */}
        <View style={styles.yAxisLabels}>
          {[maxCount, Math.floor(maxCount * 0.75), Math.floor(maxCount * 0.5), Math.floor(maxCount * 0.25), 0].map(
            (value, i) => (
              <Text key={i} style={styles.yAxisLabel}>
                {value}
              </Text>
            )
          )}
        </View>

        {/* 차트 영역 */}
        <View style={styles.chartArea}>
          {/* 그리드 라인 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <View
              key={`grid-${i}`}
              style={[
                styles.gridLine,
                {
                  top: maxBarHeight * (1 - ratio),
                },
              ]}
            />
          ))}

          {/* 바 차트 */}
          <View style={styles.barsContainer}>
            {chartData.map((data, index) => {
              const barHeight = (data.count / maxCount) * maxBarHeight;
              return (
                <View key={index} style={[styles.barWrapper, { width: barWidth }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        width: barActualWidth,
                        marginBottom: maxBarHeight - barHeight,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{data.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  chartWrapper: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 12,
  },
  yAxisLabels: {
    width: 35,
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingTop: 4,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    height: CHART_HEIGHT,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#1E2A3A',
    opacity: 0.5,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  barLabel: {
    fontSize: 9,
    color: '#718096',
    marginTop: 6,
    textAlign: 'center',
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E2A3A',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
  },
});
