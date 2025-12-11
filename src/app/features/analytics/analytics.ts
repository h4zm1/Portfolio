import { Request, Response } from 'express'
import NodeCache from 'node-cache'

//cache for 1 hour
const cache = new NodeCache({ stdTTL: 3600 })

export async function getAnalytics(req: Request, res: Response) {
  const days = parseInt(req.query['days'] as string) || 30;

  //check cache first
  const cached = cache.get('analytics-${days}');
  if (cached) return res.json(cached);

  //calculate date range
  const endDate = new Date().toISOString().split('T')[0];
  // Date.now() return milliseconds
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  //graphQL query for cloudflare ap
  const query = `{
    viewer {
      zones(filter: { zoneTag: "${process.env['CLOUDFLARE_ZONE_ID']}" }) {
        httpRequests1dGroups(
          limit: ${days}
          filter: { date_geq: "${startDate}", date_leq: "${endDate}" }
          orderBy: [date_ASC]
        ) {
          dimensions { date }
          uniq { uniques }
        }
      }
    }
  }`;
  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env['CLOUDFLARE_API_TOKEN']}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json()
    //transform response to line chart
    const chartData = data.data.viewer.zones[0]?.httpRequests1dGroups.map(
      (g: any) => ({
        name: new Date(g.dimensions.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        value: g.uniq.uniques
      })
    ) || [];

    //cache it
    cache.set('analytics-${days}', chartData);
    return res.json(chartData);

  } catch (error) {
    return res.status(500).json({ error: 'failed to fetch analytics!!' });
  }
}
