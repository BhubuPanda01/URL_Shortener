import prisma from '../config/database';
import { AnalyticsResponse } from '../types';

export const trackClick = async (urlId: string, ipAddress: string | null, userAgent: string | null) => {
  await prisma.click.create({
    data: {
      urlId,
      ipAddress,
      userAgent,
    },
  });
};

export const getAnalytics = async (shortCode: string): Promise<AnalyticsResponse | null> => {
  const urlRecord = await prisma.url.findUnique({
    where: { shortCode },
    include: {
      clicks: {
        orderBy: { clickedAt: 'desc' },
      },
    },
  });

  if (!urlRecord) {
    return null;
  }

  const totalClicks = urlRecord.clicks.length;

  // Group clicks by date (YYYY-MM-DD)
  const clicksByDateMap = new Map<string, number>();
  for (const click of urlRecord.clicks) {
    const dateStr = click.clickedAt.toISOString().split('T')[0];
    clicksByDateMap.set(dateStr, (clicksByDateMap.get(dateStr) || 0) + 1);
  }

  const clicksByDate = Array.from(clicksByDateMap.entries()).map(([date, count]) => ({
    date,
    count,
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Recent clicks (limit to top 10 for the response)
  const recentClicks = urlRecord.clicks.slice(0, 10).map((click) => ({
    clickedAt: click.clickedAt,
    ipAddress: click.ipAddress,
    userAgent: click.userAgent,
  }));

  return {
    shortCode: urlRecord.shortCode,
    originalUrl: urlRecord.originalUrl,
    createdAt: urlRecord.createdAt,
    totalClicks,
    clicksByDate,
    recentClicks,
  };
};
